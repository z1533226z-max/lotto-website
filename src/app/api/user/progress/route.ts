import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getAuthFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET: 사용자 진행 데이터 조회
 */
export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const supabase = getServiceSupabase();
    const { data, error } = await (supabase
      .from('user_progress') as any)
      .select('*')
      .eq('user_id', auth.userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found (not an error for us)
      console.error('Progress fetch error:', error);
      return NextResponse.json(
        { success: false, error: '진행 데이터를 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      progress: data || null,
    });
  } catch (error) {
    console.error('Progress GET API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PUT: 사용자 진행 데이터 동기화 (localStorage -> 서버)
 * 머지 전략: 숫자는 Math.max, 배열은 유니크 병합, 날짜는 최신 값 사용
 */
export async function PUT(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      visitStreak,
      longestStreak,
      lastVisitDate,
      firstVisitDate,
      actions,
      unlockedBadges,
      dailyChallengeCompleted,
    } = body;

    const supabase = getServiceSupabase();

    // 기존 서버 데이터 조회
    const { data: existing } = await (supabase
      .from('user_progress') as any)
      .select('*')
      .eq('user_id', auth.userId)
      .single();

    // 머지: 숫자 필드는 Math.max
    const mergedVisitStreak = Math.max(
      existing?.visit_streak || 0,
      visitStreak || 0
    );
    const mergedLongestStreak = Math.max(
      existing?.longest_streak || 0,
      longestStreak || 0
    );

    // 머지: actions 숫자 필드는 Math.max (플랫 컬럼 기준)
    const mergedAiGenerations = Math.max(
      existing?.ai_generations || 0,
      actions?.aiGenerations || 0
    );
    const mergedSimulatorRuns = Math.max(
      existing?.simulator_runs || 0,
      actions?.simulatorRuns || 0
    );
    const mergedDreamGenerations = Math.max(
      existing?.dream_generations || 0,
      actions?.dreamGenerations || 0
    );
    const mergedFortuneGenerations = Math.max(
      existing?.fortune_generations || 0,
      actions?.fortuneGenerations || 0
    );
    const mergedPageViews = Math.max(
      existing?.page_views || 0,
      actions?.pageViews || 0
    );

    // 머지: 배열(뱃지)은 유니크 병합
    const existingBadges: string[] = existing?.unlocked_badges || [];
    const incomingBadges: string[] = unlockedBadges || [];
    const mergedBadges = Array.from(new Set([...existingBadges, ...incomingBadges]));

    // 머지: 날짜는 최신 값 사용 (lastVisitDate는 더 최근, firstVisitDate는 더 이전)
    const mergedLastVisitDate = getMoreRecentDate(
      existing?.last_visit_date,
      lastVisitDate
    );
    const mergedFirstVisitDate = getEarlierDate(
      existing?.first_visit_date,
      firstVisitDate
    );
    const mergedDailyChallenge = getMoreRecentDate(
      existing?.daily_challenge_completed,
      dailyChallengeCompleted
    );

    // 저장번호 수, 매칭 확인 수, 다중세트 수 머지
    const mergedSavedNumbersCount = Math.max(
      existing?.saved_numbers_count || 0,
      body.savedNumbersCount || 0
    );
    const mergedMatchChecksCount = Math.max(
      existing?.match_checks_count || 0,
      body.matchChecksCount || 0
    );
    const mergedMultiSetGenerations = Math.max(
      existing?.multi_set_generations || 0,
      body.multiSetGenerations || 0
    );

    // UPSERT (플랫 컬럼으로 저장)
    const upsertData = {
      user_id: auth.userId,
      visit_streak: mergedVisitStreak,
      longest_streak: mergedLongestStreak,
      last_visit_date: mergedLastVisitDate,
      first_visit_date: mergedFirstVisitDate,
      ai_generations: mergedAiGenerations,
      simulator_runs: mergedSimulatorRuns,
      dream_generations: mergedDreamGenerations,
      fortune_generations: mergedFortuneGenerations,
      page_views: mergedPageViews,
      unlocked_badges: mergedBadges,
      daily_challenge_completed: mergedDailyChallenge,
      saved_numbers_count: mergedSavedNumbersCount,
      match_checks_count: mergedMatchChecksCount,
      multi_set_generations: mergedMultiSetGenerations,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await (supabase
      .from('user_progress') as any)
      .upsert(upsertData, { onConflict: 'user_id' })
      .select('*')
      .single();

    if (error) {
      console.error('Progress upsert error:', error);
      return NextResponse.json(
        { success: false, error: '진행 데이터 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      progress: data,
    });
  } catch (error) {
    console.error('Progress PUT API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 두 날짜 중 더 최근 날짜 반환
 */
function getMoreRecentDate(
  dateA: string | null | undefined,
  dateB: string | null | undefined
): string | null {
  if (!dateA && !dateB) return null;
  if (!dateA) return dateB!;
  if (!dateB) return dateA;

  const a = new Date(dateA).getTime();
  const b = new Date(dateB).getTime();

  if (isNaN(a) && isNaN(b)) return null;
  if (isNaN(a)) return dateB;
  if (isNaN(b)) return dateA;

  return a >= b ? dateA : dateB;
}

/**
 * 두 날짜 중 더 이전 날짜 반환
 */
function getEarlierDate(
  dateA: string | null | undefined,
  dateB: string | null | undefined
): string | null {
  if (!dateA && !dateB) return null;
  if (!dateA) return dateB!;
  if (!dateB) return dateA;

  const a = new Date(dateA).getTime();
  const b = new Date(dateB).getTime();

  if (isNaN(a) && isNaN(b)) return null;
  if (isNaN(a)) return dateB;
  if (isNaN(b)) return dateA;

  return a <= b ? dateA : dateB;
}
