/**
 * 회차별 1등 배출 판매점 읽기 (서버 전용, 회차 페이지 서버 렌더용)
 *
 * 수집 경로: /api/cron/revalidate 4단계 → storeFetcher.fetchAndSaveWinningStores
 * (pyony.com 회차 페이지의 동행복권 공개 판매점 표 → Supabase winning_stores).
 * 조회 실패·환경변수 없음은 null 로 돌려 페이지는 판매점 칸만 '반영 전'으로 보여 준다.
 */
import type { PurchaseType, WinningStore } from '@/types/database';

export interface RoundStore {
  name: string;
  address: string;
  purchaseType: PurchaseType;
}

export async function getFirstPrizeStores(round: number): Promise<RoundStore[] | null> {
  try {
    const { getServiceSupabase } = await import('@/lib/supabase');
    const { data, error } = await getServiceSupabase()
      .from('winning_stores')
      .select('store_name, store_address, purchase_type, rank')
      .eq('round', round)
      .eq('rank', 1)
      .order('store_name', { ascending: true });
    if (error) return null;
    return ((data || []) as Pick<WinningStore, 'store_name' | 'store_address' | 'purchase_type'>[]).map(s => ({
      name: s.store_name,
      address: s.store_address,
      purchaseType: s.purchase_type,
    }));
  } catch {
    return null;
  }
}

export function countByPurchaseType(stores: RoundStore[]): Record<PurchaseType, number> {
  const counts: Record<PurchaseType, number> = { 자동: 0, 수동: 0, 반자동: 0 };
  for (const s of stores) counts[s.purchaseType] = (counts[s.purchaseType] ?? 0) + 1;
  return counts;
}
