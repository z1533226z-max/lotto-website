/**
 * 당첨 판매점 스크래핑 스크립트
 *
 * 동행복권 사이트에서 당첨 판매점 정보를 가져와 Supabase에 저장
 *
 * 사용법:
 *   node scripts/scrapeWinningStores.js           # 최신 회차만
 *   node scripts/scrapeWinningStores.js --round 1211   # 특정 회차
 *   node scripts/scrapeWinningStores.js --range 1200 1211  # 범위
 *   node scripts/scrapeWinningStores.js --all          # 전체 (시간 오래 걸림)
 *
 * 환경변수:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL 및 SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다.');
  console.log('   .env.local 파일에 설정하거나 환경변수로 전달해주세요.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// 동행복권 API URL
const DHLOTTO_API_URL = 'https://www.dhlottery.co.kr/store.do?method=topStore&gameNo=5&drwNo=';

/**
 * 지역 파싱 (주소에서 시/도, 구/군 추출)
 */
function parseRegion(address) {
  if (!address) return { region: '기타', subRegion: '' };

  const parts = address.trim().split(/\s+/);
  const region = parts[0] || '기타';
  const subRegion = parts[1] || '';

  // 시/도 정규화
  const regionMap = {
    '서울특별시': '서울',
    '서울시': '서울',
    '서울': '서울',
    '부산광역시': '부산',
    '부산시': '부산',
    '부산': '부산',
    '대구광역시': '대구',
    '대구시': '대구',
    '대구': '대구',
    '인천광역시': '인천',
    '인천시': '인천',
    '인천': '인천',
    '광주광역시': '광주',
    '광주시': '광주',
    '광주': '광주',
    '대전광역시': '대전',
    '대전시': '대전',
    '대전': '대전',
    '울산광역시': '울산',
    '울산시': '울산',
    '울산': '울산',
    '세종특별자치시': '세종',
    '세종시': '세종',
    '세종': '세종',
    '경기도': '경기',
    '경기': '경기',
    '강원도': '강원',
    '강원특별자치도': '강원',
    '강원': '강원',
    '충청북도': '충북',
    '충북': '충북',
    '충청남도': '충남',
    '충남': '충남',
    '전라북도': '전북',
    '전북특별자치도': '전북',
    '전북': '전북',
    '전라남도': '전남',
    '전남': '전남',
    '경상북도': '경북',
    '경북': '경북',
    '경상남도': '경남',
    '경남': '경남',
    '제주특별자치도': '제주',
    '제주도': '제주',
    '제주': '제주',
  };

  const normalizedRegion = regionMap[region] || region;

  return { region: normalizedRegion, subRegion };
}

/**
 * 동행복권에서 당첨 판매점 정보 가져오기
 */
async function fetchWinningStores(round) {
  try {
    // 1등 판매점
    const firstPrizeUrl = `https://www.dhlottery.co.kr/store.do?method=topStore&pageGubun=L645&drwNo=${round}&schKey=all&schVal=`;
    const firstResponse = await fetch(firstPrizeUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://www.dhlottery.co.kr/store.do?method=topStore',
      },
    });

    if (!firstResponse.ok) {
      console.warn(`  ⚠️ ${round}회 1등 판매점 조회 실패: HTTP ${firstResponse.status}`);
      return [];
    }

    const html = await firstResponse.text();
    const stores = parseStoreHTML(html, round);

    // API 부하 방지 딜레이
    await sleep(500);

    return stores;
  } catch (error) {
    console.error(`  ❌ ${round}회 판매점 스크래핑 오류:`, error.message);
    return [];
  }
}

/**
 * HTML에서 판매점 정보 파싱
 */
function parseStoreHTML(html, round) {
  const stores = [];

  // 테이블 행 패턴 매칭
  // 동행복권 사이트의 HTML 구조에서 판매점 정보 추출
  const rowRegex = /<tr[^>]*>[\s\S]*?<\/tr>/gi;
  const rows = html.match(rowRegex) || [];

  for (const row of rows) {
    // td 추출
    const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const tds = [];
    let match;
    while ((match = tdRegex.exec(row)) !== null) {
      // HTML 태그 제거
      const text = match[1].replace(/<[^>]*>/g, '').trim();
      tds.push(text);
    }

    // 최소 4개 컬럼이 있어야 유효한 데이터
    if (tds.length >= 4) {
      const rank = tds[0]?.includes('1') ? 1 : tds[0]?.includes('2') ? 2 : 0;
      if (rank === 0) continue;

      const storeName = tds[1] || '알 수 없음';
      const purchaseTypeText = tds[2] || '자동';
      const address = tds[3] || '';

      // 구매방식 정규화
      let purchaseType = '자동';
      if (purchaseTypeText.includes('수동')) {
        purchaseType = purchaseTypeText.includes('반') ? '반자동' : '수동';
      }

      const { region, subRegion } = parseRegion(address);

      stores.push({
        round,
        rank,
        store_name: storeName,
        store_address: address,
        region,
        sub_region: subRegion,
        purchase_type: purchaseType,
      });
    }
  }

  return stores;
}

