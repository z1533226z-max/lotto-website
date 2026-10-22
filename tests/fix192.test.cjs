// 지시 192: 검수 189 의 N1·N2 재현 시험 (수정 전 실패 → 수정 후 통과)
// N1: 발표 전 '없음'(404·200 fail·timeout) 확인이 방문 요청마다 외부로 나가던 것 → 60초 재사용 + 동시 요청 합치기
// N2: 공통 태그 하나가 과거 회차까지 묶어 미발표 cron 도 넓게 무효화하던 것 → 확정 자료/최신 확인 태그 분리 + 판단 뒤 무효화
// 캐시는 흉내 내지 않고 설치된 Next 14.2.30 의 patchFetch·unstable_cache·revalidateTag·IncrementalCache(FileSystemCache) 로 돈다.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { loadTs } = require('./_loadTs.cjs');
const rt = require('./_nextRuntime.cjs');

const PAID = { first: 1_000_000_000, firstWinners: 10, second: 50_000_000, secondWinners: 70 };
const record = (n) => ({ round: n, drawDate: '2026-10-17', numbers: [1, 2, 3, 4, 5, 6], bonusNumber: 7, prizeMoney: PAID });
const last = (all) => all[all.length - 1];

// 검수 189 recheck.cjs 와 같은 출처 상태: 추첨 뒤 1247 예상, gon 전체는 1246 까지, gon 단건·smok95 1247 은 404, 동행복권은 200 fail
// published 는 smok95 가, gonPublished 는 gon-services(전체·단건)가 1247 을 먼저 공개한 상태
function createWorld() {
  const w = { published: false, gonPublished: false, paid: true, hang: false, gonDown: false };
  w.upstream = async (url, init = {}) => {
    if (url.endsWith('/api/v1/lotto/results')) {
      const rounds = [1, 2, 1244, 1245, 1246, ...(w.gonPublished ? [1247] : [])];
      return w.gonDown ? new Response('down', { status: 500 }) : Response.json(rounds.map(record));
    }
    if (w.gonPublished && url.endsWith('/api/v1/lotto/round/1247')) return Response.json(record(1247));
    if (w.hang && !url.includes('gon.test')) {
      // 응답이 오지 않다가 제품의 AbortSignal.timeout(5초)으로 끊김
      return new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(init.signal.reason)));
    }
    if (w.published && /smok95.*\/1247\.json/.test(url)) {
      return Response.json({
        draw_no: 1247, date: '2026-10-24T00:00:00Z', numbers: [3, 12, 24, 33, 39, 42], bonus_no: 7,
        divisions: w.paid ? [{ prize: 2_000_000_000, winners: 10 }, { prize: 50_000_000, winners: 70 }] : [],
      });
    }
    if (url.includes('dhlottery')) return Response.json({ returnValue: 'fail' }); // 발표 전에도 200
    return new Response('missing', { status: 404 });
  };
  rt.setUpstream((url, init) => w.upstream(url, init));
  rt.resetCalls();
  return w;
}
const originCalls = () => rt.calls.length;
const byUrl = () => rt.calls.reduce((m, c) => ({ ...m, [c.url]: (m[c.url] || 0) + 1 }), {});
// 발표 전 1247 확인 한 바퀴: gon 전체 1 + gon 단건 1 + smok95 1 + 동행복권 1 = 4회
// (192 의 기준 3회에서 gon 단건 1회 추가 — 지시 197 C2: 방금 받은 gon 전체 목록이어도 단건을 생략하지 않는다)
const PENDING_PROBE = {
  'https://gon.test/api/v1/lotto/results': 1,
  'https://gon.test/api/v1/lotto/round/1247': 1,
  'https://smok95.github.io/lotto/results/1247.json': 1,
  'https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=1247': 1,
};

// 실제 통계 API 라우트 (홈 번호 생성기가 부르는 동적 API — 검수 189 재현 경로)
function statsRoute(instance) {
  return loadTs('@/app/api/lotto/statistics/route', {
    mocks: { '@/lib/dataFetcher': instance, 'next/server': { NextResponse: { json: (b, i) => Response.json(b, i) } } },
    globals: { URL },
  });
}
async function getStats(region, route) {
  const { value } = await rt.run(region, () => route.GET(new Request('https://test.invalid/api/lotto/statistics')), { path: '/api/lotto/statistics' });
  assert.equal(value.status, 200);
  return value.json();
}

// ---------- N1 ----------
test('N1: 발표 전 같은 인스턴스 연속 10요청 — 외부 호출 4회(gon 전체 1·gon 단건 1·smok95 1·동행복권 1), 검수 재현 22회 → 기준 4회', async () => {
  createWorld();
  const region = rt.createRegionCache();
  const route = statsRoute(rt.loadDataFetcher());
  for (let i = 0; i < 10; i++) await getStats(region, route);
  assert.deepEqual(byUrl(), PENDING_PROBE);
});

