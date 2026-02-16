import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getAuthFromRequest } from '@/lib/auth';
import { validateLottoNumbers } from '@/lib/lottoUtils';
import type { NumberSource } from '@/types/database';

export const dynamic = 'force-dynamic';

const VALID_SOURCES: NumberSource[] = ['ai', 'dream', 'fortune'];
const MAX_SETS_PER_REQUEST = 5;
const MAX_SAVED_PER_USER = 500; // 사용자당 최대 저장 개수
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

/**
 * GET: 저장된 번호 목록 조회 (페이지네이션)
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

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT)
    );
    const sourceFilter = searchParams.get('source') as NumberSource | null;

    // source 필터 유효성 검사
    if (sourceFilter && !VALID_SOURCES.includes(sourceFilter)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 source 값입니다. (ai, dream, fortune)' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // 쿼리 빌더
    let query = (supabase.from('saved_numbers') as any)
      .select('*', { count: 'exact' })
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (sourceFilter) {
      query = query.eq('source', sourceFilter);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Saved numbers fetch error:', error);
      return NextResponse.json(
        { success: false, error: '저장된 번호를 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      numbers: data || [],
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error('Numbers GET API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST: 번호 세트 저장 (1~5세트)
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

    const body = await request.json();
    const { numbers, source, roundTarget } = body;

    // source 유효성 검사
    if (!source || !VALID_SOURCES.includes(source as NumberSource)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 source 값입니다. (ai, dream, fortune)' },
        { status: 400 }
      );
    }

    // roundTarget 유효성 검사
    if (!roundTarget || !Number.isInteger(roundTarget) || roundTarget < 1) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 대상 회차입니다.' },
        { status: 400 }
      );
    }

    // numbers 배열 검사
    if (!Array.isArray(numbers) || numbers.length === 0 || numbers.length > MAX_SETS_PER_REQUEST) {
      return NextResponse.json(
        { success: false, error: `번호 세트는 1~${MAX_SETS_PER_REQUEST}개까지 저장할 수 있습니다.` },
        { status: 400 }
      );
    }

    // 각 번호 세트 유효성 검사
    for (let i = 0; i < numbers.length; i++) {
      if (!validateLottoNumbers(numbers[i])) {
        return NextResponse.json(
          { success: false, error: `${i + 1}번째 번호 세트가 유효하지 않습니다. (1~45 사이 중복 없는 6개 숫자)` },
          { status: 400 }
        );
      }
    }

    const supabase = getServiceSupabase();

    // 저장할 레코드 생성
    const insertRows = numbers.map((numSet: number[]) => ({
      user_id: auth.userId,
      numbers: numSet,
      source: source as NumberSource,
      round_target: roundTarget,
    }));

    const { error: insertError } = await (supabase
      .from('saved_numbers') as any)
      .insert(insertRows);

    if (insertError) {
      console.error('Saved numbers insert error:', insertError);
      return NextResponse.json(
        { success: false, error: '번호 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 총 저장 개수 확인 후 초과분 삭제 (FIFO)
    const { count: totalCount } = await (supabase
      .from('saved_numbers') as any)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', auth.userId);

    if (totalCount && totalCount > MAX_SAVED_PER_USER) {
      const excessCount = totalCount - MAX_SAVED_PER_USER;
      // 가장 오래된 번호 ID 조회
      const { data: oldestRows } = await (supabase
        .from('saved_numbers') as any)
        .select('id')
        .eq('user_id', auth.userId)
        .order('created_at', { ascending: true })
        .limit(excessCount);

      if (oldestRows && oldestRows.length > 0) {
        const idsToDelete = oldestRows.map((r: any) => r.id);
        await (supabase
          .from('saved_numbers') as any)
          .delete()
          .in('id', idsToDelete);
      }
    }

    // user_progress 업데이트: saved_numbers_count 증가
    const { data: progress } = await (supabase
      .from('user_progress') as any)
      .select('saved_numbers_count, multi_set_generations')
      .eq('user_id', auth.userId)
      .single();

    const currentSavedCount = progress?.saved_numbers_count || 0;
    const currentMultiSetGen = progress?.multi_set_generations || 0;

    const updateData: Record<string, number | string> = {
      saved_numbers_count: currentSavedCount + numbers.length,
      updated_at: new Date().toISOString(),
    };

    // 5세트 동시 저장 시 multi_set_generations 증가
    if (numbers.length === MAX_SETS_PER_REQUEST) {
      updateData.multi_set_generations = currentMultiSetGen + 1;
    }

    await (supabase
      .from('user_progress') as any)
      .update(updateData)
      .eq('user_id', auth.userId);

    return NextResponse.json({
      success: true,
      saved: numbers.length,
    });
  } catch (error) {
    console.error('Numbers POST API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
