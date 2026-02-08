import { NextRequest, NextResponse } from 'next/server';

// 동적 라우트로 강제 (revalidatePath 사용 시 필수)
export const dynamic = 'force-dynamic';

/**
 * Vercel Cron Job - 매주 일요일 12:00 UTC (한국시간 월요일 새벽)
 * 토요일 추첨 후 → 일요일에 캐시 갱신 → 적중 결과 업데이트
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

    // revalidatePath를 동적으로 import (빌드 타임에 정적 분석 방지)
    const { revalidatePath } = await import('next/cache');
    revalidatePath('/lotto/ai-hits');
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      message: 'Revalidation triggered',
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
