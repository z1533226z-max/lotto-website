import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getAdminFromRequest } from '@/lib/auth';
import type { UserProfile, UserProgressRow } from '@/types/database';

export const dynamic = 'force-dynamic';

/**
 * GET: 회원 목록 조회 (관리자 전용)
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
    const search = searchParams.get('search')?.trim() || '';
    const offset = (page - 1) * limit;

    const supabase = getServiceSupabase();

    // 회원 목록 조회 (user_progress JOIN)
    let query = supabase.from('user_profiles')
      .select('id, nickname, created_at, last_login_at, is_banned, banned_reason', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.ilike('nickname', `%${search}%`);
    }

    const { data: users, error, count } = await query;

    if (error) {
      console.error('Admin users query error:', error);
      return NextResponse.json(
        { success: false, error: '회원 목록을 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    // user_progress 정보 추가
    const userList = users || [];
    const userIds = userList.map((u) => u.id);
    const progressMap: Record<string, UserProgressRow> = {};

    if (userIds.length > 0) {
      const { data: progressData } = await supabase.from('user_progress')
        .select('user_id, ai_generations, simulator_runs, dream_generations, fortune_generations, page_views, saved_numbers_count, match_checks_count, multi_set_generations, visit_streak, longest_streak, last_visit_date, first_visit_date, unlocked_badges, updated_at')
        .in('user_id', userIds);

      if (progressData) {
        progressData.forEach((p) => {
          progressMap[p.user_id] = p as UserProgressRow;
        });
      }
    }

    const enrichedUsers = userList.map((u) => ({
      ...u,
      progress: progressMap[u.id] || null,
    }));

    // 전체 통계
    const { count: totalUsers } = await supabase.from('user_profiles')
      .select('*', { count: 'exact', head: true });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { count: todayUsers } = await supabase.from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString());

    return NextResponse.json({
      success: true,
      users: enrichedUsers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      stats: {
        totalUsers: totalUsers || 0,
        todayUsers: todayUsers || 0,
      },
    });
  } catch (error) {
    console.error('Admin users API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH: 회원 차단/해제 (관리자 전용)
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
    const { userId, action, reason } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: 'userId와 action이 필요합니다.' },
        { status: 400 }
      );
    }

    if (!['ban', 'unban'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'action은 ban 또는 unban이어야 합니다.' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const updateData: Partial<Pick<UserProfile, 'is_banned' | 'banned_reason'>> = {
      is_banned: action === 'ban',
    };

    if (action === 'ban') {
      updateData.banned_reason = reason || '관리자에 의해 차단됨';
    } else {
      updateData.banned_reason = null;
    }

    const { error } = await supabase.from('user_profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('Admin ban/unban error:', error);
      return NextResponse.json(
        { success: false, error: '처리에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: action === 'ban' ? '회원이 차단되었습니다.' : '차단이 해제되었습니다.',
    });
  } catch (error) {
    console.error('Admin PATCH error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: 회원 삭제 (관리자 전용)
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
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId가 필요합니다.' },
        { status: 400 }
      );
    }

    // 자기 자신은 삭제 불가
    if (userId === admin.userId) {
      return NextResponse.json(
        { success: false, error: '자기 자신은 삭제할 수 없습니다.' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const { error } = await supabase.from('user_profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Admin user delete error:', error);
      return NextResponse.json(
        { success: false, error: '회원 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '회원이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Admin DELETE error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
