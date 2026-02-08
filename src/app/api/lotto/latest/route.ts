import { NextRequest, NextResponse } from 'next/server';
import { fetchLatestRound } from '@/lib/dataFetcher';

export async function GET(request: NextRequest) {
  try {
    const { data, source } = await fetchLatestRound();

    const sourceMessages: Record<string, string> = {
      cache: '캐시 데이터',
      static_data: `정적 데이터 (${data.round}회차)`,
      smok95_api: '실시간 데이터 (smok95)',
      dhlottery_api: '동행복권 실시간 API',
      static_data_fallback: `정적 데이터 (${data.round}회차)`,
    };

    return NextResponse.json({
      success: true,
      data,
      source,
      message: sourceMessages[source] || source,
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