/**
 * JSON API를 통한 대체 파싱 시도
 */
async function fetchWinningStoresJSON(round) {
  try {
    // 동행복권 JSON API 시도
    const url = `https://www.dhlottery.co.kr/store.do?method=topStoreData&pageGubun=L645&drwNo=${round}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://www.dhlottery.co.kr/',
      },
    });

    if (!response.ok) return [];

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('json')) return [];

    const data = await response.json();
    if (!Array.isArray(data)) return [];

    return data.map(item => {
      const { region, subRegion } = parseRegion(item.bplcAddr || item.address || '');
      return {
        round,
        rank: item.ranking || item.rank || 1,
        store_name: item.bplcNm || item.storeName || '알 수 없음',
        store_address: item.bplcAddr || item.address || '',
        region,
        sub_region: subRegion,
        purchase_type: item.buyType || item.purchaseType || '자동',
      };
    });
  } catch {
    return [];
  }
}

/**
 * Supabase에 판매점 데이터 저장
 */
async function saveStores(stores) {
  if (stores.length === 0) return 0;

  // upsert로 중복 방지
  const { data, error } = await supabase
    .from('winning_stores')
    .upsert(stores, {
      onConflict: 'round,rank,store_name,store_address',
      ignoreDuplicates: true,
    });

  if (error) {
    console.error('  ❌ DB 저장 오류:', error.message);
    return 0;
  }

  return stores.length;
}

/**
 * 현재 최신 회차 추정
 */
function estimateCurrentRound() {
  const firstDraw = new Date(2002, 11, 7);
  const now = new Date();
  const diffMs = now.getTime() - firstDraw.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  return diffWeeks + 1;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 메인 실행
 */
async function main() {
  const args = process.argv.slice(2);
  let rounds = [];

  if (args.includes('--all')) {
    const latest = estimateCurrentRound();
    rounds = Array.from({ length: latest }, (_, i) => i + 1);
    console.log(`📋 전체 회차 스크래핑: 1 ~ ${latest}회`);
  } else if (args.includes('--range')) {
    const startIdx = args.indexOf('--range');
    const start = parseInt(args[startIdx + 1], 10);
    const end = parseInt(args[startIdx + 2], 10);
    if (isNaN(start) || isNaN(end)) {
      console.error('❌ --range 뒤에 시작회차와 끝회차를 입력해주세요.');
      process.exit(1);
    }
    rounds = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    console.log(`📋 범위 스크래핑: ${start} ~ ${end}회`);
  } else if (args.includes('--round')) {
    const roundIdx = args.indexOf('--round');
    const round = parseInt(args[roundIdx + 1], 10);
    if (isNaN(round)) {
      console.error('❌ --round 뒤에 회차를 입력해주세요.');
      process.exit(1);
    }
    rounds = [round];
    console.log(`📋 단일 회차 스크래핑: ${round}회`);
  } else {
    // 기본: 최근 5회차
    const latest = estimateCurrentRound();
    rounds = Array.from({ length: 5 }, (_, i) => latest - 4 + i);
    console.log(`📋 최근 5회차 스크래핑: ${rounds[0]} ~ ${rounds[rounds.length - 1]}회`);
  }

  let totalSaved = 0;
  let successCount = 0;
  let failCount = 0;

  for (const round of rounds) {
    process.stdout.write(`  🔍 ${round}회 처리 중...`);

    // HTML 파싱 시도
    let stores = await fetchWinningStores(round);

    // HTML 실패 시 JSON API 시도
    if (stores.length === 0) {
      stores = await fetchWinningStoresJSON(round);
    }

    if (stores.length > 0) {
      const saved = await saveStores(stores);
      totalSaved += saved;
      successCount++;
      console.log(` ✅ ${stores.length}개 판매점 저장`);
    } else {
      failCount++;
      console.log(' ⏭️ 데이터 없음 (또는 파싱 실패)');
    }

    // API 부하 방지
    if (rounds.length > 1) {
      await sleep(1000);
    }
  }

  console.log('\n========================================');
  console.log(`📊 스크래핑 완료`);
  console.log(`   성공: ${successCount}회차`);
  console.log(`   실패: ${failCount}회차`);
  console.log(`   저장된 판매점: ${totalSaved}개`);
  console.log('========================================');
}

main().catch(error => {
  console.error('❌ 스크립트 오류:', error);
  process.exit(1);
});
