const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');
const { loadTs } = require('./_loadTs.cjs');

// Run the real route with an allowlist of fakes: no network, DB, or env files.
const filename = path.join(__dirname, '../src/app/api/cron/revalidate/route.ts');
const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

async function invoke(options = {}) {
  const draw = {
    round: 1200, numbers: [1, 2, 3, 4, 5, 6], bonusNumber: 7,
    prizeMoney: options.prizePending
      ? { first: 0, firstWinners: 0, second: 0, secondWinners: 0 }
      : { first: 2_000_000_000, firstWinners: 10, second: 50_000_000, secondWinners: 70 },
  };
  const rows = options.rows ?? [{ id: 'saved-1', numbers: [1, 2, 3, 4, 5, 7] }];
  const updates = [];
  const delays = [];
  const revalidated = [];
  const tags = [];
  let fetches = 0;
  let updateAttempts = 0;
  const supabase = {
    from() {
      return {
        select() { return this; },
        eq() { return this; },
        async is() {
          if (options.selectThrows) throw new Error('fake query failure');
          return { data: rows, error: options.selectError ? { message: 'fake select failure' } : null };
        },
        update(value) {
          return { async eq(column, id) {
            updateAttempts++;
            if (options.updateError || updateAttempts === options.updateErrorAt) {
              return { error: { message: 'fake update failure' } };
            }
            updates.push({ id, ...value });
            return { error: null };
          } };
        },
      };
    },
  };
  const dependencies = {
    'next/server': { NextResponse: { json: (body, init) => Response.json(body, init) } },
    '@/lib/dataFetcher': {
      LOTTO_LATEST_TAG: 'lotto-latest',
      getEstimatedLatestRound: () => 1200,
      async refreshAllLottoData() {
        fetches++;
        if (options.fetchError) throw new Error('fake upstream failure');
        if (options.empty) return [];
        return [{ ...draw, round: options.stale || (options.recovers && fetches === 1) ? 1199 : 1200 }];
      },
    },
    '@/lib/storeFetcher': { async fetchAndSaveWinningStores() {
      if (options.storeThrows) throw new Error('fake store failure');
      return { success: !options.storeError, count: options.storeError ? 0 : 2 };
    } },
    '@/lib/supabase': { getServiceSupabase: () => supabase },
    'next/cache': { revalidatePath(p, type) { revalidated.push(type ? p + '#' + type : p); }, revalidateTag(t) { tags.push(t); } },
    '@/lib/revalidateTargets': loadTs('@/lib/revalidateTargets'),
    '@/lib/prizeStatus': loadTs('@/lib/prizeStatus'),
  };
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    require(name) {
      assert.ok(Object.hasOwn(dependencies, name), `Unmocked dependency: ${name}`);
      return dependencies[name];
    },
    process: { env: { CRON_SECRET: 'test-only' } },
    console: { log() {}, error() {} },
    Response, AbortSignal,
    fetch: async () => ({ ok: true }),
    setTimeout(callback, ms) { delays.push(ms); callback(); },
  }, { filename });
  const response = await exports.GET(new Request('http://test.invalid', {
    headers: { authorization: options.unauthorized ? 'invalid' : 'Bearer test-only' },
  }));
  return { response, body: await response.json(), updates, fetches, delays, revalidated, tags };
}

for (const [name, options, stage] of [
  ['stale draw after retry', { stale: true }, 'latestRound'],
  ['no draw after retry', { empty: true }, 'latestRound'],
  ['upstream rejection', { fetchError: true }, 'latestRound'],
  ['store save failure result', { storeError: true }, 'stores'],
  ['store save rejection', { storeThrows: true }, 'stores'],
  ['saved-number read error result', { selectError: true }, 'matchCheck'],
  ['saved-number read rejection', { selectThrows: true }, 'matchCheck'],
  ['saved-number write error result', { updateError: true }, 'matchCheck'],
]) {
  test(`cron fails on ${name}`, async () => {
    const { response, body } = await invoke(options);
    assert.ok(response.status >= 500);
    assert.equal(body.success, false);
    assert.ok(body.failedStages.includes(stage));
  });
}

test('all failed stages are retained in one response', async () => {
  const { body } = await invoke({ stale: true, storeError: true, selectError: true });
  assert.deepEqual(body.failedStages, ['latestRound', 'stores', 'matchCheck']);
});

test('success confirms the saved-number write and preserves retry recovery', async () => {
  const { response, body, updates, fetches, delays } = await invoke({ recovers: true });
  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(fetches, 2);
  assert.deepEqual(delays, [5000]);
  assert.equal(body.matchCheck.checked, 1);
  assert.equal(updates[0].matched_count, 5);
  assert.equal(updates[0].bonus_matched, true);
  assert.ok(updates[0].checked_at);
});

test('no saved numbers is a valid successful check', async () => {
  const { body } = await invoke({ rows: [] });
  assert.equal(body.success, true);
  assert.equal(body.matchCheck.checked, 0);
});

test('store failure retains successful saved-number checks', async () => {
  const { body, updates } = await invoke({ storeError: true });
  assert.equal(body.success, false);
  assert.equal(body.matchCheck.checked, 1);
  assert.equal(updates.length, 1);
});

test('failed update reports only confirmed saved-number writes', async () => {
  const { body, updates } = await invoke({
    rows: [{ id: 'saved-1', numbers: [1] }, { id: 'saved-2', numbers: [2] }],
    updateErrorAt: 2,
  });
  assert.equal(body.success, false);
  assert.equal(body.matchCheck.checked, 1);
  assert.equal(updates.length, 1);
});

test('unauthorized cron does not run work', async () => {
  const { response, fetches } = await invoke({ unauthorized: true });
  assert.equal(response.status, 401);
  assert.equal(fetches, 0);
});

// 지시 192 N2: 재시도 뒤에도 새 번호가 없으면 데이터 캐시·페이지를 비우지 않는다.
// 먼저 열려 404 로 담긴 예상 회차 페이지는 번호가 확인된 cron 에서 함께 다시 만든다 (아래 시험).
test('stale data revalidates nothing (judged before invalidation)', async () => {
  const { revalidated, tags } = await invoke({ stale: true });
  assert.deepEqual(revalidated, []);
  assert.deepEqual(tags, []);
});

test('fresh draw revalidates latest/previous round, home and RSS only — never the whole layout', async () => {
  const { revalidated } = await invoke();
  for (const p of ['/lotto/1200', '/lotto/1199', '/', '/rss.xml']) assert.ok(revalidated.includes(p), p);
  assert.deepEqual(revalidated.filter((p) => /^\/lotto\/\d+$/.test(p)), ['/lotto/1200', '/lotto/1199']);
  assert.ok(!revalidated.some((p) => p.endsWith('#layout')));
});

test('번호는 반영됐지만 당첨금 미집계면 prizes 단계 실패로 보고 (지시 187 F2)', async () => {
  const { response, body } = await invoke({ prizePending: true });
  assert.equal(response.status, 503);
  assert.equal(body.prizePending, true);
  assert.ok(body.failedStages.includes('prizes'));
  assert.ok(!body.failedStages.includes('latestRound'));
});

test('새 번호 확인 뒤 최신 확인 태그만 무효화한다 (지시 187 F1 · 192 N2)', async () => {
  const { tags } = await invoke();
  assert.deepEqual(tags, ['lotto-latest']);
});
