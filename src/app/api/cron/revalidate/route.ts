import { NextRequest, NextResponse } from 'next/server';
import { refreshAllLottoData, getEstimatedLatestRound, LOTTO_DATA_TAG } from '@/lib/dataFetcher';
import { fetchAndSaveWinningStores } from '@/lib/storeFetcher';
import { getServiceSupabase } from '@/lib/supabase';
import { revalidatePath, revalidateTag } from 'next/cache';
import { isPrizePending } from '@/lib/prizeStatus';
import { DRAW_REVALIDATE_PATHS, getRoundPathsToRevalidate } from '@/lib/revalidateTargets';
import type { SavedNumber } from '@/types/database';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Vercel Cron Job - 매주 토요일 추첨 후 자동 실행
 *
 * 실행 시점:
 *   - 토요일 UTC 12:00 (KST 21:00) - 추첨 직후
 *   - 토요일 UTC 13:00 (KST 22:00) - 여유 시간
 *   - 토요일 UTC 15:00 (KST 일요일 00:00) - 최종 확인
 *   (20:40~21:50 사이 5~10분 간격 빠른 반영은 /api/cron/draw-refresh 가 맡는다)
 *
 * 동작:
 *   1. 공유 데이터 캐시 태그 무효화 (다른 인스턴스도 다음 조회에서 새로 읽음)
 *   2. API에서 최신 데이터 fetch (캐시를 거치지 않음, 당첨금 미집계면 failedStages 'prizes')
 *   3. 모든 주요 페이지 ISR 캐시 무효화 (revalidatePath)
 *   4. 주요 API 엔드포인트 워밍업 호출
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  let stage = 'latestRound';
  const failedStages: string[] = [];

  try {
    // Vercel Cron 인증 (필수)
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. 공유 데이터 캐시 태그 무효화(요청 끝에 적용 — 다른 인스턴스의 다음 조회가 새로 읽음)
    revalidateTag(LOTTO_DATA_TAG);

    // 2. 최신 데이터 fetch (이 인스턴스 메모리·데이터 캐시를 거치지 않고 출처에서)
    // 여러 번 시도하여 안정성 확보
    let allData = await refreshAllLottoData();
    let latestRound = allData.length > 0 ? allData[allData.length - 1].round : 0;
    const expectedRound = getEstimatedLatestRound();

    // 최신 회차를 못 가져왔으면 재시도 (API 지연 대비)
    if (latestRound < expectedRound) {
      console.log(`[Cron] 예상 회차(${expectedRound}) > 실제 회차(${latestRound}), 5초 후 재시도`);
      await new Promise(r => setTimeout(r, 5000));
      allData = await refreshAllLottoData();
      latestRound = allData.length > 0 ? allData[allData.length - 1].round : 0;
    }

    const dataUpToDate = latestRound > 0 && latestRound >= expectedRound;
    if (!dataUpToDate) failedStages.push('latestRound');
    // 번호는 있어도 당첨금·인원이 미집계면 완료가 아니다 (다음 cron 에서 다시 확인)
    const prizePending = dataUpToDate && isPrizePending(allData[allData.length - 1]);
    if (prizePending) failedStages.push('prizes');

    // 3. ISR 캐시 무효화 - 모든 주요 페이지
    stage = 'revalidate';
    // 회차 개별 페이지: 최신·직전 + 예상 회차 (/api/cron/draw-refresh 와 같은 목록)
    const pathsToRevalidate = [...DRAW_REVALIDATE_PATHS, ...getRoundPathsToRevalidate(latestRound, expectedRound)];

    for (const path of pathsToRevalidate) {
      revalidatePath(path);
    }

    // 레이아웃 전체 revalidate (공통 부분)
    revalidatePath('/', 'layout');

    // 4. 1등 당첨 판매점 데이터 자동 수집 (pyony.com → Supabase)
    stage = 'stores';
    let storeResult = { success: false, count: 0 };
    if (latestRound > 0) {
      try {
        storeResult = await fetchAndSaveWinningStores(latestRound);
      } catch {
        // 판매점 실패와 무관한 번호 판정은 계속 진행한다.
      }
    }
    if (!storeResult.success) failedStages.push('stores');

    // 5. 저장된 번호 자동 당첨 확인
    stage = 'matchCheck';
    let matchCheckResult = { checked: 0 };
    if (latestRound > 0) {
      try {
        const supabase = getServiceSupabase();
        const { data: uncheckedRaw, error: selectError } = await supabase
          .from('saved_numbers')
          .select('*')
          .eq('round_target', latestRound)
          .is('checked_at', null);
        if (selectError) throw new Error('Saved-number query failed');
        const unchecked = (uncheckedRaw || []) as SavedNumber[];

        if (unchecked.length > 0) {
          const drawData = allData.find(d => d.round === latestRound);
          if (!drawData) throw new Error('Draw data missing for match check');
          const winningSet = new Set(drawData.numbers);
          for (const saved of unchecked) {
            const matchedCount = saved.numbers.filter((n) => winningSet.has(n)).length;
            const bonusMatched = saved.numbers.includes(drawData.bonusNumber);
            const { error: updateError } = await supabase
              .from('saved_numbers')
              .update({
                matched_count: matchedCount,
                bonus_matched: bonusMatched,
                checked_at: new Date().toISOString(),
              })
              .eq('id', saved.id);
            if (updateError) throw new Error('Saved-number update failed');
            matchCheckResult.checked++;
          }
        }
      } catch {
        failedStages.push('matchCheck');
        console.error('[Cron] Match check failed');
      }
    } else {
      failedStages.push('matchCheck');
    }

    // 6. API 엔드포인트 워밍업 (새 인스턴스에서도 캐시 갱신)
    stage = 'warmup';
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lotto.gon.ai.kr';
    const warmupResults: Record<string, string> = {};

    const warmupUrls = [
      '/api/lotto/latest',
      '/api/lotto/statistics',
      '/api/ai-predictions',
    ];

    await Promise.allSettled(
      warmupUrls.map(async (url) => {
        try {
          const res = await fetch(`${baseUrl}${url}`, {
            signal: AbortSignal.timeout(10000),
            headers: { 'Cache-Control': 'no-cache' },
          });
          warmupResults[url] = res.ok ? 'ok' : `error:${res.status}`;
        } catch {
          warmupResults[url] = 'timeout';
        }
      })
    );

    const elapsed = Date.now() - startTime;

    const success = failedStages.length === 0;

    return NextResponse.json({
      success,
      failedStages,
      latestRound,
      expectedRound,
      dataUpToDate,
      prizePending,
      totalRounds: allData.length,
      revalidatedPaths: pathsToRevalidate.length,
      storeData: storeResult,
      matchCheck: matchCheckResult,
      warmupResults,
      elapsed: `${elapsed}ms`,
      timestamp: new Date().toISOString(),
    }, { status: success ? 200 : 503 });
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`[Cron] Revalidation failed (${elapsed}ms):`, error);

    return NextResponse.json(
      {
        success: false,
        failedStages: [...failedStages, stage],
        error: error instanceof Error ? error.message : 'Revalidation failed',
        elapsed: `${elapsed}ms`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
