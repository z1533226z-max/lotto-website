import type { LottoResult } from '@/types/lotto';
import { REAL_LOTTO_DATA } from '@/data/realLottoData';

// 메모리 캐시 (Vercel Serverless 인스턴스 내 지속)
const roundCache = new Map<number, { data: LottoResult; fetchedAt: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1시간

// 전체 데이터 캐시 (정적 + 동적 합산)
let allDataCache: { data: LottoResult[]; fetchedAt: number } | null = null;
const ALL_DATA_CACHE_TTL = 30 * 60 * 1000; // 30분

// 현재 예상 최신 회차 계산
export function getEstimatedLatestRound(): number {
  const startDate = new Date('2002-12-07');
  const now = new Date();
  const diffTime = now.getTime() - startDate.getTime();
  const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
  return diffWeeks + 1;
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
        first: data.divisions?.[0]?.prize || 0,
        firstWinners: data.divisions?.[0]?.winners || 0,
        second: data.divisions?.[1]?.prize || 0,
        secondWinners: data.divisions?.[1]?.winners || 0,
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

  // 2. 정적 데이터 확인 (가장 빠름)
  const staticResult = REAL_LOTTO_DATA.find(d => d.round === round);
  if (staticResult) {
    return { data: staticResult, source: 'static_data' };
  }

  // 3. smok95 API (안정적)
  const smok95Result = await fetchFromSmok95(round);
  if (smok95Result) {
    roundCache.set(round, { data: smok95Result, fetchedAt: Date.now() });
    return { data: smok95Result, source: 'smok95_api' };
  }

  // 4. 동행복권 API (마지막 시도)
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

// 전체 로또 데이터 반환 (정적 데이터 + 최신 API 데이터 합산)
// 서버 컴포넌트에서 REAL_LOTTO_DATA 대신 사용
export async function getAllLottoData(): Promise<LottoResult[]> {
  // 캐시 확인
  if (allDataCache && Date.now() - allDataCache.fetchedAt < ALL_DATA_CACHE_TTL) {
    return allDataCache.data;
  }

  const staticData = [...REAL_LOTTO_DATA];
  const lastStaticRound = staticData.length > 0
    ? staticData[staticData.length - 1].round
    : 0;
  const estimatedLatest = getEstimatedLatestRound();

  // 정적 데이터 이후 ~ 예상 최신 회차까지 fetch 시도
  const newRounds: LottoResult[] = [];
  for (let round = lastStaticRound + 1; round <= estimatedLatest + 1; round++) {
    // 캐시된 게 있으면 사용
    const cached = roundCache.get(round);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
      newRounds.push(cached.data);
      continue;
    }

    const smok95 = await fetchFromSmok95(round);
    if (smok95) {
      roundCache.set(round, { data: smok95, fetchedAt: Date.now() });
      newRounds.push(smok95);
      continue;
    }

    const dhl = await fetchFromDhlottery(round);
    if (dhl) {
      roundCache.set(round, { data: dhl, fetchedAt: Date.now() });
      newRounds.push(dhl);
      continue;
    }

    // 해당 회차가 없으면 중단 (아직 추첨 안 됨)
    break;
  }

  const allData = [...staticData, ...newRounds];

  // 캐시 저장
  allDataCache = { data: allData, fetchedAt: Date.now() };

  return allData;
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
