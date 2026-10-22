import { cache } from 'react';
import type { LottoResult } from '@/types/lotto';
import { REAL_LOTTO_DATA } from '@/data/realLottoData';
import { getLatestDrawnRound } from '@/lib/drawSchedule';

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

// 메모리 캐시 (Vercel Serverless 인스턴스 내 지속)
const roundCache = new Map<number, { data: LottoResult; fetchedAt: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1시간

// 전체 데이터 캐시 (정적 + 동적 합산)
let allDataCache: { data: LottoResult[]; fetchedAt: number } | null = null;
const ALL_DATA_CACHE_TTL = 30 * 60 * 1000; // 30분

// 현재 추첨이 끝난 최신 회차 (KST 토요일 20:35 기준).
// 이전 구현은 서버 로컬 타임존(Vercel=UTC) 자정 기준이라 KST 토요일 09:00~20:35에
// 아직 추첨하지 않은 회차를 최신으로 계산했다.
export function getEstimatedLatestRound(now: Date = new Date()): number {
  return getLatestDrawnRound(now);
}

// gon-services 백엔드 API에서 전체 데이터 fetch
async function fetchAllFromGonServices(): Promise<LottoResult[] | null> {
  if (!GON_SERVICES_URL) return null;
  try {
    const response = await fetch(`${GON_SERVICES_URL}/api/v1/lotto/results`, {
      signal: AbortSignal.timeout(10000),
      cache: 'no-store', // 메모리 캐시(allDataCache)로 제어, Next.js 이중 캐싱 방지
    });
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
async function fetchFromGonServices(round: number): Promise<LottoResult | null> {
  if (!GON_SERVICES_URL) return null;
  try {
    const response = await fetch(`${GON_SERVICES_URL}/api/v1/lotto/round/${round}`, {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 3600 },
    });
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
async function fetchFromSmok95(round: number): Promise<LottoResult | null> {
  const url = `https://smok95.github.io/lotto/results/${round}.json`;
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 3600 },
    });
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
async function fetchFromDhlottery(round: number): Promise<LottoResult | null> {
  const url = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/javascript, */*',
        'Referer': 'https://www.dhlottery.co.kr/gameResult.do?method=byWin',
      },
      signal: AbortSignal.timeout(5000),
    });
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

// 특정 회차 데이터 가져오기 (3단계 fallback)
export async function fetchRound(round: number): Promise<{ data: LottoResult; source: string } | null> {
  // 1. 메모리 캐시 확인
  const cached = roundCache.get(round);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return { data: cached.data, source: 'cache' };
  }

  // 2. gon-services 백엔드 API (primary)
  const gonResult = await fetchFromGonServices(round);
  if (gonResult) {
    roundCache.set(round, { data: gonResult, fetchedAt: Date.now() });
    return { data: gonResult, source: 'gon_services' };
  }

  // 3. 정적 데이터 확인 (fallback)
  const staticResult = REAL_LOTTO_DATA.find(d => d.round === round);
  if (staticResult) {
    return { data: staticResult, source: 'static_data' };
  }

  // 4. smok95 API (secondary fallback)
  const smok95Result = await fetchFromSmok95(round);
  if (smok95Result) {
    roundCache.set(round, { data: smok95Result, fetchedAt: Date.now() });
    return { data: smok95Result, source: 'smok95_api' };
  }

  // 5. 동행복권 API (마지막 시도)
  const dhlResult = await fetchFromDhlottery(round);
  if (dhlResult) {
    roundCache.set(round, { data: dhlResult, fetchedAt: Date.now() });
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

// 두 공개 출처(smok95·동행복권)를 동시에 물어 먼저 온 유효한 결과를 쓴다.
// 추첨(토 20:35) 직후에는 어느 쪽이 먼저 갱신될지 알 수 없어 순서대로 기다리면 그만큼 늦어진다.
async function fetchNewRoundFastest(round: number): Promise<LottoResult | null> {
  const cached = roundCache.get(round);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) return cached.data;

  const result = await new Promise<LottoResult | null>((resolve) => {
    let pending = 2;
    const settle = (r: LottoResult | null) => {
      if (r && r.round === round) resolve(r);
      else if (--pending === 0) resolve(null);
    };
    fetchFromSmok95(round).then(settle, () => settle(null));
    fetchFromDhlottery(round).then(settle, () => settle(null));
  });
  if (result) roundCache.set(round, { data: result, fetchedAt: Date.now() });
  return result;
}

// fromRound 부터 예상 최신 회차(+1)까지 이어지는 새 회차를 채운다 (처음 비는 회차에서 멈춤)
async function fetchNewRounds(fromRound: number): Promise<LottoResult[]> {
  const estimatedLatest = getEstimatedLatestRound();
  const newRounds: LottoResult[] = [];
  for (let round = fromRound; round <= estimatedLatest + 1; round++) {
    const result = await fetchNewRoundFastest(round);
    if (!result) break;
    newRounds.push(result);
  }
  return newRounds;
}

// 전체 로또 데이터 반환 (React cache로 같은 요청 내 중복 호출 dedup)
// Priority: gon-services API (전체) → 정적 데이터. 어느 쪽이든 추첨이 끝났는데 빠진 최신 회차는
// smok95·동행복권에서 보충한다 (gon-services 반영이 늦어도 추첨 직후 새 회차가 바로 보이게).
export const getAllLottoData = cache(async (): Promise<LottoResult[]> => {
  if (allDataCache && Date.now() - allDataCache.fetchedAt < ALL_DATA_CACHE_TTL) {
    return allDataCache.data;
  }

  const gonData = await fetchAllFromGonServices();
  const base = gonData && gonData.length > 0 ? gonData : [...REAL_LOTTO_DATA];
  const lastRound = base.length > 0 ? base[base.length - 1].round : 0;
  const newRounds = lastRound < getEstimatedLatestRound() ? await fetchNewRounds(lastRound + 1) : [];

  const allData = newRounds.length > 0 ? [...base, ...newRounds] : base;
  allDataCache = { data: allData, fetchedAt: Date.now() };

  return allData;
});

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
