import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { RegionStats as RegionStatsType } from '@/types/database';

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
 *   stats: 'region' - 지역별 통계만 반환
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

    // 지역별 통계 모드
    if (stats === 'region') {
      return await getRegionStats(round ? parseInt(round, 10) : undefined);
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
 * 지역별 당첨 통계
 */
async function getRegionStats(round?: number) {
  try {
    let query = supabase
      .from('winning_stores')
      .select('region, rank');

    if (round) {
      query = query.eq('round', round);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // 지역별로 집계
    const regionMap = new Map<string, RegionStatsType>();
    const rows = (data || []) as unknown as { region: string; rank: number }[];

    rows.forEach((store) => {
      const existing = regionMap.get(store.region) || {
        region: store.region,
        count: 0,
        firstPrizeCount: 0,
        secondPrizeCount: 0,
      };

      existing.count++;
      if (store.rank === 1) existing.firstPrizeCount++;
      if (store.rank === 2) existing.secondPrizeCount++;

      regionMap.set(store.region, existing);
    });

    const stats = Array.from(regionMap.values())
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      success: true,
      stats,
      totalStores: data?.length || 0,
    });
  } catch (error) {
    console.error('Region stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
