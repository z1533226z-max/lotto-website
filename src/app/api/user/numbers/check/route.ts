import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getAuthFromRequest } from '@/lib/auth';
import { calculateRank } from '@/lib/lottoUtils';
import { getAllLottoData } from '@/lib/dataFetcher';
import type { SavedNumber } from '@/types/database';
import type { LottoResult } from '@/types/lotto';

export const dynamic = 'force-dynamic';

interface CheckResult {
  id: string;
  matched_count: number;
  bonus_matched: boolean;
  rank: number;
}

/**
 * POST: 미확인 저장 번호를 실제 추첨 결과와 대조
 */
export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const supabase = getServiceSupabase();

    // 미확인 번호 조회 (checked_at IS NULL)
    const { data: uncheckedNumbers, error: fetchError } = await supabase
      .from('saved_numbers')
      .select('*')
      .eq('user_id', auth.userId)
      .is('checked_at', null);

    if (fetchError) {
      console.error('Unchecked numbers fetch error:', fetchError);
      return NextResponse.json(
        { success: false, error: '미확인 번호를 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    if (!uncheckedNumbers || uncheckedNumbers.length === 0) {
      return NextResponse.json({
        success: true,
        checked: 0,
        results: [],
      });
    }

    // 실제 추첨 데이터 로드
    const allLottoData = await getAllLottoData();

    // 회차별 추첨 결과 맵 생성
    const drawResultMap = new Map<number, LottoResult>();
    for (const result of allLottoData) {
      drawResultMap.set(result.round, result);
    }

    const results: CheckResult[] = [];
    const now = new Date().toISOString();
    let pendingCount = 0;

    for (const saved of uncheckedNumbers as SavedNumber[]) {
      const drawResult = drawResultMap.get(saved.round_target);

      // 해당 회차 추첨 결과가 아직 없으면 건너뜀
      if (!drawResult) {
        pendingCount++;
        continue;
      }

      // 일치 개수 계산
      const winningSet = new Set(drawResult.numbers);
      const matchedCount = saved.numbers.filter((n) => winningSet.has(n)).length;

      // 보너스 번호 일치 여부
      const bonusMatched = saved.numbers.includes(drawResult.bonusNumber);

      // 등수 계산
      const rank = calculateRank(matchedCount, bonusMatched);

      // DB 업데이트
      const { error: updateError } = await supabase
        .from('saved_numbers')
        .update({
          matched_count: matchedCount,
          bonus_matched: bonusMatched,
          checked_at: now,
        })
        .eq('id', saved.id);

      if (updateError) {
        console.error(`Number check update error for id ${saved.id}:`, updateError);
        continue;
      }

      results.push({
        id: saved.id,
        matched_count: matchedCount,
        bonus_matched: bonusMatched,
        rank,
      });
    }

    // user_progress 업데이트: match_checks_count 증가
    if (results.length > 0) {
      const { data: progress } = await supabase
        .from('user_progress')
        .select('match_checks_count')
        .eq('user_id', auth.userId)
        .single();

      const currentCheckCount = progress?.match_checks_count || 0;

      await supabase
        .from('user_progress')
        .update({
          match_checks_count: currentCheckCount + results.length,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', auth.userId);
    }

    return NextResponse.json({
      success: true,
      checked: results.length,
      pending: pendingCount,
      results,
    });
  } catch (error) {
    console.error('Numbers check API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
