import { NextRequest, NextResponse } from 'next/server';
import { fetchRound } from '@/lib/dataFetcher';

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

    const result = await fetchRound(round);

    if (result) {
      return NextResponse.json({
        success: true,
        data: result.data,
        source: result.source,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: false,
      error: `${round}회차 데이터를 가져올 수 없습니다.`,
      timestamp: new Date().toISOString(),
    }, { status: 404 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '로또 데이터를 가져올 수 없습니다.',
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
