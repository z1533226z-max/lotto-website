// 지시 187: 검수 182 의 F1·F2·F4·F5 재현 시험 (수정 전 실패 → 수정 후 통과)
const assert = require('node:assert/strict');
const { test } = require('node:test');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { loadTs } = require('./_loadTs.cjs');

const TAG = 'lotto-latest';
const last = (all) => all[all.length - 1];
const WIN = [3, 12, 24, 33, 39, 42];

// ---------- 공개 출처(가짜) ----------
// gon-services 는 1246 회까지만 가지고 늦게 반영된다. 1247 회는 published 에 따라 smok95·동행복권에 나타난다.
function createWorld() {
  const world = { gonLast: 1246, published: {}, calls: [] };
  const gonItem = (n) => ({
    round: n, drawDate: '2026-10-17', numbers: [1, 2, 3, 4, 5, 6], bonusNumber: 7,
    prizeMoney: { first: 1_500_000_000, firstWinners: 12, second: 55_000_000, secondWinners: 75 },
  });
  world.upstream = async (url) => {
    if (url === 'https://gon.test/api/v1/lotto/results') {
      return Response.json([1244, 1245, 1246].filter((n) => n <= world.gonLast).map(gonItem));
    }
    let m = /gon\.test\/api\/v1\/lotto\/round\/(\d+)$/.exec(url);
    if (m) return Number(m[1]) <= world.gonLast ? Response.json(gonItem(Number(m[1]))) : new Response('nf', { status: 404 });
    m = /smok95\.github\.io\/lotto\/results\/(\d+)\.json/.exec(url);
    if (m) {
      const p = world.published[m[1]];
      if (!p?.smok95) return new Response('nf', { status: 404 });
      return Response.json({
        draw_no: Number(m[1]), date: '2026-10-24T00:00:00Z', numbers: WIN, bonus_no: 7,
        divisions: p.smok95 === 'complete'
          ? [{ prize: 2_000_000_000, winners: 10 }, { prize: 50_000_000, winners: 70 }]
          : [], // 번호만 먼저 올라오고 당첨금·인원은 아직 미집계
      });
    }
    m = /drwNo=(\d+)/.exec(url);
    if (m) {
      if (!world.published[m[1]]?.dhl) return new Response('{"returnValue":"fail"}'); // 발표 전에도 200
      return new Response(JSON.stringify({
        returnValue: 'success', drwNo: Number(m[1]), drwNoDate: '2026-10-24',
        drwtNo1: 3, drwtNo2: 12, drwtNo3: 24, drwtNo4: 33, drwtNo5: 39, drwtNo6: 42, bnusNo: 7,
        firstWinamnt: 2_000_000_000, firstPrzwnerCo: 10, secondWinamnt: 50_000_000, secondPrzwnerCo: 70,
      }));
    }
    throw new Error(`unexpected fetch ${url}`);
  };
  return world;
}

// ---------- Next 데이터 캐시 ----------
// 지시 192: 가짜 캐시 규칙 대신 설치된 Next 14.2 의 patchFetch·unstable_cache·revalidateTag·FileSystemCache 를 그대로 쓴다.
// 리전 캐시 하나를 여러 인스턴스(dataFetcher 를 따로 불러온 것)가 함께 쓴다 — Vercel 의 리전 공유 Data Cache 와 같은 역할.
const rt = require('./_nextRuntime.cjs');
function useWorld(world) {
  rt.setUpstream((url) => world.upstream(url));
  rt.resetCalls();
  world.calls = rt.calls;
  return rt.createRegionCache();
}
const loadInstance = () => rt.loadDataFetcher();
// 페이지 하나를 다시 만드는 요청처럼 실행 (ISR 재생성 = 정적 생성 저장소)
const render = (region, instance, path = '/lotto/1247') =>
  rt.run(region, () => instance.getAllLottoData(), { path, isStaticGeneration: true, revalidate: 3600 }).then((r) => r.value);

