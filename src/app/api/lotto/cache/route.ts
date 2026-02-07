import { NextRequest, NextResponse } from 'next/server';
import { REAL_LOTTO_DATA } from '@/data/realLottoData';

export async function GET(request: NextRequest) {
  try {
    const latestRound = REAL_LOTTO_DATA.length > 0 ? REAL_LOTTO_DATA[REAL_LOTTO_DATA.length - 1].round : 0;

    return NextResponse.json({
      success: true,
      data: {
        metadata: {
          lastUpdated: new Date().toISOString(),
          maxRound: latestRound,
          totalRounds: REAL_LOTTO_DATA.length,
          isValid: true,
        },
      },
      message: '캐시 상태 조회 완료',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '캐시 상태 조회 실패',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
