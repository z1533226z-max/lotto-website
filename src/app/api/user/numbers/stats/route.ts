import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getAuthFromRequest } from '@/lib/auth';
import type { SavedNumber, NumberStats } from '@/types/database';

export const dynamic = 'force-dynamic';

/**
 * GET: 저장된 번호 통계 조회
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

    // 사용자의 모든 저장 번호 조회
    const { data: allNumbers, error } = await supabase
      .from('saved_numbers')
      .select('source, matched_count, bonus_matched, checked_at')
      .eq('user_id', auth.userId);

    if (error) {
      console.error('Stats fetch error:', error);
      return NextResponse.json(
        { success: false, error: '통계를 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    const numbers = (allNumbers || []) as Pick<
      SavedNumber,
      'source' | 'matched_count' | 'bonus_matched' | 'checked_at'
    >[];

    // 기본 통계 계산
    const totalSaved = numbers.length;

    // source별 카운트
    const bySource = { ai: 0, dream: 0, fortune: 0 };
    for (const n of numbers) {
      if (n.source in bySource) {
        bySource[n.source as keyof typeof bySource]++;
      }
    }

    // 확인 완료된 번호만 필터
    const checkedNumbers = numbers.filter((n) => n.checked_at !== null);
    const totalChecked = checkedNumbers.length;

    // 최고 매치 수
    let bestMatch = 0;
    for (const n of checkedNumbers) {
      if (n.matched_count !== null && n.matched_count > bestMatch) {
        bestMatch = n.matched_count;
      }
    }

    // 매치 분포 (0~6)
    const matchDistribution: Record<number, number> = {
      0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0,
    };
    for (const n of checkedNumbers) {
      const count = n.matched_count ?? 0;
      if (count >= 0 && count <= 6) {
        matchDistribution[count]++;
      }
    }

    const stats: NumberStats = {
      totalSaved,
      bySource,
      bestMatch,
      totalChecked,
      matchDistribution,
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Numbers stats API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
