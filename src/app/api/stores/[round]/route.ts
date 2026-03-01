import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import type { WinningStore } from '@/types/database';

export const revalidate = 3600; // 1시간 캐시

/**
 * 회차별 당첨 판매점 API
 * GET /api/stores/[round]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { round: string } }
) {
  try {
    const round = parseInt(params.round, 10);

    if (isNaN(round) || round < 1) {
      return NextResponse.json(
        { success: false, error: 'Invalid round number' },
        { status: 400 }
      );
    }

    const { data, error } = await getServiceSupabase()
      .from('winning_stores')
      .select('*')
      .eq('round', round)
      .order('rank', { ascending: true })
      .order('store_name', { ascending: true });

    if (error) {
      console.error(`Store query error for round ${round}:`, error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const stores = (data || []) as unknown as WinningStore[];

    // 1등/2등 분리
    const firstPrize = stores.filter(s => s.rank === 1);
    const secondPrize = stores.filter(s => s.rank === 2);

    return NextResponse.json({
      success: true,
      round,
      stores,
      summary: {
        total: stores.length,
        firstPrize: firstPrize.length,
        secondPrize: secondPrize.length,
        autoCount: stores.filter(s => s.purchase_type === '자동').length,
        manualCount: stores.filter(s => s.purchase_type === '수동').length,
        semiAutoCount: stores.filter(s => s.purchase_type === '반자동').length,
      },
    });
  } catch (error) {
    console.error('Round stores API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
