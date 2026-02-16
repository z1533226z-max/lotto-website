/**
 * 1등 당첨 판매점 데이터 수집 스크립트
 *
 * pyony.com에서 서버사이드 fetch로 1등 판매점 데이터를 가져와 Supabase에 저장
 *
 * 사용법:
 *   node scripts/scrapeWinningStores.js           # 최근 5회차
 *   node scripts/scrapeWinningStores.js --round 1211   # 특정 회차
 *   node scripts/scrapeWinningStores.js --range 1200 1211  # 범위
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

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'ko-KR,ko;q=0.9',
};

/**
 * 지역 파싱 (주소에서 시/도, 구/군 추출)
 */
function parseRegion(address) {
  if (!address) return { region: '기타', subRegion: '' };

  const parts = address.trim().split(/\s+/);
  const region = parts[0] || '기타';
  const subRegion = parts[1] || '';

  const regionMap = {
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

  return { region: regionMap[region] || region, subRegion };
}

/**
 * 구매방식 정규화
 */
function normalizePurchaseType(text) {
  if (!text) return '자동';
  if (text.includes('반자동')) return '반자동';
  if (text.includes('수동')) return '수동';
  return '자동';
}

/**
 * pyony.com에서 1등 판매점 데이터 가져오기
 */
async function fetchFirstPrizeStores(round) {
  try {
    const url = `https://pyony.com/lotto/rounds/${round}/`;
    const response = await fetch(url, { headers: FETCH_HEADERS });

    if (!response.ok) return [];

    const html = await response.text();

    const tables = html.match(/<table[\s\S]*?<\/table>/gi) || [];
    const storeTable = tables.find(t => t.includes('상호명') && t.includes('소재지'));
    if (!storeTable) return [];

    const rows = storeTable.match(/<tr[\s\S]*?<\/tr>/gi) || [];
    const stores = [];

    for (let i = 1; i < rows.length; i++) {
      const cells = (rows[i].match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [])
        .map(c => c.replace(/<[^>]*>/g, '').trim());

      if (cells.length >= 4) {
        const { region, subRegion } = parseRegion(cells[3]);

        stores.push({
          round,
          rank: 1,
          store_name: cells[1],
          store_address: cells[3],
          region,
          sub_region: subRegion,
          purchase_type: normalizePurchaseType(cells[2]),
        });
      }
    }

    return stores;
  } catch (error) {
    console.error(`  pyony.com 오류(${round}회):`, error.message);
    return [];
  }
}

/**
 * Supabase에 판매점 데이터 저장
 */
async function saveStores(stores) {
  if (stores.length === 0) return 0;

  const { error } = await supabase
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

async function main() {
  const args = process.argv.slice(2);
  let rounds = [];

  if (args.includes('--range')) {
    const startIdx = args.indexOf('--range');
    const start = parseInt(args[startIdx + 1], 10);
    const end = parseInt(args[startIdx + 2], 10);
    if (isNaN(start) || isNaN(end)) {
      console.error('❌ --range 뒤에 시작회차와 끝회차를 입력해주세요.');
      process.exit(1);
    }
    rounds = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    console.log(`📋 범위 수집: ${start} ~ ${end}회`);
  } else if (args.includes('--round')) {
    const roundIdx = args.indexOf('--round');
    const round = parseInt(args[roundIdx + 1], 10);
    if (isNaN(round)) {
      console.error('❌ --round 뒤에 회차를 입력해주세요.');
      process.exit(1);
    }
    rounds = [round];
    console.log(`📋 단일 회차 수집: ${round}회`);
  } else {
    const latest = estimateCurrentRound();
    rounds = Array.from({ length: 5 }, (_, i) => latest - 4 + i);
    console.log(`📋 최근 5회차 수집: ${rounds[0]} ~ ${rounds[rounds.length - 1]}회`);
  }

  let totalSaved = 0;
  let successCount = 0;
  let failCount = 0;

  for (const round of rounds) {
    process.stdout.write(`  🔍 ${round}회 처리 중...`);

    const stores = await fetchFirstPrizeStores(round);

    if (stores.length > 0) {
      const saved = await saveStores(stores);
      totalSaved += saved;
      successCount++;
      console.log(` ✅ 1등 판매점 ${stores.length}개`);
    } else {
      failCount++;
      console.log(' ⏭️ 데이터 없음');
    }

    if (rounds.length > 1) {
      await sleep(500);
    }
  }

  console.log('\n========================================');
  console.log(`📊 수집 완료`);
  console.log(`   성공: ${successCount}회차`);
  console.log(`   실패: ${failCount}회차`);
  console.log(`   저장된 1등 판매점: ${totalSaved}개`);
  console.log('========================================');
}

module.exports = { fetchFirstPrizeStores, parseRegion };

if (require.main === module) {
  main().catch(error => {
    console.error('❌ 스크립트 오류:', error);
    process.exit(1);
  });
}
