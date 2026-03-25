import { NextRequest, NextResponse } from 'next/server';
import { getAllLottoData } from '@/lib/dataFetcher';
import { generateWeeklyAnalysis } from '@/lib/weeklyAnalysisGenerator';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * Vercel Cron Job - 매주 일요일 09:00 KST (UTC 00:00)
 * 최신 추첨 결과 기반 주간 분석 페이지 생성
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Vercel Cron 인증
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. 최신 데이터 가져오기
    const allData = await getAllLottoData();
    if (allData.length === 0) {
      return NextResponse.json({ error: 'No data' }, { status: 500 });
    }

    // 2. 주간 분석 생성
    const analysis = generateWeeklyAnalysis(allData);
    if (!analysis) {
      return NextResponse.json({ error: 'Analysis generation failed' }, { status: 500 });
    }

    // 3. 분석 페이지 캐시 무효화
    revalidatePath('/lotto/analysis/weekly');
    revalidatePath('/lotto/analysis/weekly/' + analysis.round);

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      round: analysis.round,
      title: analysis.seoTitle,
      duration: `${duration}ms`,
    });
  } catch (error) {
    console.error('[Weekly Analysis Cron] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