// 실제 draw-refresh 라우트를 cron 인스턴스로 실행. revalidateTag/revalidatePath 는 Next 그대로, 응답 뒤에 데이터 캐시에 적용된다.
async function runDrawRefresh(cronInstance, region) {
  const route = loadTs('@/app/api/cron/draw-refresh/route', {
    mocks: {
      'next/server': { NextResponse: { json: (body, init) => Response.json(body, init) } },
      'next/cache': rt.nextCache,
      '@/lib/dataFetcher': cronInstance,
    },
    globals: { process: { env: { CRON_SECRET: 'test-only' } }, console: { log() {}, error() {} } },
  });
  const { value: res, revalidatedTags } = await rt.run(region,
    () => route.GET(new Request('http://test.invalid', { headers: { authorization: 'Bearer test-only' } })),
    { path: '/api/cron/draw-refresh' });
  const revalidated = revalidatedTags.filter((t) => t.startsWith('_N_T_')).map((t) => t.slice('_N_T_'.length));
  return { res, body: await res.json(), revalidated, tags: revalidatedTags.filter((t) => !t.startsWith('_N_T_')) };
}

// ---------- F1 ----------
test('F1: cron 인스턴스가 새 회차를 받으면 다른 웹 인스턴스도 바로 새 회차를 읽는다(구회차 메모리·데이터 캐시 잔존 없음)', async () => {
  const world = createWorld();
  const region = useWorld(world);
  const web = loadInstance();
  const cron = loadInstance();

  // 20:36 웹이 먼저 열림: 아직 발표 전 → 1246 ('없음'·동행복권 'fail' 확인 결과가 데이터 캐시에 60초 담김)
  assert.equal(last(await render(region, web)).round, 1246);

  world.published[1247] = { smok95: 'complete', dhl: true };
  // cron 전: 같은 60초 안이면 웹은 담아 둔 '없음'을 다시 쓴다(외부 조회 없음)
  const before = world.calls.length;
  assert.equal(last(await render(region, web)).round, 1246);
  assert.equal(world.calls.length, before);

  const { body, revalidated, tags } = await runDrawRefresh(cron, region);
  assert.equal(body.latestRound, 1247);
  assert.equal(body.pending, false);
  assert.ok(revalidated.includes('/') && revalidated.includes('/lotto/1247'));

  // 웹 인스턴스(메모리에 1246 보유)에서 페이지가 다시 만들어질 때 cron 직후 바로 새 회차를 읽어야 한다
  const webLast = last(await render(region, web));
  assert.equal(webLast.round, 1247, `web=${webLast.round}`);
  assert.equal(webLast.prizeMoney.first, 2_000_000_000);
  assert.deepEqual(tags, [TAG], 'cron 은 새 번호 확인 뒤 최신 확인 태그만 무효화해야 한다');
});

test('F1: 새 회차 확인을 거친 페이지는 최신 확인 태그·60초 주기가 기록되고, cron 은 캐시를 거치지 않는다', async () => {
  const world = createWorld();
  const region = useWorld(world);
  const { store } = await rt.run(region, () => loadInstance().getAllLottoData(), { path: '/', isStaticGeneration: true, revalidate: 3600 });
  assert.ok(store.tags.includes(TAG), `태그 없음: ${store.tags}`);
  assert.ok(store.revalidate <= 60, `새 회차 확인이 오래 캐시됨: ${store.revalidate}`);

  world.published[1247] = { smok95: 'complete', dhl: true };
  world.calls.length = 0;
  await runDrawRefresh(loadInstance(), region);
  assert.ok(world.calls.length > 0);
  for (const c of world.calls) assert.equal(c.cache, 'no-store', `cron 이 캐시를 읽음: ${c.url}`);
});

test('F1: 최신 회차·당첨금이 확인된 뒤에는 메모리 캐시를 다시 써서 외부 조회를 반복하지 않는다', async () => {
  const world = createWorld();
  world.published[1247] = { smok95: 'complete', dhl: true };
  const region = useWorld(world);
  const web = loadInstance();
  assert.equal(last(await render(region, web)).round, 1247);
  const before = world.calls.length;
  await render(region, web);
  assert.equal(world.calls.length, before);
});

