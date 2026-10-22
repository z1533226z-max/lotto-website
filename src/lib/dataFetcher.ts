import { cache } from 'react';
import type { LottoResult } from '@/types/lotto';
import { REAL_LOTTO_DATA } from '@/data/realLottoData';
import { getLatestDrawnRound } from '@/lib/drawSchedule';
import { isPrizePending } from '@/lib/prizeStatus';

// gon-services 백엔드 URL (서버 전용 — NEXT_PUBLIC_ 제거하여 클라이언트 노출 방지)
const GON_SERVICES_URL = process.env.GON_SERVICES_URL || '';

// gon-services API 응답 타입
interface GonServicesResult {
  round: number;
  drawDate: string;
  numbers: number[];
  bonusNumber: number;
  prizeMoney: {
    first: number | null;
    firstWinners: number | null;
    second: number | null;
    secondWinners: number | null;
  };
}

// 메모리 캐시 (Vercel Serverless 인스턴스 내 지속 — 인스턴스마다 따로라 다른 인스턴스의 cron 이 비울 수 없다)
// 그래서 당첨금까지 확인된 회차만 담고(roundCache), 전체 데이터는 최신 회차·당첨금이
// 현재 시각 기준으로 확인된 동안만 다시 쓴다(allDataCache). 추첨 시각이 지나면 저절로 무효가 된다.
const roundCache = new Map<number, { data: LottoResult; fetchedAt: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1시간

// 전체 데이터 캐시 (정적 + 동적 합산)
let allDataCache: { data: LottoResult[]; fetchedAt: number } | null = null;
const ALL_DATA_CACHE_TTL = 30 * 60 * 1000; // 30분

/**
 * 외부 조회는 Next 데이터 캐시(Vercel 에서는 인스턴스들이 함께 쓰는 리전 캐시)에 이 태그로 저장한다.
 * cron 이 revalidateTag(LOTTO_DATA_TAG) 하면 모든 인스턴스의 다음 조회가 출처에서 새로 읽는다.
 * (https://nextjs.org/docs/14/app/building-your-application/caching#fetch-optionsnexttags-and-revalidatetag)
 */
export const LOTTO_DATA_TAG = 'lotto-data';
// 지난 회차 전체 목록: 페이지 주기(1시간)와 같게 둬 페이지 재생성 주기를 앞당기지 않는다
const BASE_REVALIDATE = 3600;
// 새 회차·미집계 당첨금 확인은 짧게. 이 조회가 들어간 페이지도 주기가 60초로 줄어 구회차 HTML 이 오래 남지 않는다
// (Next 14 는 페이지 안 fetch 중 가장 짧은 revalidate 로 페이지 주기를 정한다)
const PROBE_REVALIDATE = 60;

/** cached: 지난 회차 · probe: 새 회차/미집계 확인 · fresh: cron 전용, 데이터 캐시를 거치지 않음 */
type FetchMode = 'cached' | 'probe' | 'fresh';

function fetchOptions(mode: FetchMode, timeoutMs: number, headers?: Record<string, string>): RequestInit {
  const base: RequestInit = { signal: AbortSignal.timeout(timeoutMs), ...(headers ? { headers } : {}) };
  if (mode === 'fresh') return { ...base, cache: 'no-store' };
  return { ...base, next: { revalidate: mode === 'probe' ? PROBE_REVALIDATE : BASE_REVALIDATE, tags: [LOTTO_DATA_TAG] } };
}

/** 최신 회차와 그 당첨금까지 확인된 데이터인가 (현재 시각 기준 예상 회차와 비교) */
function isSettled(data: LottoResult[], expectedRound: number): boolean {
  const latest = data[data.length - 1];
  return !!latest && latest.round >= expectedRound && !isPrizePending(latest);
}

// 현재 추첨이 끝난 최신 회차 (KST 토요일 20:35 기준).
// 이전 구현은 서버 로컬 타임존(Vercel=UTC) 자정 기준이라 KST 토요일 09:00~20:35에
// 아직 추첨하지 않은 회차를 최신으로 계산했다.
export function getEstimatedLatestRound(now: Date = new Date()): number {
  return getLatestDrawnRound(now);
}

// gon-services 백엔드 API에서 전체 데이터 fetch
async function fetchAllFromGonServices(mode: FetchMode): Promise<LottoResult[] | null> {
  if (!GON_SERVICES_URL) return null;
  try {
    const response = await fetch(`${GON_SERVICES_URL}/api/v1/lotto/results`, fetchOptions(mode, 10000));
    if (!response.ok) return null;
    const data: GonServicesResult[] = await response.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    return data.map((item) => _mapGonResult(item));
  } catch (e) {
    if (typeof window === 'undefined') {
      console.error('[dataFetcher] gon-services 전체 조회 실패:', e instanceof Error ? e.message : e);
    }
    return null;
  }
}

// gon-services 백엔드 API에서 특정 회차 fetch
async function fetchFromGonServices(round: number, mode: FetchMode): Promise<LottoResult | null> {
  if (!GON_SERVICES_URL) return null;
  try {
    const response = await fetch(`${GON_SERVICES_URL}/api/v1/lotto/round/${round}`, fetchOptions(mode, 5000));
    if (!response.ok) return null;
    const data: GonServicesResult = await response.json();
    if (!data.round || !data.numbers) return null;

    return _mapGonResult(data);
  } catch (e) {
    if (typeof window === 'undefined') {
      console.error('[dataFetcher] gon-services 단건 조회 실패:', e instanceof Error ? e.message : e);
    }
    return null;
  }
}

// gon-services API 응답 -> LottoResult 변환
function _mapGonResult(item: GonServicesResult): LottoResult {
  return {
    round: item.round,
    drawDate: item.drawDate ?? '',
    numbers: [...item.numbers].sort((a, b) => a - b),
    bonusNumber: item.bonusNumber,
    prizeMoney: {
      first: item.prizeMoney?.first ?? 0,
      firstWinners: item.prizeMoney?.firstWinners ?? 0,
      second: item.prizeMoney?.second ?? 0,
      secondWinners: item.prizeMoney?.secondWinners ?? 0,
    },
  };
}

// smok95 GitHub Pages API에서 데이터 fetch
async function fetchFromSmok95(round: number, mode: FetchMode): Promise<LottoResult | null> {
  const url = `https://smok95.github.io/lotto/results/${round}.json`;
  try {
    const response = await fetch(url, fetchOptions(mode, 5000));
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.draw_no || !data.numbers || !data.bonus_no) return null;

    return {
      round: data.draw_no,
      drawDate: data.date ? data.date.split('T')[0] : '',
      numbers: [...data.numbers].sort((a: number, b: number) => a - b),
      bonusNumber: data.bonus_no,
      prizeMoney: {
        first: data.divisions?.[0]?.prize ?? 0,
        firstWinners: data.divisions?.[0]?.winners ?? 0,
        second: data.divisions?.[1]?.prize ?? 0,
        secondWinners: data.divisions?.[1]?.winners ?? 0,
      },
    };
  } catch {
    return null;
  }
}

