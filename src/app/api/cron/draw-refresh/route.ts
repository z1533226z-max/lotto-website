import { NextRequest, NextResponse } from 'next/server';
import { refreshAllLottoData, getEstimatedLatestRound, LOTTO_DATA_TAG } from '@/lib/dataFetcher';
import { revalidatePath, revalidateTag } from 'next/cache';
import { DRAW_REVALIDATE_PATHS, getRoundPathsToRevalidate } from '@/lib/revalidateTargets';
import { isPrizePending } from '@/lib/prizeStatus';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * Vercel Cron - 토요일 추첨(20:35 KST) 직후 빠른 반영 전용
 *
 * 실행 시점: 토요일 KST 20:40~21:50 (vercel.json, UTC 11:40~12:50) 5~10분 간격.
 * 동작: 공유 데이터 캐시 태그 무효화 + 캐시를 거치지 않고 새 회차 조회(gon-services + smok95·동행복권 동시 보충)
 *       → 주요 페이지 ISR 무효화. 다른 인스턴스의 메모리 캐시는 최신 회차·당첨금이 확인되기 전에는
 *       쓰이지 않으므로(dataFetcher) 재생성된 페이지도 새 값을 읽는다.
 * 판매점 수집·저장 번호 판정·워밍업은 하지 않는다 (21:00 이후 /api/cron/revalidate 가 맡음).
 *
 * 응답: 새 회차가 아직 없으면(발표 전) 정상 대기로 보고 200 + pending:true.
 *       번호는 나왔지만 당첨금·인원이 미집계면 prizePending:true (페이지는 번호 반영을 위해 다시 만든다).
 *       complete:true 는 번호와 당첨금이 모두 반영됐을 때만.
 * 데이터 조회 자체가 실패했을 때만 503 (실패를 숨기지 않는다).
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 다른 인스턴스·페이지가 데이터 캐시에 남은 '발표 전'·'미집계' 응답을 다시 쓰지 않게 비운다 (요청 끝에 적용)
    revalidateTag(LOTTO_DATA_TAG);
    const allData = await refreshAllLottoData();
    const latest = allData.length > 0 ? allData[allData.length - 1] : null;
    const latestRound = latest?.round ?? 0;
    const expectedRound = getEstimatedLatestRound();
    if (!latest) throw new Error('No lotto data');

    const dataUpToDate = latestRound >= expectedRound;
    const prizePending = isPrizePending(latest);
    const paths = dataUpToDate
      ? [...DRAW_REVALIDATE_PATHS, ...getRoundPathsToRevalidate(latestRound, expectedRound)]
      : [];
    // 새 회차가 아직 없으면 페이지를 다시 만들어도 같은 내용이라 건너뛴다.
    // 레이아웃 전체 무효화('/', 'layout')는 회차 페이지 1,200여 개를 모두 다시 만들게 하므로 여기서는 하지 않는다.
    for (const path of paths) revalidatePath(path);

    return NextResponse.json({
      success: true,
      pending: !dataUpToDate,
      prizePending,
      complete: dataUpToDate && !prizePending,
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
