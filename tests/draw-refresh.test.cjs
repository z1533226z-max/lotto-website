const assert = require('node:assert/strict');
const { test } = require('node:test');
const { loadTs } = require('./_loadTs.cjs');

const round = (n) => ({
  round: n, drawDate: '2026-10-17', numbers: [1, 2, 3, 4, 5, 6], bonusNumber: 7,
  prizeMoney: { first: 1, firstWinners: 1, second: 1, secondWinners: 1 },
});

// ---------- dataFetcher: 추첨 직후 gon-services 가 늦어도 새 회차를 보충 ----------
function loadFetcher({ gonLast, smok95 = {}, dhl = {} }) {
  const calls = [];
  const fakeFetch = async (url) => {
    calls.push(url);
    if (url.startsWith('https://gon.test/api/v1/lotto/results')) {
      return Response.json(Array.from({ length: 3 }, (_, i) => ({ ...round(gonLast - 2 + i), prizeMoney: round(0).prizeMoney })));
    }
    const s = /smok95\.github\.io\/lotto\/results\/(\d+)\.json/.exec(url);
    if (s) {
      const r = smok95[s[1]];
      if (!r) return new Response('nf', { status: 404 });
      await new Promise((res) => setTimeout(res, r.delay || 0));
      return Response.json({ draw_no: Number(s[1]), date: '2026-10-24T00:00:00Z', numbers: [8, 9, 10, 11, 12, 13], bonus_no: 14, divisions: [] });
    }
    const d = /drwNo=(\d+)/.exec(url);
    if (d) {
      const r = dhl[d[1]];
      if (!r) return new Response('{"returnValue":"fail"}');
      await new Promise((res) => setTimeout(res, r.delay || 0));
      return new Response(JSON.stringify({
        returnValue: 'success', drwNo: Number(d[1]), drwNoDate: '2026-10-24',
        drwtNo1: 21, drwtNo2: 22, drwtNo3: 23, drwtNo4: 24, drwtNo5: 25, drwtNo6: 26, bnusNo: 27,
        firstWinamnt: 2_000_000_000, firstPrzwnerCo: 10, secondWinamnt: 50_000_000, secondPrzwnerCo: 70,
      }));
    }
    throw new Error(`unexpected fetch ${url}`);
  };
  const mod = loadTs('@/lib/dataFetcher', {
    mocks: {
      react: { cache: (fn) => fn },
      '@/data/realLottoData': { REAL_LOTTO_DATA: [round(1200)] },
      '@/lib/drawSchedule': { getLatestDrawnRound: () => 1247 },
    },
    globals: { fetch: fakeFetch, process: { env: { GON_SERVICES_URL: 'https://gon.test' } } },
  });
  return { mod, calls };
}

test('gon-services 에 없는 새 회차를 공개 출처에서 보충한다', async () => {
  const { mod } = loadFetcher({ gonLast: 1246, dhl: { 1247: {} } });
  const all = await mod.getAllLottoData();
  const last = all[all.length - 1];
  assert.equal(last.round, 1247);
  assert.equal(last.prizeMoney.first, 2_000_000_000);
  assert.equal(all.length, 4);
});

test('두 출처를 동시에 물어 먼저 온 결과를 쓴다', async () => {
  const { mod } = loadFetcher({ gonLast: 1246, smok95: { 1247: { delay: 200 } }, dhl: { 1247: { delay: 5 } } });
  const started = Date.now();
  const all = await mod.getAllLottoData();
  assert.equal(all[all.length - 1].numbers.join(','), '21,22,23,24,25,26'); // 동행복권 쪽이 먼저
  assert.ok(Date.now() - started < 150, 'smok95 를 기다리지 않음');
});

test('발표 전(아무 출처에도 없음)이면 기존 회차까지만', async () => {
  const { mod } = loadFetcher({ gonLast: 1246 });
  const all = await mod.getAllLottoData();
  assert.equal(all[all.length - 1].round, 1246);
});

test('gon-services 가 최신이면 외부 출처를 부르지 않는다', async () => {
  const { mod, calls } = loadFetcher({ gonLast: 1247 });
  const all = await mod.getAllLottoData();
  assert.equal(all[all.length - 1].round, 1247);
  assert.equal(calls.length, 1);
});

// ---------- /api/cron/draw-refresh ----------
async function invokeRefresh({ latest = 1247, expected = 1247, fetchError = false, unauthorized = false } = {}) {
  const revalidated = [];
  let invalidated = 0;
  const route = loadTs('@/app/api/cron/draw-refresh/route', {
    mocks: {
      'next/server': { NextResponse: { json: (body, init) => Response.json(body, init) } },
      'next/cache': { revalidatePath: (p, type) => revalidated.push(type ? `${p}#${type}` : p) },
      '@/lib/dataFetcher': {
        invalidateAllDataCache() { invalidated++; },
        getEstimatedLatestRound: () => expected,
        async getAllLottoData() {
          if (fetchError) throw new Error('upstream down');
          return latest ? [round(latest - 1), round(latest)] : [];
        },
      },
    },
    globals: { process: { env: { CRON_SECRET: 'test-only' } }, console: { log() {}, error() {} } },
  });
  const res = await route.GET(new Request('http://test.invalid', {
    headers: { authorization: unauthorized ? 'nope' : 'Bearer test-only' },
  }));
  return { res, body: await res.json(), revalidated, invalidated };
}

test('draw-refresh: 새 회차가 있으면 주요 페이지·회차 페이지를 다시 만든다 (레이아웃 전체는 건드리지 않음)', async () => {
  const { res, body, revalidated, invalidated } = await invokeRefresh();
  assert.equal(res.status, 200);
  assert.equal(body.pending, false);
  assert.equal(invalidated, 1);
  for (const p of ['/', '/lotto/1247', '/lotto/1246', '/rss.xml', '/lotto/my-numbers']) assert.ok(revalidated.includes(p), p);
  assert.ok(!revalidated.some((p) => p.endsWith('#layout')));
});

test('draw-refresh: 발표 전이면 200 + pending, 페이지는 그대로', async () => {
  const { res, body, revalidated } = await invokeRefresh({ latest: 1246, expected: 1247 });
  assert.equal(res.status, 200);
  assert.equal(body.pending, true);
  assert.equal(revalidated.length, 0);
});

test('draw-refresh: 데이터 조회 실패·빈 데이터는 503', async () => {
  assert.equal((await invokeRefresh({ fetchError: true })).res.status, 503);
  assert.equal((await invokeRefresh({ latest: 0 })).res.status, 503);
});

test('draw-refresh: 인증 없으면 401, 아무것도 하지 않음', async () => {
  const { res, invalidated } = await invokeRefresh({ unauthorized: true });
  assert.equal(res.status, 401);
  assert.equal(invalidated, 0);
});