// 동행복권 API에서 데이터 fetch (마지막 수단)
async function fetchFromDhlottery(round: number, mode: FetchMode): Promise<LottoResult | null> {
  const url = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`;
  try {
    // 발표 전에도 200 {"returnValue":"fail"} 을 주므로, 옵션 없이 두면 데이터 캐시에 '없음'이 페이지 주기만큼 남는다
    const response = await fetch(url, fetchOptions(mode, 5000, {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json, text/javascript, */*',
      'Referer': 'https://www.dhlottery.co.kr/gameResult.do?method=byWin',
    }));
    if (!response.ok) return null;
    const text = await response.text();
    if (text.includes('<!DOCTYPE') || text.includes('<html')) return null;
    const data = JSON.parse(text);
    if (data.returnValue === 'fail' || !data.drwNo) return null;

    return {
      round: data.drwNo,
      drawDate: data.drwNoDate,
      numbers: [data.drwtNo1, data.drwtNo2, data.drwtNo3, data.drwtNo4, data.drwtNo5, data.drwtNo6].sort((a: number, b: number) => a - b),
      bonusNumber: data.bnusNo,
      prizeMoney: {
        first: data.firstWinamnt || 0,
        firstWinners: data.firstPrzwnerCo || 0,
        second: data.secondWinamnt || 0,
        secondWinners: data.secondPrzwnerCo || 0,
      },
    };
  } catch {
    return null;
  }
}

// 당첨금까지 확인된 결과만 메모리에 담는다 (미집계 결과는 다음 조회에서 다시 확인)
function rememberRound(result: LottoResult): void {
  if (!isPrizePending(result)) roundCache.set(result.round, { data: result, fetchedAt: Date.now() });
}

// 특정 회차 데이터 가져오기 (3단계 fallback)
export async function fetchRound(round: number): Promise<{ data: LottoResult; source: string } | null> {
  // 1. 메모리 캐시 확인
  const cached = roundCache.get(round);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return { data: cached.data, source: 'cache' };
  }
  // 최신 회차는 발표·집계 중일 수 있어 짧게 확인한다
  const mode: FetchMode = round >= getEstimatedLatestRound() ? 'probe' : 'cached';

  // 2. gon-services 백엔드 API (primary)
  const gonResult = await fetchFromGonServices(round, mode);
  if (gonResult) {
    rememberRound(gonResult);
    return { data: gonResult, source: 'gon_services' };
  }

  // 3. 정적 데이터 확인 (fallback)
  const staticResult = REAL_LOTTO_DATA.find(d => d.round === round);
  if (staticResult) {
    return { data: staticResult, source: 'static_data' };
  }

  // 4. smok95 API (secondary fallback)
  const smok95Result = await fetchFromSmok95(round, mode);
  if (smok95Result) {
    rememberRound(smok95Result);
    return { data: smok95Result, source: 'smok95_api' };
  }

  // 5. 동행복권 API (마지막 시도)
  const dhlResult = await fetchFromDhlottery(round, mode);
  if (dhlResult) {
    rememberRound(dhlResult);
    return { data: dhlResult, source: 'dhlottery_api' };
  }

  return null;
}

// 최신 회차 데이터 가져오기
export async function fetchLatestRound(): Promise<{ data: LottoResult; source: string }> {
  const estimatedLatest = getEstimatedLatestRound();

  // 예상 최신 회차부터 5회차 전까지 시도
  for (let round = estimatedLatest; round >= estimatedLatest - 5; round--) {
    const result = await fetchRound(round);
    if (result) return result;
  }

  // 정적 데이터의 마지막 항목 반환
  const lastStatic = REAL_LOTTO_DATA[REAL_LOTTO_DATA.length - 1];
  if (lastStatic) {
    return { data: lastStatic, source: 'static_data_fallback' };
  }

  throw new Error('로또 데이터를 가져올 수 없습니다.');
}

// 세 출처(gon-services 단건·smok95·동행복권)를 동시에 물어 먼저 온 '당첨금까지 집계된' 결과를 쓴다.
// 추첨(토 20:35) 직후에는 어느 쪽이 먼저 갱신될지 알 수 없어 순서대로 기다리면 그만큼 늦어진다.
// 모두 번호만 있고 당첨금이 미집계면 먼저 온 결과를 쓴다(화면은 '당첨금 집계 중').
async function fetchRoundFastest(round: number, mode: FetchMode): Promise<LottoResult | null> {
  const cached = roundCache.get(round);
  if (mode !== 'fresh' && cached && Date.now() - cached.fetchedAt < CACHE_TTL) return cached.data;

  const sources = [fetchFromGonServices, fetchFromSmok95, fetchFromDhlottery];
  return new Promise<LottoResult | null>((resolve) => {
    let remaining = sources.length;
    let firstPending: LottoResult | null = null;
    const settle = (r: LottoResult | null) => {
      if (r && r.round === round) {
        if (isPrizePending(r)) firstPending ??= r;
        else {
          rememberRound(r);
          resolve(r);
        }
      }
      if (--remaining === 0) resolve(firstPending);
    };
    for (const source of sources) source(round, mode).then(settle, () => settle(null));
  });
}

// fromRound 부터 예상 최신 회차(+1)까지 이어지는 새 회차를 채운다 (처음 비는 회차에서 멈춤)
async function fetchNewRounds(fromRound: number, mode: FetchMode): Promise<LottoResult[]> {
  const estimatedLatest = getEstimatedLatestRound();
  const newRounds: LottoResult[] = [];
  for (let round = fromRound; round <= estimatedLatest + 1; round++) {
    const result = await fetchRoundFastest(round, mode);
    if (!result) break;
    newRounds.push(result);
  }
  return newRounds;
}

// gon-services 전체(없으면 정적 데이터) + 빠진 최신 회차·미집계 당첨금 보충
async function loadAllLottoData(mode: 'cached' | 'fresh'): Promise<LottoResult[]> {
  const gonData = await fetchAllFromGonServices(mode);
  const base = gonData && gonData.length > 0 ? gonData : [...REAL_LOTTO_DATA];
  const latest = base[base.length - 1];
  // 마지막 회차 당첨금이 아직 미집계면 그 회차부터 다시 확인한다
  const recheckLatest = !!latest && isPrizePending(latest);
  const fromRound = latest ? (recheckLatest ? latest.round : latest.round + 1) : 1;
  if (fromRound > getEstimatedLatestRound()) return base;

  const newRounds = await fetchNewRounds(fromRound, mode === 'fresh' ? 'fresh' : 'probe');
  if (newRounds.length === 0) return base;
  return [...(recheckLatest ? base.slice(0, -1) : base), ...newRounds];
}

// 전체 로또 데이터 반환 (React cache로 같은 요청 내 중복 호출 dedup)
// Priority: gon-services API (전체) → 정적 데이터. 어느 쪽이든 추첨이 끝났는데 빠진 최신 회차는
// smok95·동행복권에서 보충한다 (gon-services 반영이 늦어도 추첨 직후 새 회차가 바로 보이게).
// 메모리 캐시는 최신 회차·당첨금이 확인된 동안만 쓰고, 아니면 공유 데이터 캐시를 거쳐 다시 확인한다.
export const getAllLottoData = cache(async (): Promise<LottoResult[]> => {
  if (
    allDataCache &&
    Date.now() - allDataCache.fetchedAt < ALL_DATA_CACHE_TTL &&
    isSettled(allDataCache.data, getEstimatedLatestRound())
  ) {
    return allDataCache.data;
  }

  const allData = await loadAllLottoData('cached');
  allDataCache = { data: allData, fetchedAt: Date.now() };
  return allData;
});

/**
 * cron 전용: 이 인스턴스의 메모리와 Next 데이터 캐시를 모두 거치지 않고 출처에서 새로 읽는다.
 * 다른 인스턴스는 호출한 라우트가 revalidateTag(LOTTO_DATA_TAG) 로 공유 캐시를 비워 다음 조회에서 새로 읽는다.
 * (revalidateTag 는 요청이 끝난 뒤 적용되므로 같은 요청 안의 이 조회는 no-store 여야 새 값을 본다)
 */
export async function refreshAllLottoData(): Promise<LottoResult[]> {
  invalidateAllDataCache();
  const allData = await loadAllLottoData('fresh');
  allDataCache = { data: allData, fetchedAt: Date.now() };
  return allData;
}

// 가장 최근 회차 데이터 반환 (빈 배열 가드 포함)
export function getLatestRound(allData: LottoResult[]): LottoResult | null {
  return allData.length > 0 ? allData[allData.length - 1] : null;
}

// 외부 캐시 무효화 콜백 (API 라우트 등에서 등록)
const cacheInvalidationCallbacks: Array<() => void> = [];

export function registerCacheInvalidationCallback(cb: () => void): void {
  cacheInvalidationCallbacks.push(cb);
}

// 전체 데이터 캐시 무효화 (cron 등에서 호출)
export function invalidateAllDataCache(): void {
  allDataCache = null;
  roundCache.clear();
  // 등록된 외부 캐시도 모두 무효화
  for (const cb of cacheInvalidationCallbacks) {
    cb();
  }
}