test('N1: 발표 전 동시 10요청도 한 번으로 합친다', async () => {
  createWorld();
  const region = rt.createRegionCache();
  const route = statsRoute(rt.loadDataFetcher());
  await Promise.all(Array.from({ length: 10 }, () => getStats(region, route)));
  assert.deepEqual(byUrl(), PENDING_PROBE);
});

test('N1: 인스턴스가 여러 개여도 리전 캐시의 "없음"을 함께 쓴다', async () => {
  createWorld();
  const region = rt.createRegionCache();
  const routes = Array.from({ length: 5 }, () => statsRoute(rt.loadDataFetcher()));
  for (const route of routes) for (let i = 0; i < 2; i++) await getStats(region, route);
  assert.deepEqual(byUrl(), PENDING_PROBE);
});

test('N1: 출처 무응답(timeout)도 실패로 60초 재사용 — 동시 10요청이 5초 한 번만 기다리고 외부 4회', async (t) => {
  const world = createWorld();
  world.hang = true;
  const keepAlive = setInterval(() => {}, 1000); // AbortSignal.timeout 타이머는 이벤트 루프를 붙잡지 않는다 (서버에서는 상관없음)
  t.after(() => clearInterval(keepAlive));
  const region = rt.createRegionCache();
  const route = statsRoute(rt.loadDataFetcher());
  const started = Date.now();
  await Promise.all(Array.from({ length: 10 }, () => getStats(region, route)));
  for (let i = 0; i < 10; i++) await getStats(region, route);
  const took = Date.now() - started;
  assert.deepEqual(byUrl(), PENDING_PROBE);
  assert.ok(took >= 4900 && took < 7000, `${took}ms`);
});

test('N1: gon-services 전체가 실패해도 그 실패를 60초 동안 다시 묻지 않는다 (단건 확인 포함 4회)', async () => {
  const world = createWorld();
  world.gonDown = true;
  const region = rt.createRegionCache();
  const route = statsRoute(rt.loadDataFetcher({ realData: [1245, 1246].map(record) })); // 정적 자료로 대체
  for (let i = 0; i < 10; i++) await getStats(region, route);
  const calls = byUrl();
  assert.equal(calls['https://gon.test/api/v1/lotto/results'], 1, JSON.stringify(calls));
  assert.equal(originCalls(), 4, JSON.stringify(calls)); // 전체 1 + 단건 1 + smok95 1 + 동행복권 1
});

test('N1: 60초가 지나면 한 번 다시 확인하고, 그사이 발표된 회차를 다음 요청부터 보여 준다', async (t) => {
  const world = createWorld();
  const region = rt.createRegionCache();
  const web = rt.loadDataFetcher();
  const render = () => rt.run(region, () => web.getAllLottoData(), { path: '/', isStaticGeneration: true, revalidate: 3600 }).then((r) => last(r.value).round);
  assert.equal(await render(), 1246);
  const first = originCalls();

  world.published = true;
  const realNow = Date.now;
  const start = realNow();
  Date.now = () => realNow() + 61_000; // 데이터 캐시·dataFetcher 가 같은 시계를 본다
  t.after(() => { Date.now = realNow; });
  assert.ok(Date.now() - start >= 61_000);

  // 만료 첫 요청은 Next 규칙대로 담아 둔 값(1246)을 주고 뒤에서 다시 확인한다 (stale-while-revalidate)
  assert.equal(await render(), 1246);
  const recheck = originCalls() - first;
  assert.ok(recheck >= 2 && recheck <= 3, `다시 확인 ${recheck}회 ${JSON.stringify(byUrl())}`);
  assert.equal(await render(), 1247);
  const settled = originCalls();
  for (let i = 0; i < 5; i++) assert.equal(await render(), 1247);
  assert.equal(originCalls(), settled, '확정 뒤에는 외부 조회 없음');
});

