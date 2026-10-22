// Load real TypeScript sources from src/ for node:test (no build step, no network, no env files).
// '@/x' and relative imports resolve to src files; names in `mocks` are replaced by fakes.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const SRC = path.join(__dirname, '../src');
const PURE_PACKAGES = new Set(['clsx', 'tailwind-merge', 'react', 'react/jsx-runtime', 'lucide-react', 'node:async_hooks']);

function resolveFile(spec, fromDir) {
  const base = spec.startsWith('@/') ? path.join(SRC, spec.slice(2)) : path.resolve(fromDir, spec);
  for (const ext of ['', '.ts', '.tsx', '/index.ts']) {
    const file = base + ext;
    if (fs.existsSync(file) && fs.statSync(file).isFile()) return file;
  }
  throw new Error(`Cannot resolve ${spec} from ${fromDir}`);
}

function loadTs(spec, { mocks = {}, globals = {} } = {}) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
      fileName: file,
    }).outputText;
    vm.runInNewContext(source, {
      module,
      exports: module.exports,
      require(name) {
        if (Object.hasOwn(mocks, name)) return mocks[name];
        if (name.startsWith('@/') || name.startsWith('.')) return load(resolveFile(name, path.dirname(file)));
        // 순수 유틸 패키지(clsx 등)만 실제로 불러온다. 네트워크·DB 모듈은 반드시 mocks 로 넘길 것
        if (PURE_PACKAGES.has(name)) return require(name);
        throw new Error(`Unmocked dependency: ${name} (from ${path.relative(SRC, file)})`);
      },
      console, Intl, AbortSignal, AbortController, Response, Request, setTimeout, clearTimeout,
      process: { env: {} },
      ...globals,
    }, { filename: file });
    return module.exports;
  }
  return load(resolveFile(spec, SRC));
}

module.exports = { loadTs };
