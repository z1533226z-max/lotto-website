const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const ts = require('typescript');

// Load the real TypeScript modules (with the '@/...' alias) without a build: no network, DB, or env files.
const SRC = path.join(__dirname, '../src');
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file).exports;
  const mod = { exports: {} };
  cache.set(file, mod);
  const out = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const localRequire = (spec) => {
    if (!spec.startsWith('@/') && !spec.startsWith('.')) return require(spec);
    const base = spec.startsWith('@/') ? path.join(SRC, spec.slice(2)) : path.resolve(path.dirname(file), spec);
    const resolved = ['.ts', '.tsx', '/index.ts'].map((ext) => base + ext).find((p) => fs.existsSync(p));
    if (!resolved) throw new Error(`cannot resolve ${spec} from ${file}`);
    return load(resolved);
  };
  new Function('module', 'exports', 'require', out)(mod, mod.exports, localRequire);
  return mod.exports;
}

const { getGoogleSitemapEntries, getNaverSitemapEntries, BASE_URL } = load(path.join(SRC, 'lib/sitemapEntries.ts'));
const { GOOGLE_INDEXED_DREAM_KEYWORDS } = load(path.join(SRC, 'lib/seo.ts'));
const { DREAM_KEYWORDS } = load(path.join(SRC, 'data/dreamNumbers.ts'));

const TODAY = '2026-10-22';
const allData = Array.from({ length: 80 }, (_, i) => ({
  round: 1167 + i,
  drawDate: new Date(Date.UTC(2025, 3, 19) + i * 7 * 86400000).toISOString().slice(0, 10),
  numbers: [1, 2, 3, 4, 5, 6],
  bonusNumber: 7,
  prizeMoney: { first: 0, firstWinners: 0, second: 0, secondWinners: 0 },
}));
const google = getGoogleSitemapEntries(allData, TODAY).map((e) => e.url.slice(BASE_URL.length));
const naver = getNaverSitemapEntries(allData, TODAY).map((e) => e.url.slice(BASE_URL.length));
const dreamPath = (k) => `/lotto/dream/${encodeURIComponent(k)}`;

test('kept dream keywords are at most 30 and all exist', () => {
  assert.ok(GOOGLE_INDEXED_DREAM_KEYWORDS.size <= 30, `kept ${GOOGLE_INDEXED_DREAM_KEYWORDS.size}`);
  const known = new Set(DREAM_KEYWORDS.map((d) => d.keyword));
  for (const k of GOOGLE_INDEXED_DREAM_KEYWORDS) assert.ok(known.has(k), `unknown dream keyword ${k}`);
});

test('Google sitemap keeps only the selected dreams; the rest move to the Naver sitemap', () => {
  const googleDreams = google.filter((u) => u.startsWith('/lotto/dream/'));
  const naverDreams = naver.filter((u) => u.startsWith('/lotto/dream/'));
  assert.deepEqual(new Set(googleDreams), new Set([...GOOGLE_INDEXED_DREAM_KEYWORDS].map(dreamPath)));
  assert.equal(googleDreams.length + naverDreams.length, DREAM_KEYWORDS.length);
  assert.ok(google.includes('/lotto/dream'), 'dream hub stays');
});

test('MBTI, zodiac and blood-type details (32) are only in the Naver sitemap', () => {
  const detail = /^\/lotto\/(mbti|zodiac|blood-type)\/[^/]+$/;
  assert.equal(google.filter((u) => detail.test(u)).length, 0);
  assert.equal(naver.filter((u) => detail.test(u)).length, 32);
  for (const hub of ['/lotto/mbti', '/lotto/zodiac', '/lotto/blood-type']) assert.ok(google.includes(hub), hub);
});

test('daily fortune: Google gets only the representative hub, dated URLs go to Naver', () => {
  assert.ok(google.includes('/lotto/daily-fortune'));
  assert.equal(google.filter((u) => u.startsWith('/lotto/daily-fortune/')).length, 0);
  assert.ok(naver.includes(`/lotto/daily-fortune/${TODAY}`));
  assert.ok(naver.includes('/lotto/daily-fortune/2026-10-21'));
});

test('public my-numbers tool is discoverable once in the Google sitemap', () => {
  assert.equal(google.filter((u) => u === '/lotto/my-numbers').length, 1);
  assert.ok(!naver.includes('/lotto/my-numbers'));
});

test('my-numbers lastmod tracks new draw content after the tool publication date', () => {
  const findTool = data => getGoogleSitemapEntries(data, TODAY).find(e => e.url === `${BASE_URL}/lotto/my-numbers`);
  assert.equal(findTool([]).lastModified, '2026-10-22');
  assert.equal(findTool([{ ...allData[0], drawDate: '2026-10-24' }]).lastModified, '2026-10-24');
});

test('no URL is in both sitemaps and neither has duplicates', () => {
  assert.equal(new Set(google).size, google.length);
  assert.equal(new Set(naver).size, naver.length);
  const both = google.filter((u) => new Set(naver).has(u));
  assert.deepEqual(both, []);
});
