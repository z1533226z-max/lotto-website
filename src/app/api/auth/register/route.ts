import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { signToken, setAuthCookie, getClientIp } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

const MAX_REGISTERS_PER_HOUR = 3;
const SALT_ROUNDS = 10;

/**
 * 회원가입 rate limit 확인
 */
async function checkRateLimit(ip: string): Promise<boolean> {
  const supabase = getServiceSupabase();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count, error } = await supabase
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .eq('action_type', 'register')
    .gte('created_at', oneHourAgo);

  if (error) {
    console.error('Rate limit check error:', error);
    return true; // fail open
  }

  return (count || 0) < MAX_REGISTERS_PER_HOUR;
}

/**
 * Rate limit 기록 추가
 */
async function recordRateLimit(ip: string): Promise<void> {
  const supabase = getServiceSupabase();
  await supabase.from('rate_limits').insert({
    ip_address: ip,
    action_type: 'register',
  });
}

/**
 * POST: 회원가입
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

    const trimmedNickname = nickname.trim();

    if (trimmedNickname.length < 2 || trimmedNickname.length > 15) {
      return NextResponse.json(
        { success: false, error: '닉네임은 2~15자로 입력해주세요.' },
        { status: 400 }
      );
    }

    if (password.length < 4 || password.length > 30) {
      return NextResponse.json(
        { success: false, error: '비밀번호는 4~30자로 입력해주세요.' },
        { status: 400 }
      );
    }

    // Rate limiting
    const clientIp = getClientIp(request);
    const allowed = await checkRateLimit(clientIp);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: '회원가입 횟수를 초과했습니다. 1시간 후 다시 시도해주세요.' },
        { status: 429 }
      );
    }

    const supabase = getServiceSupabase();

    // 닉네임 중복 확인
    const { data: existing, error: checkError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('nickname', trimmedNickname)
      .maybeSingle();

    if (checkError) {
      console.error('Nickname check error:', checkError);
      return NextResponse.json(
        { success: false, error: '서버 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { success: false, error: '이미 사용 중인 닉네임입니다.' },
        { status: 409 }
      );
    }

    // 비밀번호 해시
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // user_profiles 테이블에 사용자 생성
    const { data: user, error: insertError } = await supabase
      .from('user_profiles')
      .insert({
        nickname: trimmedNickname,
        password_hash,
      })
      .select('id, nickname')
      .single();

    if (insertError) {
      console.error('User creation error:', insertError);
      return NextResponse.json(
        { success: false, error: '회원가입에 실패했습니다.' },
        { status: 500 }
      );
    }

    // user_progress 테이블에 초기 데이터 생성
    const { error: progressError } = await supabase
      .from('user_progress')
      .insert({
        user_id: user.id,
      });

    if (progressError) {
      console.error('User progress creation error:', progressError);
      // 진행 데이터 생성 실패해도 회원가입은 성공으로 처리
    }

    // JWT 토큰 생성 및 쿠키 설정
    const token = signToken(user.id, user.nickname);
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        nickname: user.nickname,
      },
    }, { status: 201 });

    setAuthCookie(response, token);

    // Rate limit 기록
    await recordRateLimit(clientIp);

    return response;
  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
