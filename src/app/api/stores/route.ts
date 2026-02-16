import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * 당첨 판매점 목록 API
 *
 * Query params:
 *   round: 회차 번호
 *   rank: 1 또는 2 (등수)
 *   region: 지역 (시/도)
 *   page: 페이지 번호 (기본 1)
 *   limit: 페이지당 항목 수 (기본 20)
 *   stats: 'region' - 지역별 통계
 *   ranking: 'true' - 판매점 당첨 랭킹
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const round = searchParams.get('round');
    const rank = searchParams.get('rank');
    const region = searchParams.get('region');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const stats = searchParams.get('stats');
    const ranking = searchParams.get('ranking');

    // 지역별 통계 모드 (RPC 함수 사용)
    if (stats === 'region') {
      return await getRegionStats();
    }

    // 판매점 당첨 랭킹 모드 (RPC 함수 사용)
    if (ranking === 'true') {
      return await getStoreRanking(page, limit, region);
    }

    // 기본 쿼리
    let query = supabase
      .from('winning_stores')
      .select('*', { count: 'exact' })
      .order('round', { ascending: false })
      .order('rank', { ascending: true });

    // 필터 적용
    if (round) {
      query = query.eq('round', parseInt(round, 10));
    }
    if (rank) {
      query = query.eq('rank', parseInt(rank, 10));
    }
    if (region) {
      query = query.eq('region', region);
    }

    // 페이지네이션
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Store query error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      stores: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Stores API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 지역별 당첨 통계 (RPC 함수)
 */
async function getRegionStats() {
  try {
    const { data, error } = await (supabase.rpc as Function)('get_region_stats');

    if (error) {
      console.error('Region stats RPC error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const rows = (data || []) as { region_name: string; total_count: number }[];
    const stats = rows.map((row) => ({
      region: row.region_name,
      count: row.total_count,
      firstPrizeCount: row.total_count,
      secondPrizeCount: 0,
    }));

    return NextResponse.json({
      success: true,
      stats,
      totalStores: stats.reduce((sum: number, s: { count: number }) => sum + s.count, 0),
    });
  } catch (error) {
    console.error('Region stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 판매점 당첨 랭킹 (RPC 함수)
 */
async function getStoreRanking(page: number, limit: number, region: string | null) {
  try {
    const offset = (page - 1) * limit;

    // 랭킹 데이터
    const { data, error } = await (supabase.rpc as Function)('get_store_ranking', {
      p_limit: limit,
      p_offset: offset,
      p_region: region || null,
    });

    if (error) {
      console.error('Store ranking RPC error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // 전체 개수
    const { data: countData, error: countError } = await (supabase.rpc as Function)('get_store_ranking_count', {
      p_region: region || null,
    });

    if (countError) {
      console.error('Store ranking count error:', countError);
    }

    const total = countData || 0;

    return NextResponse.json({
      success: true,
      ranking: data || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Store ranking error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
