import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getTodayKST, shiftDateStr } from '@/lib/dailyFortuneGenerator';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * Vercel Cron Job - 매일 자정(KST) 실행
 * 오늘의 띠별 행운번호 페이지 ISR 캐시 무효화
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

    const today = getTodayKST();

    // ISR 캐시 무효화 - 오늘 + 어제 페이지
    const yesterdayStr = shiftDateStr(today, -1);

    revalidatePath('/lotto/daily-fortune');
    revalidatePath(`/lotto/daily-fortune/${today}`);
    revalidatePath(`/lotto/daily-fortune/${yesterdayStr}`);

    // 내일 페이지도 미리 무효화 (내일 미리보기용)
    const tomorrowStr = shiftDateStr(today, 1);
    revalidatePath(`/lotto/daily-fortune/${tomorrowStr}`);

    const elapsed = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      date: today,
      revalidated: [today, yesterdayStr, tomorrowStr],
      elapsed: `${elapsed}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`[Daily Fortune Cron] Failed (${elapsed}ms):`, error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed',
        elapsed: `${elapsed}ms`,
      },
      { status: 500 }
    );
  }
}