// ---------- F2 ----------
const status = () => loadTs('@/lib/prizeStatus');
const Detail = () => loadTs('@/components/lotto/LottoRoundDetail').default;
const rss = () => loadTs('@/lib/rss');
const draw = (prizeMoney, round = 1247) => ({ round, drawDate: '2026-10-24', numbers: WIN, bonusNumber: 7, prizeMoney });

test('F2: 번호만 먼저 나온 회차(당첨금 미집계)는 "집계 중"으로 보이고 이월로 표시하지 않는다', async () => {
  const world = createWorld();
  const region = useWorld(world);
  const web = loadInstance();
  world.published[1247] = { smok95: 'pending' };

  const pendingLast = last(await render(region, web));
  assert.equal(pendingLast.round, 1247);
  assert.equal(status().isPrizePending(pendingLast), true);
  const html = renderToStaticMarkup(React.createElement(Detail(), { data: pendingLast, maxRound: 1247 }));
  assert.ok(!html.includes('이월'), '미집계를 이월로 표시함');
  assert.match(html, /당첨금 집계 중/);
  const item = rss().roundToRssItem(pendingLast);
  assert.ok(!item.html.includes('이월'));
  assert.match(item.html, /집계 중/);

  // 집계가 끝나면 다음 cron 에서 완료로 바뀌고, 웹 인스턴스도 미집계 값을 붙들고 있지 않는다
  world.published[1247] = { smok95: 'complete' };
  const { body } = await runDrawRefresh(loadInstance(), region);
  assert.equal(body.prizePending, false);
  const done = last(await render(region, web));
  assert.equal(done.prizeMoney.first, 2_000_000_000);
  assert.equal(done.prizeMoney.firstWinners, 10);
});

test('F2: draw-refresh 완료 판정은 당첨금까지 본다 (번호만 있으면 prizePending)', async () => {
  const world = createWorld();
  const region = useWorld(world);
  world.published[1247] = { smok95: 'pending' };
  const { res, body, revalidated } = await runDrawRefresh(loadInstance(), region);
  assert.equal(res.status, 200);
  assert.equal(body.latestRound, 1247);
  assert.equal(body.pending, false); // 번호는 반영됨 → 페이지는 다시 만든다
  assert.equal(body.prizePending, true);
  assert.equal(body.complete, false);
  assert.ok(revalidated.includes('/lotto/1247'));
});

test('F2: 집계가 끝난 1등 0명(2등 당첨 확인)만 이월로 표시', () => {
  const s = status();
  const rollover = draw({ first: 0, firstWinners: 0, second: 90_000_000, secondWinners: 40 });
  const pending = draw({ first: 0, firstWinners: 0, second: 0, secondWinners: 0 });
  assert.equal(s.isPrizePending(rollover), false);
  assert.equal(s.isPrizePending(pending), true);
  // 2등 0명이 실제로 있었던 2002년 3·5회는 미집계로 보지 않는다
  assert.equal(s.isPrizePending(draw({ first: 0, firstWinners: 0, second: 0, secondWinners: 0 }, 5)), false);
  const html = renderToStaticMarkup(React.createElement(Detail(), { data: rollover, maxRound: 1247 }));
  assert.match(html, /1등 당첨자 없음 \(당첨금 이월\)/);
  assert.match(rss().roundToRssItem(rollover).html, /1등 당첨자 없음 \(당첨금 이월\)/);
});

// ---------- F4 ----------
const textNodes = (html) => html
  .replace(/<!-- -->/g, '')
  .split(/<[^>]+>/)
  .map((s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/\s+/g, ' ').trim())
  .filter(Boolean);
const plain = (html) => textNodes(html).join(' ');

