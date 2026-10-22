// 지시 187: 검수 182 의 F1·F2·F4·F5 재현 시험 (수정 전 실패 → 수정 후 통과)
const assert = require('node:assert/strict');
const { test } = require('node:test');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { loadTs } = require('./_loadTs.cjs');

const TAG = 'lotto-data';
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

// ---------- Next 데이터 캐시(가짜, 모든 인스턴스가 함께 씀 — Vercel 의 리전 공유 Data Cache 와 같은 역할) ----------
// Next 14.2 patch-fetch 와 같은 규칙: 200 응답만 저장, cache:'no-store' 는 읽지도 쓰지도 않음,
// next 옵션이 없는 fetch 도 페이지 주기(3600초)로 저장(auto cache), revalidateTag 는 그 태그 항목을 지운다.
function createDataCache(world) {
  const entries = new Map();
  const fetch = async (url, init = {}) => {
    const next = init.next || {};
    world.calls.push({ url, cache: init.cache, tags: next.tags || [], revalidate: next.revalidate });
    const cacheable = init.cache !== 'no-store' && next.revalidate !== 0;
    const hit = cacheable && entries.get(url);
    if (hit && hit.expiresAt > Date.now()) return new Response(hit.body, { status: 200 });
    const res = await world.upstream(url);
    if (!cacheable || res.status !== 200) return res;
    const body = await res.text();
    entries.set(url, { body, tags: next.tags || [], expiresAt: Date.now() + 1000 * (next.revalidate ?? 3600) });
    return new Response(body, { status: 200 });
  };
  const revalidateTag = (tag) => { for (const [k, e] of entries) if (e.tags.includes(tag)) entries.delete(k); };
  return { fetch, revalidateTag, entries };
}

// 서버 인스턴스 하나 = dataFetcher 모듈을 따로 한 번 더 불러온 것 (메모리 캐시가 따로 생김)
function loadInstance(dataCache) {
  return loadTs('@/lib/dataFetcher', {
    mocks: {
      react: { cache: (fn) => fn },
      '@/data/realLottoData': { REAL_LOTTO_DATA: [] },
      '@/lib/drawSchedule': { getLatestDrawnRound: () => 1247 }, // 토요일 20:35 추첨이 끝난 뒤
    },
    globals: { fetch: dataCache.fetch, process: { env: { GON_SERVICES_URL: 'https://gon.test' } } },
  });
}

// 실제 draw-refresh 라우트를 cron 인스턴스로 실행. revalidateTag/revalidatePath 는 Next 처럼 응답 뒤에 적용한다.
async function runDrawRefresh(cronInstance, dataCache) {
  const revalidated = [];
  const tags = [];
  const route = loadTs('@/app/api/cron/draw-refresh/route', {
    mocks: {
      'next/server': { NextResponse: { json: (body, init) => Response.json(body, init) } },
      'next/cache': { revalidatePath: (p) => revalidated.push(p), revalidateTag: (t) => tags.push(t) },
      '@/lib/dataFetcher': cronInstance,
    },
    globals: { process: { env: { CRON_SECRET: 'test-only' } }, console: { log() {}, error() {} } },
  });
  const res = await route.GET(new Request('http://test.invalid', { headers: { authorization: 'Bearer test-only' } }));
  tags.forEach(dataCache.revalidateTag);
  return { res, body: await res.json(), revalidated, tags };
}

// ---------- F1 ----------
test('F1: cron 인스턴스가 새 회차를 받으면 다른 웹 인스턴스도 바로 새 회차를 읽는다(구회차 메모리·데이터 캐시 잔존 없음)', async () => {
  const world = createWorld();
  const dataCache = createDataCache(world);
  const web = loadInstance(dataCache);
  const cron = loadInstance(dataCache);

  // 20:36 웹이 먼저 열림: 아직 발표 전 → 1246 (동행복권 'fail' 200 응답이 데이터 캐시에 들어갈 수 있음)
  assert.equal(last(await web.getAllLottoData()).round, 1246);

  world.published[1247] = { smok95: 'complete', dhl: true };
  const { body, revalidated, tags } = await runDrawRefresh(cron, dataCache);
  assert.equal(body.latestRound, 1247);
  assert.equal(body.pending, false);
  assert.ok(revalidated.includes('/') && revalidated.includes('/lotto/1247'));

  // 웹 인스턴스(메모리에 1246 보유)에서 페이지가 다시 만들어질 때 새 회차를 읽어야 한다
  const webLast = last(await web.getAllLottoData());
  assert.equal(webLast.round, 1247, `web=${webLast.round}`);
  assert.equal(webLast.prizeMoney.first, 2_000_000_000);
  assert.ok(tags.includes(TAG), 'cron 은 공유 데이터 캐시 태그를 무효화해야 한다');
});

test('F1: 외부 조회는 공유 캐시 태그를 달고, 새 회차 확인은 짧게(60초 이하), cron 은 캐시를 거치지 않는다', async () => {
  const world = createWorld();
  const dataCache = createDataCache(world);
  const web = loadInstance(dataCache);
  await web.getAllLottoData();
  const webCalls = world.calls.splice(0);
  assert.ok(webCalls.length > 1);
  for (const c of webCalls) {
    assert.ok(c.tags.includes(TAG), `태그 없음: ${c.url}`);
    if (!c.url.endsWith('/lotto/results')) assert.ok(c.revalidate <= 60, `새 회차 확인이 오래 캐시됨: ${c.url} ${c.revalidate}`);
  }

  world.published[1247] = { smok95: 'complete', dhl: true };
  await runDrawRefresh(loadInstance(dataCache), dataCache);
  for (const c of world.calls.splice(0)) assert.equal(c.cache, 'no-store', `cron 이 캐시를 읽음: ${c.url}`);
});

test('F1: 최신 회차·당첨금이 확인된 뒤에는 메모리 캐시를 다시 써서 외부 조회를 반복하지 않는다', async () => {
  const world = createWorld();
  world.published[1247] = { smok95: 'complete', dhl: true };
  const web = loadInstance(createDataCache(world));
  assert.equal(last(await web.getAllLottoData()).round, 1247);
  const before = world.calls.length;
  await web.getAllLottoData();
  assert.equal(world.calls.length, before);
});

// ---------- F2 ----------
const status = () => loadTs('@/lib/prizeStatus');
const Detail = () => loadTs('@/components/lotto/LottoRoundDetail').default;
const rss = () => loadTs('@/lib/rss');
const draw = (prizeMoney, round = 1247) => ({ round, drawDate: '2026-10-24', numbers: WIN, bonusNumber: 7, prizeMoney });

test('F2: 번호만 먼저 나온 회차(당첨금 미집계)는 "집계 중"으로 보이고 이월로 표시하지 않는다', async () => {
  const world = createWorld();
  const dataCache = createDataCache(world);
  const web = loadInstance(dataCache);
  world.published[1247] = { smok95: 'pending' };

  const pendingLast = last(await web.getAllLottoData());
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
  const { body } = await runDrawRefresh(loadInstance(dataCache), dataCache);
  assert.equal(body.prizePending, false);
  const done = last(await web.getAllLottoData());
  assert.equal(done.prizeMoney.first, 2_000_000_000);
  assert.equal(done.prizeMoney.firstWinners, 10);
});

test('F2: draw-refresh 완료 판정은 당첨금까지 본다 (번호만 있으면 prizePending)', async () => {
  const world = createWorld();
  const dataCache = createDataCache(world);
  world.published[1247] = { smok95: 'pending' };
  const { res, body, revalidated } = await runDrawRefresh(loadInstance(dataCache), dataCache);
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