test('N1·F1: 겹친 요청이 끊이지 않는 인스턴스도 cron 이 끝난 뒤 시작한 요청부터 새 회차를 본다', async () => {
  const world = createWorld();
  const region = rt.createRegionCache();
  const web = rt.loadDataFetcher();
  const render = () => rt.run(region, () => web.getAllLottoData(), { path: '/', isStaticGeneration: true, revalidate: 3600 }).then((r) => last(r.value).round);
  let stop = false;
  let cronDoneAt = Infinity;
  const before = [];
  const late = [];
  const worker = async () => {
    while (!stop) {
      const started = Date.now();
      const round = await render();
      (started > cronDoneAt ? late : before).push(round);
      await new Promise((r) => setImmediate(r)); // 메모리 적중만 이어지면 타이머가 돌지 못한다
    }
  };
  const workers = [worker(), worker(), worker()];
  await new Promise((r) => setTimeout(r, 40));
  world.published = true;
  const cron = await runCron(region, rt.loadDataFetcher(), 'draw-refresh');
  assert.ok(cron.revalidatedTags.includes('lotto-latest'));
  cronDoneAt = Date.now();
  await new Promise((r) => setTimeout(r, 60));
  stop = true;
  await Promise.all(workers);
  assert.ok(before.includes(1246));
  assert.ok(late.length > 0);
  assert.deepEqual([...new Set(late)], [1247], `cron 뒤 시작한 요청 ${late.length}개 중 구회차 ${late.filter((r) => r !== 1247).length}개`);
});

// 검수 196 R1 재현(review196-evidence/independent.cjs gonOnly): gon 만 먼저 공개 + gon 전체 목록을 cron 직전 60초 안에 받음.
// 목록(lotto-history)은 cron 이 비우지 않으므로 웹은 1246 목록을 계속 읽고, 새 회차는 gon 단건으로만 보인다.
// cron 이 경로를 비우는 페이지(홈 등)는 읽는 쪽 경로 태그(softTags) 때문에 목록부터 다시 받아 원래 회복된다 —
// 그래서 cron 이 비우지 않는 경로(번호별 페이지)로 렌더한다.
test('F1 (지시 197 C2): gon-services 만 먼저 공개해도 cron 직후 첫 요청부터 새 회차', async () => {
  const world = createWorld();
  const region = rt.createRegionCache();
  const web = rt.loadDataFetcher();
  const render = () => rt.run(region, () => web.getAllLottoData(), { path: '/lotto/number/7', isStaticGeneration: true, revalidate: 3600 }).then((r) => last(r.value).round);
  assert.equal(await render(), 1246); // gon 전체 목록을 방금 받음 (cron 직전 60초 안)

  world.gonPublished = true; // smok95 404·동행복권 fail 그대로
  const cron = await runCron(region, rt.loadDataFetcher(), 'draw-refresh');
  assert.equal(cron.status, 200);
  assert.equal(cron.body.latestRound, 1247);
  assert.equal(cron.body.complete, true);
  assert.ok(cron.revalidatedTags.includes('lotto-latest'));
  assert.ok(!cron.revalidatedTags.includes('lotto-history'));

  rt.resetCalls();
  assert.equal(await render(), 1247); // 시계를 넘기지 않음 (196 재현은 61초 뒤에야 1247)
  assert.ok(rt.calls.some((c) => c.url === 'https://gon.test/api/v1/lotto/round/1247'), JSON.stringify(byUrl()));
});

// ---------- N2 ----------
const fastSupabase = {
  getServiceSupabase: () => {
    const b = { from: () => b, select: () => b, eq: () => b, order: () => b, abortSignal: () => b, then: (ok) => ok({ data: [], error: null }) };
    return b;
  },
};
function roundPage(instance) {
  return loadTs('@/app/lotto/[round]/page', {
    mocks: {
      'next/navigation': { notFound() { throw new Error('notFound'); } },
      '@/lib/dataFetcher': instance,
      '@/lib/supabase': fastSupabase,
    },
  });
}
function rssRoute(instance) {
  return loadTs('@/app/rss.xml/route', { mocks: { '@/lib/dataFetcher': instance, '@/lib/supabase': fastSupabase } });
}
// ISR 페이지 한 장을 만드는 것처럼: 메타데이터 + 본문을 한 저장소에서 렌더하고 기록된 태그·주기를 돌려준다
async function renderRoundPage(region, page, round) {
  const params = { round: String(round) };
  const { store } = await rt.run(region, async () => {
    await page.generateMetadata({ params });
    await page.default({ params });
  }, { path: `/lotto/${round}`, pagePath: '/lotto/[round]/page', isStaticGeneration: true, revalidate: 3600 });
  return store;
}
async function runCron(region, instance, routePath) {
  const route = loadTs(`@/app/api/cron/${routePath}/route`, {
    mocks: {
      'next/server': { NextResponse: { json: (body, init) => Response.json(body, init) } },
      'next/cache': rt.nextCache,
      '@/lib/dataFetcher': instance,
      '@/lib/storeFetcher': { fetchAndSaveWinningStores: async () => ({ success: true, count: 0 }) },
      '@/lib/supabase': { getServiceSupabase: () => ({ from: () => ({ select() { return this; }, eq() { return this; }, async is() { return { data: [], error: null }; } }) }) },
    },
    globals: {
      process: { env: { CRON_SECRET: 'test-only' } }, console: { log() {}, error() {} },
      setTimeout: (cb) => cb(), // revalidate 의 5초 재시도 대기만 건너뜀
      fetch: async () => ({ ok: true }), // revalidate 의 워밍업 호출
    },
  });
  const { value: res, revalidatedTags } = await rt.run(region,
    () => route.GET(new Request('http://test.invalid', { headers: { authorization: 'Bearer test-only' } })),
    { path: `/api/cron/${routePath}` });
  return { status: res.status, body: await res.json(), revalidatedTags };
}

