/**
 * 회차별 1등 배출 판매점 읽기 (서버 전용, 회차 페이지·RSS 서버 렌더용)
 *
 * 수집 경로: /api/cron/revalidate 4단계 → storeFetcher.fetchAndSaveWinningStores
 * (pyony.com 회차 페이지의 동행복권 공개 판매점 표 → Supabase winning_stores).
 * 조회 실패·환경변수 없음·응답 지연(STORE_QUERY_TIMEOUT_MS 초과)은 null 로 돌려
 * 페이지는 판매점 칸만 '순차 반영'으로 보여 주고 나머지 본문은 그대로 응답한다.
 */
import type { WinningStore } from '@/types/database';
import type { StoreLike } from './roundContent';

export type RoundStore = StoreLike;

/** 판매점 조회 기한: 넘기면 요청을 취소하고 판매점 없이 본문을 보낸다 */
export const STORE_QUERY_TIMEOUT_MS = 2000;

async function queryFirstPrizeStores(round: number, signal: AbortSignal): Promise<RoundStore[] | null> {
  try {
    const { getServiceSupabase } = await import('@/lib/supabase');
    const { data, error } = await getServiceSupabase()
      .from('winning_stores')
      .select('store_name, store_address, purchase_type, rank')
      .eq('round', round)
      .eq('rank', 1)
      .order('store_name', { ascending: true })
      .abortSignal(signal);
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

export async function getFirstPrizeStores(round: number): Promise<RoundStore[] | null> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  // 취소 신호를 따르지 않는 연결 지연까지 막도록 기한이 지나면 결과를 기다리지 않는다
  const deadline = new Promise<null>((resolve) => {
    timer = setTimeout(() => {
      controller.abort();
      resolve(null);
    }, STORE_QUERY_TIMEOUT_MS);
  });
  try {
    return await Promise.race([queryFirstPrizeStores(round, controller.signal), deadline]);
  } finally {
    clearTimeout(timer);
  }
}

export { countByPurchaseType } from './roundContent';
