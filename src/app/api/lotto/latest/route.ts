import { NextRequest, NextResponse } from 'next/server';
import type { LottoResult } from '@/types/lotto';
import { REAL_LOTTO_DATA, getLatestLottoData } from '@/data/realLottoData';

// 최신 회차를 자동으로 감지하는 함수
function getLatestRoundNumber(): number {
  const startDate = new Date('2002-12-07');
  const now = new Date();
  const diffTime = now.getTime() - startDate.getTime();
  const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
  return diffWeeks + 1;
}

// 동행복권 API에서 로또 데이터를 가져오는 함수
async function fetchFromDhlottery(round: number): Promise<LottoResult | null> {
  const url = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*',
        'Accept-Language': 'ko-KR,ko;q=0.9',
        'Referer': 'https://www.dhlottery.co.kr/gameResult.do?method=byWin',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return null;

    const text = await response.text();

    // HTML 반환 감지 (차단/리다이렉트)
    if (text.includes('<!DOCTYPE') || text.includes('<html')) {
      console.warn(`동행복권 API가 HTML 반환 (${round}회차) - 차단 가능성`);
      return null;
    }

    const data = JSON.parse(text);
    if (data.returnValue === 'fail' || !data.drwNo) return null;

    return {
      round: data.drwNo,
      drawDate: data.drwNoDate,
      numbers: [data.drwtNo1, data.drwtNo2, data.drwtNo3, data.drwtNo4, data.drwtNo5, data.drwtNo6].sort((a, b) => a - b),
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

// 최신 로또 데이터 가져오기 (API 우선, realLottoData fallback)
async function getLatestResult(): Promise<{ result: LottoResult; source: string }> {
  const estimatedLatest = getLatestRoundNumber();

  // 1단계: 동행복권 API에서 최신 회차 시도
  for (let round = estimatedLatest; round >= estimatedLatest - 5; round--) {
    const apiResult = await fetchFromDhlottery(round);
    if (apiResult) {
      return { result: apiResult, source: 'live_api' };
    }
  }

  // 2단계: realLottoData에서 최신 데이터 사용
  const fallback = getLatestLottoData();
  if (fallback) {
    return { result: fallback, source: 'static_data' };
  }

  // 3단계: 최후의 수단
  throw new Error('로또 데이터를 가져올 수 없습니다.');
}

export async function GET(request: NextRequest) {
  try {
    const { result, source } = await getLatestResult();

    return NextResponse.json({
      success: true,
      data: result,
      source,
      message: source === 'live_api' ? '동행복권 실시간 API 연결' : `정적 데이터 (${result.round}회차)`,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '로또 데이터를 가져올 수 없습니다.',
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
