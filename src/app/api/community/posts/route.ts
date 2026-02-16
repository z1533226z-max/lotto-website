import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import type { PostCategory } from '@/types/database';

export const dynamic = 'force-dynamic';

const VALID_CATEGORIES: PostCategory[] = ['자유', '예측', '후기', '팁'];
const MAX_POSTS_PER_HOUR = 5;
const SALT_ROUNDS = 10;

/**
 * 게시글 작성 rate limit 확인
 */
async function checkRateLimit(ip: string): Promise<boolean> {
  const supabase = getServiceSupabase();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count, error } = await supabase
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .eq('action_type', 'post')
    .gte('created_at', oneHourAgo);

  if (error) {
    console.error('Rate limit check error:', error);
    return true; // fail open
  }

  return (count || 0) < MAX_POSTS_PER_HOUR;
}

/**
 * Rate limit 기록 추가
 */
async function recordRateLimit(ip: string): Promise<void> {
  const supabase = getServiceSupabase();
  await (supabase.from('rate_limits') as any).insert({
    ip_address: ip,
    action_type: 'post',
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
 * POST: 새 게시글 작성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nickname, password, title, content, category } = body;

    // 입력 유효성 검사
    if (!nickname || !password || !title || !content || !category) {
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

    if (title.length < 2 || title.length > 100) {
      return NextResponse.json(
        { success: false, error: '제목은 2~100자로 입력해주세요.' },
        { status: 400 }
      );
    }

    if (content.length < 5 || content.length > 5000) {
      return NextResponse.json(
        { success: false, error: '내용은 5~5000자로 입력해주세요.' },
        { status: 400 }
      );
    }

    if (!VALID_CATEGORIES.includes(category as PostCategory)) {
      return NextResponse.json(
        { success: false, error: '올바른 카테고리를 선택해주세요.' },
        { status: 400 }
      );
    }

    // Rate limiting
    const clientIp = getClientIp(request);
    const allowed = await checkRateLimit(clientIp);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: '게시글 작성 횟수를 초과했습니다. 1시간 후 다시 시도해주세요.' },
        { status: 429 }
      );
    }

    // 비밀번호 해시
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // 게시글 저장
    const supabase = getServiceSupabase();
    const { data, error } = await (supabase
      .from('posts') as any)
      .insert({
        nickname: nickname.trim(),
        password_hash,
        title: title.trim(),
        content: content.trim(),
        category: category as PostCategory,
      })
      .select('id, nickname, title, content, category, likes, views, is_pinned, created_at, updated_at')
      .single();

    if (error) {
      console.error('Post creation error:', error);
      return NextResponse.json(
        { success: false, error: '게시글 작성에 실패했습니다.' },
        { status: 500 }
      );
    }

    // Rate limit 기록
    await recordRateLimit(clientIp);

    return NextResponse.json({
      success: true,
      post: data,
    }, { status: 201 });
  } catch (error) {
    console.error('Post API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * GET: 게시글 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '20', 10)), 50);
    const sort = searchParams.get('sort') || 'latest';

    const supabase = getServiceSupabase();
    const offset = (page - 1) * limit;

    // posts_with_comment_count 뷰 사용 (댓글 수 자동 포함, N+1 쿼리 제거)
    const viewFields = 'id, nickname, title, category, likes, views, is_pinned, created_at, comment_count';
    const isValidCategory = category && VALID_CATEGORIES.includes(category as PostCategory);

    // 고정글 + 일반글 병렬 조회
    let pinnedQuery = (supabase.from('posts_with_comment_count') as any)
      .select(viewFields)
      .eq('is_pinned', true)
      .order('created_at', { ascending: false });

    let postsQuery = (supabase.from('posts_with_comment_count') as any)
      .select(viewFields, { count: 'exact' })
      .eq('is_pinned', false);

    if (isValidCategory) {
      pinnedQuery = pinnedQuery.eq('category', category as PostCategory);
      postsQuery = postsQuery.eq('category', category as PostCategory);
    }

    // 정렬
    switch (sort) {
      case 'popular':
        postsQuery = postsQuery.order('views', { ascending: false });
        break;
      case 'likes':
        postsQuery = postsQuery.order('likes', { ascending: false });
        break;
      case 'latest':
      default:
        postsQuery = postsQuery.order('created_at', { ascending: false });
        break;
    }

    // 페이지네이션
    postsQuery = postsQuery.range(offset, offset + limit - 1);

    // 병렬 실행
    const [pinnedResult, postsResult] = await Promise.all([pinnedQuery, postsQuery]);

    if (postsResult.error) {
      console.error('Post list query error:', postsResult.error);
      return NextResponse.json(
        { success: false, error: postsResult.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      pinnedPosts: pinnedResult.data || [],
      posts: postsResult.data || [],
      pagination: {
        page,
        limit,
        total: postsResult.count || 0,
        totalPages: Math.ceil((postsResult.count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Post list API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
