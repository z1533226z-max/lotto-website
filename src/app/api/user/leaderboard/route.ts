import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET: 리더보드 조회 (인증 불필요)
 * user_progress JOIN user_profiles로 닉네임 + 최장 연속 출석 랭킹
 */
export async function GET() {
  try {
    const supabase = getServiceSupabase();

    // user_progress와 user_profiles 조인하여 상위 20명 조회
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select(`
        user_id,
        longest_streak,
        unlocked_badges
      `)
      .order('longest_streak', { ascending: false })
      .limit(20);

    if (progressError) {
      console.error('Leaderboard progress query error:', progressError);
      return NextResponse.json(
        { success: false, error: '리더보드 데이터를 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    if (!progressData || progressData.length === 0) {
      // 전체 사용자 수도 조회
      const { count: totalUsers } = await supabase
        .from('user_progress')
        .select('*', { count: 'exact', head: true });

      return NextResponse.json({
        success: true,
        leaderboard: [],
        totalUsers: totalUsers || 0,
      });
    }

    // user_id 목록으로 프로필(닉네임) 조회
    const userIds = progressData.map((p) => p.user_id);
    const { data: profilesData, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, nickname')
      .in('id', userIds);

    if (profilesError) {
      console.error('Leaderboard profiles query error:', profilesError);
      return NextResponse.json(
        { success: false, error: '프로필 데이터를 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    // 닉네임 매핑
    const nicknameMap: Record<string, string> = {};
    if (profilesData) {
      profilesData.forEach((profile) => {
        nicknameMap[profile.id] = profile.nickname;
      });
    }

    // 리더보드 구성
    const leaderboard = progressData.map((entry, index) => ({
      nickname: nicknameMap[entry.user_id] || '익명',
      longest_streak: entry.longest_streak || 0,
      badge_count: Array.isArray(entry.unlocked_badges)
        ? entry.unlocked_badges.length
        : 0,
      rank: index + 1,
    }));

    // 전체 사용자 수 조회
    const { count: totalUsers } = await supabase
      .from('user_progress')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      leaderboard,
      totalUsers: totalUsers || 0,
    });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
