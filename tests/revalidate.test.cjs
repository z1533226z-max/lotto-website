const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

// Run the real route with an allowlist of fakes: no network, DB, or env files.
const filename = path.join(__dirname, '../src/app/api/cron/revalidate/route.ts');
const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

async function invoke(options = {}) {
  const draw = { round: 1200, numbers: [1, 2, 3, 4, 5, 6], bonusNumber: 7 };
  const rows = options.rows ?? [{ id: 'saved-1', numbers: [1, 2, 3, 4, 5, 7] }];
  const updates = [];
  const delays = [];
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
      invalidateAllDataCache() {},
      getEstimatedLatestRound: () => 1200,
      async getAllLottoData() {
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
    'next/cache': { revalidatePath() {} },
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
  return { response, body: await response.json(), updates, fetches, delays };
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