test('N2: 과거 회차 페이지는 확정 자료 태그·1시간 주기만, 최신·직전 회차·RSS 는 최신 확인 태그·60초', async () => {
  createWorld();
  const region = rt.createRegionCache();
  const web = rt.loadDataFetcher();
  const page = roundPage(web);

  const old = await renderRoundPage(region, page, 1245); // 예상 1247 기준 2회 전 = 과거
  assert.ok(old.tags.includes('lotto-history'), old.tags.join());
  assert.ok(!old.tags.includes('lotto-latest'), `과거 회차가 최신 확인에 묶임: ${old.tags.join()}`);
  assert.equal(old.revalidate, 3600);

  const latest = await renderRoundPage(region, page, 1246); // 지금 최신(=예상 직전)
  assert.ok(latest.tags.includes('lotto-latest'), latest.tags.join());
  assert.equal(latest.revalidate, 60);

  const { store: rss } = await rt.run(region, () => rssRoute(web).GET(), { path: '/rss.xml', pagePath: '/rss.xml/route', isStaticGeneration: true, revalidate: 3600 });
  assert.ok(rss.tags.includes('lotto-latest'), rss.tags.join());
});

test('N2: 미발표·실패 cron 은 아무것도 비우지 않고, 새 번호 확인 cron 은 과거 회차 HTML 을 남긴 채 최신·직전·홈만 비운다 (FileSystemCache)', async () => {
  const world = createWorld();
  const region = rt.createRegionCache();
  const web = rt.loadDataFetcher();
  const page = roundPage(web);
  const ic = region.incrementalCache;

  // 실제 렌더가 기록한 태그로 ISR 페이지 항목을 FileSystemCache 에 저장 (빌드 산출물 .html/.rsc/.meta 와 같은 형식)
  const stores = {
    '/lotto/1': await renderRoundPage(region, page, 1),
    '/lotto/1245': await renderRoundPage(region, page, 1245),
    '/lotto/1246': await renderRoundPage(region, page, 1246),
    // 홈: getAllLottoData 를 같은 방식으로 쓰는 페이지 (src/app/page.tsx 전체 렌더 대신 데이터 조회 부분)
    '/': (await rt.run(region, () => web.getAllLottoData(), { path: '/', isStaticGeneration: true, revalidate: 3600 })).store,
  };
  for (const [p, store] of Object.entries(stores)) {
    await ic.set(p, { kind: 'PAGE', html: `<p>${p}</p>`, pageData: 'rsc', headers: { 'x-next-cache-tags': store.tags.join(',') }, status: 200 }, { revalidate: store.revalidate });
  }
  await new Promise((r) => setTimeout(r, 5));
  const alive = async () => {
    const out = {};
    for (const p of Object.keys(stores)) out[p] = (await ic.get(p, { kindHint: 'app' }))?.value?.kind === 'PAGE';
    return out;
  };
  const all = (v) => Object.fromEntries(Object.keys(stores).map((p) => [p, v]));
  assert.deepEqual(await alive(), all(true));

  for (const cron of ['draw-refresh', 'revalidate']) {
    const pending = await runCron(region, rt.loadDataFetcher(), cron);
    assert.deepEqual(pending.revalidatedTags, [], `${cron} 발표 전`);
    assert.deepEqual(await alive(), all(true), `${cron} 발표 전`);
  }
  world.upstream = async () => { throw new Error('upstream down'); };
  const failed = await runCron(region, rt.loadDataFetcher(), 'draw-refresh');
  assert.equal(failed.status, 503);
  assert.deepEqual(failed.revalidatedTags, []);
  assert.deepEqual(await alive(), all(true), '실패 cron');

  createWorld().published = true; // 출처 정상화 + 1247 발표 (smok95)
  const ok = await runCron(region, rt.loadDataFetcher(), 'draw-refresh');
  assert.equal(ok.body.latestRound, 1247);
  assert.ok(ok.revalidatedTags.includes('lotto-latest'));
  assert.ok(!ok.revalidatedTags.includes('lotto-history'));
  assert.ok(!ok.revalidatedTags.some((t) => t.endsWith('/layout')), ok.revalidatedTags.join());
  assert.deepEqual(await alive(), { '/lotto/1': true, '/lotto/1245': true, '/lotto/1246': false, '/': false });
});
