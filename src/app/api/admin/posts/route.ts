import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getAdminFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET: 게시글 목록 조회 (관리자 전용)
 */
export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    const supabase = getServiceSupabase();

    const { data: posts, error, count } = await supabase.from('posts')
      .select('id, nickname, title, category, likes, views, is_pinned, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Admin posts query error:', error);
      return NextResponse.json(
        { success: false, error: '게시글 목록을 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    // 전체 통계
    const { count: totalPosts } = await supabase.from('posts')
      .select('*', { count: 'exact', head: true });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { count: todayPosts } = await supabase.from('posts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString());

    return NextResponse.json({
      success: true,
      posts: posts || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      stats: {
        totalPosts: totalPosts || 0,
        todayPosts: todayPosts || 0,
      },
    });
  } catch (error) {
    console.error('Admin posts API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH: 게시글 고정/해제 (관리자 전용)
 */
export async function PATCH(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { postId, is_pinned } = body;

    if (!postId || typeof is_pinned !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'postId와 is_pinned가 필요합니다.' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const { error } = await supabase.from('posts')
      .update({ is_pinned })
      .eq('id', postId);

    if (error) {
      console.error('Admin post pin error:', error);
      return NextResponse.json(
        { success: false, error: '처리에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: is_pinned ? '게시글이 고정되었습니다.' : '고정이 해제되었습니다.',
    });
  } catch (error) {
    console.error('Admin PATCH posts error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: 게시글 삭제 (관리자 전용 - 비밀번호 불필요)
 */
export async function DELETE(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { success: false, error: 'postId가 필요합니다.' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const { error } = await supabase.from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Admin post delete error:', error);
      return NextResponse.json(
        { success: false, error: '게시글 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '게시글이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Admin DELETE posts error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
