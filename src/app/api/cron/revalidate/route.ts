import { NextRequest, NextResponse } from 'next/server';
import { getAllLottoData, invalidateAllDataCache } from '@/lib/dataFetcher';

// 동적 라우트로 강제 (revalidatePath 사용 시 필수)
export const dynamic = 'force-dynamic';

/**
 * Vercel Cron Job - 매주 토요일 추첨 후 자동 실행
 * 1. 캐시 무효화
 * 2. 새 데이터 fetch (smok95/동행복권 API)
 * 3. 페이지 revalidate
 */
export async function GET(request: NextRequest) {
  try {
    // Vercel Cron 인증 (선택적 - CRON_SECRET 없으면 스킵)
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // 1. 기존 캐시 무효화
    invalidateAllDataCache();

    // 2. 새 데이터 fetch (정적 데이터 이후 회차를 API에서 가져옴)
    const allData = await getAllLottoData();
    const latestRound = allData.length > 0 ? allData[allData.length - 1].round : 0;

    // 3. 주요 페이지 revalidate
    const { revalidatePath } = await import('next/cache');
    revalidatePath('/', 'layout');
    revalidatePath('/lotto/recent');
    revalidatePath('/lotto/list');
    revalidatePath('/lotto/rankings');
    revalidatePath('/lotto/statistics');
    revalidatePath('/lotto/ai-hits');

    return NextResponse.json({
      success: true,
      message: `Data refreshed and revalidation triggered`,
      latestRound,
      totalRounds: allData.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron revalidate error:', error);
    return NextResponse.json(
      { success: false, error: 'Revalidation failed' },
      { status: 500 }
    );
  }
}
