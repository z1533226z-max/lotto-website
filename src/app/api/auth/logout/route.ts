import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST: 로그아웃
 */
export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
    });

    clearAuthCookie(response);

    return response;
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
