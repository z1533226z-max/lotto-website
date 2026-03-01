import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getAdminFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET: 사이트 전체 통계 (관리자 전용)
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

    const supabase = getServiceSupabase();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayISO = todayStart.toISOString();

    // 7일 전
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoISO = weekAgo.toISOString();

    // 30일 전
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthAgoISO = monthAgo.toISOString();

    // 병렬 쿼리
    const [
      totalUsersRes,
      todayUsersRes,
      weekUsersRes,
      monthUsersRes,
      bannedUsersRes,
      activeUsersRes,
      totalPostsRes,
      todayPostsRes,
      weekPostsRes,
      totalCommentsRes,
      todayCommentsRes,
      pinnedPostsRes,
      progressAggRes,
      savedNumbersRes,
      recentUsersRes,
    ] = await Promise.all([
      // 회원 통계
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }).gte('created_at', todayISO),
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekAgoISO),
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }).gte('created_at', monthAgoISO),
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('is_banned', true),
      // 최근 24시간 활동 회원 (last_login_at 기준)
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }).gte('last_login_at', todayISO),
      // 게시글 통계
      supabase.from('posts').select('*', { count: 'exact', head: true }),
      supabase.from('posts').select('*', { count: 'exact', head: true }).gte('created_at', todayISO),
      supabase.from('posts').select('*', { count: 'exact', head: true }).gte('created_at', weekAgoISO),
      // 댓글 통계
      supabase.from('comments').select('*', { count: 'exact', head: true }),
      supabase.from('comments').select('*', { count: 'exact', head: true }).gte('created_at', todayISO),
      // 고정 게시글 수
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('is_pinned', true),
      // user_progress 집계 (전체 AI 생성 수, 시뮬 등)
      supabase.from('user_progress').select('ai_generations, simulator_runs, dream_generations, fortune_generations, page_views, saved_numbers_count, visit_streak, longest_streak'),
      // 저장된 번호 수
      supabase.from('saved_numbers').select('*', { count: 'exact', head: true }),
      // 최근 가입 회원 5명
      supabase.from('user_profiles').select('id, nickname, created_at, last_login_at').order('created_at', { ascending: false }).limit(5),
    ]);

    // progress 집계
    const progressRows = progressAggRes.data || [];
    let totalAiGenerations = 0;
    let totalSimulatorRuns = 0;
    let totalDreamGenerations = 0;
    let totalFortuneGenerations = 0;
    let totalPageViews = 0;
    let totalSavedNumbers = 0;
    let maxStreak = 0;

    for (const row of progressRows) {
      totalAiGenerations += row.ai_generations || 0;
      totalSimulatorRuns += row.simulator_runs || 0;
      totalDreamGenerations += row.dream_generations || 0;
      totalFortuneGenerations += row.fortune_generations || 0;
      totalPageViews += row.page_views || 0;
      totalSavedNumbers += row.saved_numbers_count || 0;
      if ((row.longest_streak || 0) > maxStreak) maxStreak = row.longest_streak;
    }

    return NextResponse.json({
      success: true,
      stats: {
        users: {
          total: totalUsersRes.count || 0,
          today: todayUsersRes.count || 0,
          thisWeek: weekUsersRes.count || 0,
          thisMonth: monthUsersRes.count || 0,
          banned: bannedUsersRes.count || 0,
          activeToday: activeUsersRes.count || 0,
        },
        posts: {
          total: totalPostsRes.count || 0,
          today: todayPostsRes.count || 0,
          thisWeek: weekPostsRes.count || 0,
          pinned: pinnedPostsRes.count || 0,
        },
        comments: {
          total: totalCommentsRes.count || 0,
          today: todayCommentsRes.count || 0,
        },
        activity: {
          totalAiGenerations,
          totalSimulatorRuns,
          totalDreamGenerations,
          totalFortuneGenerations,
          totalPageViews,
          totalSavedNumbers,
          savedNumbersCount: savedNumbersRes.count || 0,
          maxStreak,
        },
        recentUsers: recentUsersRes.data || [],
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Admin stats API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
