import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getAuthFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET: 현재 로그인된 사용자 정보 조회
 */
export async function GET(request: NextRequest) {
  try {
    // 토큰 검증
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const supabase = getServiceSupabase();

    // 사용자 정보 조회
    const { data: user, error } = await (supabase
      .from('user_profiles') as any)
      .select('id, nickname, created_at')
      .eq('id', auth.userId)
      .maybeSingle();

    if (error) {
      console.error('User query error:', error);
      return NextResponse.json(
        { success: false, error: '서버 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        nickname: user.nickname,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('Me API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
