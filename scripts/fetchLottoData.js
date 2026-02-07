// 로또 데이터 수집 스크립트
// smok95 GitHub Pages API를 사용하여 1-1209회차 데이터 수집
// (동행복권 API가 차단되어 대체 소스 사용)

const fs = require('fs').promises;
const path = require('path');

// smok95 GitHub Pages API
const API_BASE_URL = 'https://smok95.github.io/lotto/results';

// 로또 데이터 가져오기 함수
async function fetchLottoData(drawNumber) {
  const url = `${API_BASE_URL}/${drawNumber}.json`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.draw_no || !data.numbers || !data.bonus_no) {
      throw new Error('Invalid data format');
    }

    // 날짜 형식 변환 (ISO -> YYYY-MM-DD)
    const dateStr = data.date ? data.date.split('T')[0] : '';

    // LottoResult 형태로 변환
    const lottoResult = {
      round: data.draw_no,
      drawDate: dateStr,
      numbers: [...data.numbers].sort((a, b) => a - b),
      bonusNumber: data.bonus_no,
      prizeMoney: {
        first: data.divisions && data.divisions[0] ? data.divisions[0].prize || 0 : 0,
        firstWinners: data.divisions && data.divisions[0] ? data.divisions[0].winners || 0 : 0,
        second: data.divisions && data.divisions[1] ? data.divisions[1].prize || 0 : 0,
        secondWinners: data.divisions && data.divisions[1] ? data.divisions[1].winners || 0 : 0
      }
    };

    return lottoResult;

  } catch (error) {
    console.error(`${drawNumber}회차 실패: ${error.message}`);
    return null;
  }
}

// 여러 회차 데이터 수집 (배치 처리)
async function fetchMultipleLottoData(startRound, endRound, batchSize = 20) {
  const results = [];
  const total = endRound - startRound + 1;
  let successCount = 0;
  let failCount = 0;

  console.log(`${startRound}회차~${endRound}회차 (${total}개) 데이터 수집 시작...`);
  console.log(`데이터 소스: ${API_BASE_URL}`);

  for (let i = startRound; i <= endRound; i += batchSize) {
    const batchEnd = Math.min(i + batchSize - 1, endRound);
    const batchPromises = [];

    for (let round = i; round <= batchEnd; round++) {
      batchPromises.push(fetchLottoData(round));
    }

    try {
      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter(result => result !== null);
      results.push(...validResults);
      successCount += validResults.length;
      failCount += batchResults.length - validResults.length;

      const progress = Math.round(((batchEnd - startRound + 1) / total) * 100);
      process.stdout.write(`\r[${progress}%] ${successCount}/${batchEnd - startRound + 1} 성공`);

      // API 호출 제한 방지
      if (batchEnd < endRound) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }

    } catch (error) {
      console.error(`\n배치 ${i}-${batchEnd} 오류:`, error.message);
    }
  }

  console.log(`\n총 ${successCount}개 성공, ${failCount}개 실패`);
  return results.sort((a, b) => a.round - b.round);
}

// TypeScript 파일로 저장
async function saveLottoDataToFile(lottoData, filename = 'realLottoData.ts') {
  const outputDir = path.join(__dirname, '..', 'src', 'data');
  const outputPath = path.join(outputDir, filename);

  try {
    await fs.mkdir(outputDir, { recursive: true });

    const fileContent = `// 실제 로또 데이터 (smok95/lotto GitHub에서 수집)
// 자동 생성된 파일 - 수동 편집 금지
// 생성 일시: ${new Date().toISOString()}

import type { LottoResult } from '@/types/lotto';

export const REAL_LOTTO_DATA: LottoResult[] = ${JSON.stringify(lottoData, null, 2)};

export const getLottoDataByRange = (startRound: number, endRound: number): LottoResult[] => {
  return REAL_LOTTO_DATA.filter(
    data => data.round >= startRound && data.round <= endRound
  );
};

export const getLatestLottoData = (): LottoResult | null => {
  return REAL_LOTTO_DATA.length > 0
    ? REAL_LOTTO_DATA[REAL_LOTTO_DATA.length - 1]
    : null;
};

// 통계 분석용 빠른 조회
export const getLottoDataCount = (): number => {
  return REAL_LOTTO_DATA.length;
};

export default REAL_LOTTO_DATA;
`;

    await fs.writeFile(outputPath, fileContent, 'utf8');
    console.log(`파일 저장 완료: ${outputPath}`);
    console.log(`총 ${lottoData.length}개 회차 데이터 저장됨`);

    return outputPath;

  } catch (error) {
    console.error('파일 저장 실패:', error);
    throw error;
  }
}

// 메인 실행 함수
async function main() {
  try {
    console.log('=== 로또 데이터 수집 시작 ===');
    console.time('총 수집 시간');

    const startRound = 1;
    const endRound = 1209;

    const lottoData = await fetchMultipleLottoData(startRound, endRound, 20);

    if (lottoData.length === 0) {
      throw new Error('수집된 데이터가 없습니다');
    }

    console.log('\n=== 데이터 검증 ===');
    console.log(`수집된 회차: ${lottoData.length}개`);
    console.log(`첫 번째: ${lottoData[0]?.round}회 (${lottoData[0]?.drawDate})`);
    console.log(`마지막: ${lottoData[lottoData.length - 1]?.round}회 (${lottoData[lottoData.length - 1]?.drawDate})`);

    // 파일 저장
    const savedPath = await saveLottoDataToFile(lottoData);

    console.timeEnd('총 수집 시간');
    console.log(`\n=== 수집 완료 ===`);
    console.log(`저장 위치: ${savedPath}`);

  } catch (error) {
    console.error('\n=== 수집 실패 ===');
    console.error('에러:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  fetchLottoData,
  fetchMultipleLottoData,
  saveLottoDataToFile
};
