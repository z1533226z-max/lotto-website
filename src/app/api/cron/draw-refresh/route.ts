import { NextRequest, NextResponse } from 'next/server';
import { getAllLottoData, invalidateAllDataCache, getEstimatedLatestRound } from '@/lib/dataFetcher';
import { revalidatePath } from 'next/cache';
import { DRAW_REVALIDATE_PATHS, getRoundPathsToRevalidate } from '@/lib/revalidateTargets';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * Vercel Cron - 토요일 추첨(20:35 KST) 직후 빠른 반영 전용
 *
 * 실행 시점: 토요일 KST 20:40~21:50 (vercel.json, UTC 11:40~12:50) 5~10분 간격.
 * 동작: 메모리 캐시 무효화 → 새 회차 조회(gon-services + smok95·동행복권 동시 보충) → 주요 페이지 ISR 무효화.
 * 판매점 수집·저장 번호 판정·워밍업은 하지 않는다 (21:00 이후 /api/cron/revalidate 가 맡음).
 *
 * 응답: 새 회차가 아직 없으면(발표 전) 정상 대기로 보고 200 + pending:true.
 * 데이터 조회 자체가 실패했을 때만 503 (실패를 숨기지 않는다).
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    invalidateAllDataCache();
    const allData = await getAllLottoData();
    const latestRound = allData.length > 0 ? allData[allData.length - 1].round : 0;
    const expectedRound = getEstimatedLatestRound();
    if (latestRound === 0) throw new Error('No lotto data');

    const dataUpToDate = latestRound >= expectedRound;
    const paths = dataUpToDate
      ? [...DRAW_REVALIDATE_PATHS, ...getRoundPathsToRevalidate(latestRound, expectedRound)]
      : [];
    // 새 회차가 아직 없으면 페이지를 다시 만들어도 같은 내용이라 건너뛴다.
    // 레이아웃 전체 무효화('/', 'layout')는 회차 페이지 1,200여 개를 모두 다시 만들게 하므로 여기서는 하지 않는다.
    for (const path of paths) revalidatePath(path);

    return NextResponse.json({
      success: true,
      pending: !dataUpToDate,
      latestRound,
      expectedRound,
      revalidatedPaths: paths.length,
      elapsed: `${Date.now() - startTime}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron draw-refresh] failed:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'draw-refresh failed',
        elapsed: `${Date.now() - startTime}ms`,
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
