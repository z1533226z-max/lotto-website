// 시험용 Next 14.2 서버 캐시 실행 틀 (지시 192).
// 흉내 내지 않고 설치된 Next 의 patchFetch·unstable_cache·revalidateTag·IncrementalCache(FileSystemCache) 를 그대로 쓴다.
// 외부 출처만 가짜(upstream)로 바꾸고, 출처에 실제로 나간 호출을 calls 에 센다.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { loadTs } = require('./_loadTs.cjs');

// React 18 의 cache 는 RSC 빌드에만 있다. RSC 밖에서는 요청 안 fetch 중복 제거만 빠진다 (검수 189 와 같은 조건).
// Next 모듈이 react 를 복사해 들기 전에 넣어야 한다.
const React = require('react');
React.cache ||= (fn) => fn;
// Next 서버가 시작할 때 넣는 것 (next/dist/server/node-environment)
globalThis.AsyncLocalStorage ??= require('node:async_hooks').AsyncLocalStorage;

const { staticGenerationAsyncStorage } = require('next/dist/client/components/static-generation-async-storage.external');
const { patchFetch } = require('next/dist/server/lib/patch-fetch');
const { IncrementalCache } = require('next/dist/server/lib/incremental-cache');
const nextCache = require('next/cache');

const calls = [];
let upstream = async (url) => { throw new Error(`unexpected fetch ${url}`); };

// patchFetch 는 지금의 globalThis.fetch 를 원래 fetch 로 붙잡는다 → 출처 대역을 먼저 꽂는다
globalThis.fetch = async (input, init = {}) => {
  const url = String(input);
  calls.push({ url, cache: init.cache });
  return upstream(url, init);
};
patchFetch({
  staticGenerationAsyncStorage,
  serverHooks: require('next/dist/client/components/hooks-server-context'),
});

const nodeFs = {
  readFileSync: fs.readFileSync,
  readFile: fs.promises.readFile,
  writeFile: fs.promises.writeFile,
  stat: fs.promises.stat,
  mkdir: (dir) => fs.promises.mkdir(dir, { recursive: true }),
};

const FS_CACHE = require.resolve('next/dist/server/lib/incremental-cache/file-system-cache');

/**
 * 리전 데이터 캐시 하나 (Vercel 에서 인스턴스들이 함께 쓰는 Data Cache 역할). 실제 Next FileSystemCache 를 임시 폴더에 둔다.
 * 메모리 층은 next start 기본값(cacheMaxMemorySize 50MB)과 같게 — 저장 즉시 메모리에 들어가 바로 다음 요청이 읽는다
 * (Vercel 용 fetch-cache 도 같은 방식). FileSystemCache 는 메모리·태그 기록을 모듈 전역에 두므로 리전마다 새로 불러온다.
 */
function createRegionCache() {
  delete require.cache[FS_CACHE];
  const FileSystemCache = require(FS_CACHE).default;
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lotto192-'));
  const serverDistDir = path.join(root, 'server');
  fs.mkdirSync(path.join(serverDistDir, 'app'), { recursive: true });
  const incrementalCache = new IncrementalCache({
    fs: nodeFs,
    dev: false,
    appDir: true,
    flushToDisk: true,
    fetchCache: true,
    minimalMode: false,
    serverDistDir,
    requestHeaders: {},
    maxMemoryCacheSize: 50 * 1024 * 1024,
    CurCacheHandler: FileSystemCache,
    fetchCacheKeyPrefix: '',
    getPrerenderManifest: () => ({ version: 4, routes: {}, dynamicRoutes: {}, notFoundRoutes: [], preview: { previewModeId: 'test-preview' } }),
    experimental: { ppr: false },
  });
  return { root, serverDistDir, incrementalCache };
}

/**
 * 요청 하나를 Next 처럼 실행: 저장소(store) 안에서 fn 을 돌리고, 끝나면 백그라운드 재검증을 기다린 뒤
 * revalidateTag/revalidatePath 로 쌓인 태그를 데이터 캐시에 적용한다 (app-route 가 응답 뒤에 하는 일).
 */
async function run(region, fn, { path: urlPathname = '/api/test', pagePath, isStaticGeneration = false, revalidate } = {}) {
  const store = {
    isStaticGeneration,
    urlPathname,
    pagePath: pagePath ?? `${urlPathname === '/' ? '' : urlPathname}/page`,
    incrementalCache: region.incrementalCache,
    revalidate,
    isDraftMode: false,
    isOnDemandRevalidate: false,
    prerenderState: null,
  };
  const value = await staticGenerationAsyncStorage.run(store, fn);
  await Promise.all(Object.values(store.pendingRevalidates || {}));
  const revalidatedTags = store.revalidatedTags || [];
  if (revalidatedTags.length) {
    await region.incrementalCache.revalidateTag(revalidatedTags);
    await new Promise((r) => setTimeout(r, 5)); // 태그 시각과 새 항목 시각이 같은 ms 로 겹치지 않게
  }
  return { value, store, revalidatedTags };
}

/** 서버 인스턴스 하나 = dataFetcher 모듈을 따로 불러온 것 (메모리 캐시가 따로 생김) */
function loadDataFetcher({ latestDrawn = 1247, realData = [], gonUrl = 'https://gon.test' } = {}) {
  return loadTs('@/lib/dataFetcher', {
    mocks: {
      react: { cache: (fn) => fn }, // RSC 밖: 요청 안 중복 제거만 빠짐 (제품 fetch 는 모두 signal 이 있어 어차피 합쳐지지 않음)
      'next/cache': nextCache,
      '@/data/realLottoData': { REAL_LOTTO_DATA: realData },
      '@/lib/drawSchedule': { getLatestDrawnRound: () => latestDrawn },
    },
    globals: { fetch: globalThis.fetch, process: { env: gonUrl ? { GON_SERVICES_URL: gonUrl } : {} }, console: { log() {}, error() {}, warn() {} } },
  });
}

module.exports = {
  calls,
  setUpstream(fn) { upstream = fn; },
  resetCalls() { calls.length = 0; },
  createRegionCache,
  run,
  loadDataFetcher,
  nextCache,
};
