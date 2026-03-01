import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { signToken, setAuthCookie } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

/**
 * POST: 로그인
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nickname, password } = body;

    // 입력 유효성 검사
    if (!nickname || !password) {
      return NextResponse.json(
        { success: false, error: '닉네임과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 사용자 조회
    const { data: user, error: queryError } = await supabase
      .from('user_profiles')
      .select('id, nickname, password_hash')
      .eq('nickname', nickname.trim())
      .maybeSingle();

    if (queryError) {
      console.error('User query error:', queryError);
      return NextResponse.json(
        { success: false, error: '서버 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: '닉네임 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // 비밀번호 검증
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: '닉네임 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // 마지막 로그인 시간 업데이트
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    if (updateError) {
      console.error('Last login update error:', updateError);
      // 업데이트 실패해도 로그인은 성공으로 처리
    }

    // JWT 토큰 생성 및 쿠키 설정
    const token = signToken(user.id, user.nickname);
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        nickname: user.nickname,
      },
    });

    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
