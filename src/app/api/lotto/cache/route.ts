import { NextRequest, NextResponse } from 'next/server';
import { getAllLottoData } from '@/lib/dataFetcher';

export async function GET(request: NextRequest) {
  try {
    const allData = await getAllLottoData();
    const latestRound = allData.length > 0 ? allData[allData.length - 1].round : 0;

    return NextResponse.json({
      success: true,
      data: {
        metadata: {
          lastUpdated: new Date().toISOString(),
          maxRound: latestRound,
          totalRounds: allData.length,
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