test('F4: RSS 회차 item 에 웹 회차 본문(당첨금·판매점·패턴 분석) 글이 모두 들어간다', () => {
  const data = draw({ first: 2_000_000_000, firstWinners: 10, second: 50_000_000, secondWinners: 70 });
  data.numbers = [3, 4, 24, 33, 39, 42]; // 연속번호 1쌍
  const stores = [
    { name: '행운복권방', address: '서울 강남구 테헤란로 1', purchaseType: '자동' },
    { name: '대박마트', address: '경기 수원시 팔달구 2', purchaseType: '수동' },
  ];
  const Stores = loadTs('@/components/lotto/RoundWinningStores').default;
  const page = renderToStaticMarkup(React.createElement(Detail(), { data, maxRound: 1247 },
    React.createElement(Stores, { round: 1247, firstWinners: 10, stores })));
  const item = rss().roundToRssItem(data, stores);
  const feed = plain(item.html);
  // 화면 이동용 링크 글자(이전·다음 회차, 전체 목록, 세금 계산기)만 뺀 모든 본문 글
  const nav = new Set(['← 1246회', '전체 목록', '세금 계산기', '판매점 페이지']);
  const missing = textNodes(page).filter((t) => !nav.has(t) && !feed.includes(t));
  assert.deepEqual(missing, []);
  for (const t of ['저번호(1~22)', '연속번호가 1쌍', '번호대별 분포', '1~9: 2개', '행운복권방', '자동 1 · 수동 1 · 반자동 0']) {
    assert.ok(feed.includes(t), t);
  }
});

test('F4: 판매점 조회가 안 되면 RSS 에도 화면과 같은 대체 문구', () => {
  const data = draw({ first: 2_000_000_000, firstWinners: 10, second: 50_000_000, secondWinners: 70 });
  const feed = plain(rss().roundToRssItem(data, null).html);
  assert.ok(feed.includes('1247회 1등 판매점 정보는 동행복권 발표 후 순차 반영됩니다.'));
});

// ---------- F5 ----------
function hangingSupabase(state) {
  const builder = {
    select() { return builder; },
    eq() { return builder; },
    order() { return builder; },
    abortSignal(signal) { state.signal = signal; return builder; },
    then() { /* 응답이 영영 오지 않음 */ },
  };
  return { getServiceSupabase: () => ({ from: () => builder }) };
}

test('F5: 판매점 조회가 응답하지 않으면 2초 안에 null 로 끝내고 요청도 취소한다', async () => {
  const state = {};
  const ws = loadTs('@/lib/winningStores', { mocks: { '@/lib/supabase': hangingSupabase(state) } });
  assert.equal(ws.STORE_QUERY_TIMEOUT_MS, 2000);
  const started = Date.now();
  assert.equal(await ws.getFirstPrizeStores(1247), null);
  const took = Date.now() - started;
  assert.ok(took >= 1900 && took < 2600, `${took}ms`);
  assert.equal(state.signal?.aborted, true);
});

test('F5: 판매점이 무응답이어도 회차 페이지 본문은 정상으로 나오고 판매점 칸만 대체 문구', async () => {
  const data = draw({ first: 2_000_000_000, firstWinners: 10, second: 50_000_000, secondWinners: 70 });
  const page = loadTs('@/app/lotto/[round]/page', {
    mocks: {
      'next/navigation': { notFound() { throw new Error('notFound'); } },
      '@/lib/dataFetcher': {
        getAllLottoData: async () => [data],
        getEstimatedLatestRound: () => 1247,
        getLatestRound: (all) => all[all.length - 1],
      },
      '@/lib/supabase': hangingSupabase({}),
    },
  });
  const started = Date.now();
  const element = await page.default({ params: { round: '1247' } });
  const html = renderToStaticMarkup(element);
  assert.ok(Date.now() - started < 2600);
  assert.match(html, /로또 1247회 당첨번호/);
  assert.match(html, /2,000,000,000원/);
  assert.match(html, /순차 반영/);
});
