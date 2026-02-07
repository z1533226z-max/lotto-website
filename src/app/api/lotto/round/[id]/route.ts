import { NextRequest, NextResponse } from 'next/server';
import type { LottoResult } from '@/types/lotto';
import { REAL_LOTTO_DATA } from '@/data/realLottoData';

// realLottoData에서 특정 회차 조회
function getFromStaticData(round: number): LottoResult | null {
  return REAL_LOTTO_DATA.find((d) => d.round === round) || null;
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
    if (text.includes('<!DOCTYPE') || text.includes('<html')) return null;

    const data = JSON.parse(text);
    if (data.returnValue === 'fail' || !data.drwNo || !data.drwNoDate || !data.drwtNo1) return null;

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const round = parseInt(params.id);

    if (isNaN(round) || round < 1) {
      return NextResponse.json({
        success: false,
        error: '올바른 회차 번호를 입력해주세요 (1 이상의 숫자)',
      }, { status: 400 });
    }

    // 1단계: 정적 데이터에서 먼저 조회
    const staticResult = getFromStaticData(round);
    if (staticResult) {
      return NextResponse.json({
        success: true,
        data: staticResult,
        source: 'static_data',
        timestamp: new Date().toISOString(),
      });
    }

    // 2단계: 정적 데이터에 없으면 API 호출
    const apiResult = await fetchFromDhlottery(round);
    if (apiResult) {
      return NextResponse.json({
        success: true,
        data: apiResult,
        source: 'official_api',
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: false,
      error: `${round}회차 데이터를 가져올 수 없습니다.`,
      timestamp: new Date().toISOString(),
    }, { status: 503 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '로또 데이터를 가져올 수 없습니다.',
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
