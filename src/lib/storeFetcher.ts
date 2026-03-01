/**
 * 1등 당첨 판매점 데이터 수집 모듈
 *
 * pyony.com에서 서버사이드 fetch로 1등 판매점 데이터를 수집
 * Vercel Cron에서 매주 토요일 자동 실행
 */

import { getServiceSupabase } from './supabase';
import type { WinningStoreInsert } from '@/types/database';

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'ko-KR,ko;q=0.9',
};

type StoreData = WinningStoreInsert;

const REGION_MAP: Record<string, string> = {
  '서울특별시': '서울', '서울시': '서울', '서울': '서울',
  '부산광역시': '부산', '부산시': '부산', '부산': '부산',
  '대구광역시': '대구', '대구시': '대구', '대구': '대구',
  '인천광역시': '인천', '인천시': '인천', '인천': '인천',
  '광주광역시': '광주', '광주시': '광주', '광주': '광주',
  '대전광역시': '대전', '대전시': '대전', '대전': '대전',
  '울산광역시': '울산', '울산시': '울산', '울산': '울산',
  '세종특별자치시': '세종', '세종시': '세종', '세종': '세종',
  '경기도': '경기', '경기': '경기',
  '강원도': '강원', '강원특별자치도': '강원', '강원': '강원',
  '충청북도': '충북', '충북': '충북',
  '충청남도': '충남', '충남': '충남',
  '전라북도': '전북', '전북특별자치도': '전북', '전북': '전북',
  '전라남도': '전남', '전남': '전남',
  '경상북도': '경북', '경북': '경북',
  '경상남도': '경남', '경남': '경남',
  '제주특별자치도': '제주', '제주도': '제주', '제주': '제주',
};

function parseRegion(address: string) {
  if (!address) return { region: '기타', subRegion: '' };
  const parts = address.trim().split(/\s+/);
  const region = parts[0] || '기타';
  const subRegion = parts[1] || '';
  return { region: REGION_MAP[region] || region, subRegion };
}

function normalizePurchaseType(text: string): '자동' | '수동' | '반자동' {
  if (!text) return '자동';
  if (text.includes('반자동')) return '반자동';
  if (text.includes('수동')) return '수동';
  return '자동';
}

/**
 * pyony.com에서 1등 판매점 데이터 수집
 */
async function fetchFromPyony(round: number): Promise<StoreData[]> {
  const response = await fetch(`https://pyony.com/lotto/rounds/${round}/`, {
    headers: FETCH_HEADERS,
  });

  if (!response.ok) return [];

  const html = await response.text();
  const tables = html.match(/<table[\s\S]*?<\/table>/gi) || [];
  const storeTable = tables.find(t => t.includes('상호명') && t.includes('소재지'));
  if (!storeTable) return [];

  const rows = storeTable.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  const stores: StoreData[] = [];

  for (let i = 1; i < rows.length; i++) {
    // td + th 모두 매칭 (번호는 th, 나머지는 td)
    const cells = (rows[i].match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi) || [])
      .map(c => c.replace(/<[^>]*>/g, '').trim());

    // 4열: 번호(th), 상호명(td), 구분(td), 소재지(td)
    if (cells.length >= 4) {
      const address = cells[3];
      const { region, subRegion } = parseRegion(address);

      stores.push({
        round,
        rank: 1,
        store_name: cells[1],
        store_address: address,
        region,
        sub_region: subRegion,
        purchase_type: normalizePurchaseType(cells[2]),
      });
    } else if (cells.length >= 3) {
      // 3열: 상호명(td), 구분(td), 소재지(td) - 번호 없는 경우
      const address = cells[2];
      const { region, subRegion } = parseRegion(address);

      stores.push({
        round,
        rank: 1,
        store_name: cells[0],
        store_address: address,
        region,
        sub_region: subRegion,
        purchase_type: normalizePurchaseType(cells[1]),
      });
    }
  }

  return stores;
}

/**
 * 특정 회차의 1등 판매점 데이터를 수집하여 Supabase에 저장
 */
export async function fetchAndSaveWinningStores(round: number): Promise<{
  success: boolean;
  count: number;
}> {
  try {
    const stores = await fetchFromPyony(round);

    if (stores.length === 0) {
      return { success: false, count: 0 };
    }

    const serviceSupabase = getServiceSupabase();
    const { error } = await serviceSupabase.from('winning_stores')
      .upsert(stores, {
        onConflict: 'round,rank,store_name,store_address',
        ignoreDuplicates: true,
      });

    if (error) {
      return { success: false, count: 0 };
    }

    return { success: true, count: stores.length };
  } catch {
    return { success: false, count: 0 };
  }
}
