import { NextRequest, NextResponse } from 'next/server';
import { getAllLottoData, invalidateAllDataCache } from '@/lib/dataFetcher';
import { fetchAndSaveWinningStores } from '@/lib/storeFetcher';
import { getServiceSupabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Vercel Cron Job - 매주 토요일 추첨 후 자동 실행
 *
 * 실행 시점:
 *   - 토요일 UTC 12:00 (KST 21:00) - 추첨 직후
 *   - 토요일 UTC 13:00 (KST 22:00) - 여유 시간
 *   - 토요일 UTC 15:00 (KST 일요일 00:00) - 최종 확인
 *
 * 동작:
 *   1. 메모리 캐시 무효화
 *   2. API에서 최신 데이터 fetch
 *   3. 모든 주요 페이지 ISR 캐시 무효화 (revalidatePath)
 *   4. 주요 API 엔드포인트 워밍업 호출
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Vercel Cron 인증 (필수)
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');
    if (!cronSecret) {
      console.warn('[Cron] CRON_SECRET 환경변수가 설정되지 않았습니다.');
    }
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. 메모리 캐시 전체 무효화
    invalidateAllDataCache();

    // 2. 최신 데이터 fetch (정적 데이터 이후 → API에서 새 회차 가져옴)
    const allData = await getAllLottoData();
    const latestRound = allData.length > 0 ? allData[allData.length - 1].round : 0;

    // 3. ISR 캐시 무효화 - 모든 주요 페이지
    const pathsToRevalidate = [
      '/',
      '/lotto/recent',
      '/lotto/list',
      '/lotto/rankings',
      '/lotto/statistics',
      '/lotto/ai-hits',
      '/lotto/calculator',
      '/lotto/stores',
      '/community',
    ];

    for (const path of pathsToRevalidate) {
      revalidatePath(path);
    }

    // 최신 회차의 개별 페이지도 revalidate
    if (latestRound > 0) {
      revalidatePath(`/lotto/${latestRound}`);
      // 직전 회차도 (당첨금 정보 업데이트 가능)
      revalidatePath(`/lotto/${latestRound - 1}`);
    }

    // 레이아웃 전체 revalidate (공통 부분)
    revalidatePath('/', 'layout');

    // 4. 1등 당첨 판매점 데이터 자동 수집 (pyony.com → Supabase)
    let storeResult = { success: false, count: 0 };
    if (latestRound > 0) {
      storeResult = await fetchAndSaveWinningStores(latestRound);
      console.log(`[Cron] Store data: round=${latestRound}, count=${storeResult.count}`);
    }

    // 5. 저장된 번호 자동 당첨 확인
    let matchCheckResult = { checked: 0 };
    if (latestRound > 0) {
      try {
        const supabase = getServiceSupabase();
        const { data: unchecked } = await (supabase as any)
          .from('saved_numbers')
          .select('*')
          .eq('round_target', latestRound)
          .is('checked_at', null);

        if (unchecked && unchecked.length > 0) {
          const drawData = allData.find(d => d.round === latestRound);
          if (drawData) {
            const winningSet = new Set(drawData.numbers);
            for (const saved of unchecked as any[]) {
              const matchedCount = (saved.numbers as number[]).filter((n: number) => winningSet.has(n)).length;
              const bonusMatched = (saved.numbers as number[]).includes(drawData.bonusNumber);
              await (supabase as any)
                .from('saved_numbers')
                .update({
                  matched_count: matchedCount,
                  bonus_matched: bonusMatched,
                  checked_at: new Date().toISOString(),
                })
                .eq('id', saved.id);
            }
            matchCheckResult.checked = unchecked.length;
            console.log(`[Cron] Match check: ${unchecked.length} numbers checked for round ${latestRound}`);
          }
        }
      } catch (e) {
        console.error('[Cron] Match check failed:', e);
      }
    }

    // 6. API 엔드포인트 워밍업 (새 인스턴스에서도 캐시 갱신)
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

    console.log(`[Cron] Revalidation complete: round=${latestRound}, total=${allData.length}, stores=${storeResult.count}, elapsed=${elapsed}ms`);

    return NextResponse.json({
      success: true,
      latestRound,
      totalRounds: allData.length,
      revalidatedPaths: pathsToRevalidate.length + 2,
      storeData: storeResult,
      matchCheck: matchCheckResult,
      warmupResults,
      elapsed: `${elapsed}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`[Cron] Revalidation failed (${elapsed}ms):`, error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Revalidation failed',
        elapsed: `${elapsed}ms`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
