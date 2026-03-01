import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

const MAX_COMMENTS_PER_HOUR = 10;
const SALT_ROUNDS = 10;

/**
 * 댓글 작성 rate limit 확인
 */
async function checkRateLimit(ip: string): Promise<boolean> {
  const supabase = getServiceSupabase();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count, error } = await supabase
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .eq('action_type', 'comment')
    .gte('created_at', oneHourAgo);

  if (error) {
    console.error('Rate limit check error:', error);
    return true;
  }

  return (count || 0) < MAX_COMMENTS_PER_HOUR;
}

/**
 * Rate limit 기록 추가
 */
async function recordRateLimit(ip: string): Promise<void> {
  const supabase = getServiceSupabase();
  await supabase.from('rate_limits').insert({
    ip_address: ip,
    action_type: 'comment',
  });
}

/**
 * 클라이언트 IP 주소 가져오기
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  return '127.0.0.1';
}

/**
 * POST: 새 댓글 작성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { post_id, parent_id, nickname, password, content } = body;

    // 입력 유효성 검사
    if (!post_id || !nickname || !password || !content) {
      return NextResponse.json(
        { success: false, error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (nickname.length < 2 || nickname.length > 20) {
      return NextResponse.json(
        { success: false, error: '닉네임은 2~20자로 입력해주세요.' },
        { status: 400 }
      );
    }

    if (password.length < 4 || password.length > 30) {
      return NextResponse.json(
        { success: false, error: '비밀번호는 4~30자로 입력해주세요.' },
        { status: 400 }
      );
    }

    if (content.length < 1 || content.length > 1000) {
      return NextResponse.json(
        { success: false, error: '댓글은 1~1000자로 입력해주세요.' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 게시글 존재 확인
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', post_id)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { success: false, error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 부모 댓글 확인 (대댓글인 경우)
    if (parent_id) {
      const { data: parentComment, error: parentError } = await supabase
        .from('comments')
        .select('id')
        .eq('id', parent_id)
        .eq('post_id', post_id)
        .single();

      if (parentError || !parentComment) {
        return NextResponse.json(
          { success: false, error: '상위 댓글을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
    }

    // Rate limiting
    const clientIp = getClientIp(request);
    const allowed = await checkRateLimit(clientIp);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: '댓글 작성 횟수를 초과했습니다. 1시간 후 다시 시도해주세요.' },
        { status: 429 }
      );
    }

    // 비밀번호 해시
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // 댓글 저장
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id,
        parent_id: parent_id || null,
        nickname: nickname.trim(),
        password_hash,
        content: content.trim(),
      })
      .select('id, post_id, parent_id, nickname, content, likes, created_at, updated_at')
      .single();

    if (error) {
      console.error('Comment creation error:', error);
      return NextResponse.json(
        { success: false, error: '댓글 작성에 실패했습니다.' },
        { status: 500 }
      );
    }

    // Rate limit 기록
    await recordRateLimit(clientIp);

    return NextResponse.json({
      success: true,
      comment: data,
    }, { status: 201 });
  } catch (error) {
    console.error('Comment API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * GET: 게시글의 댓글 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('post_id');

    if (!postId) {
      return NextResponse.json(
        { success: false, error: 'post_id가 필요합니다.' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const { data: comments, error } = await supabase
      .from('comments')
      .select('id, post_id, parent_id, nickname, content, likes, created_at, updated_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Comments query error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      comments: comments || [],
    });
  } catch (error) {
    console.error('Comments API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
