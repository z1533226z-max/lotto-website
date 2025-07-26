// 로또 데이터 수집 스크립트
// 동행복권 공식 API를 사용하여 1-1180회차 데이터 수집

const fs = require('fs').promises;
const path = require('path');

// API URL 패턴
const API_BASE_URL = 'https://www.dhlottery.co.kr/common.do';

// 로또 데이터 가져오기 함수
async function fetchLottoData(drawNumber) {
  const url = `${API_BASE_URL}?method=getLottoNumber&drwNo=${drawNumber}`;
  
  try {
    console.log(`${drawNumber}회차 데이터 수집 중...`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // API 응답 검증
    if (data.returnValue !== 'success') {
      throw new Error(`API 응답 오류: ${data.returnValue}`);
    }
    
    // LottoResult 형태로 변환
    const lottoResult = {
      round: data.drwNo,
      drawDate: data.drwNoDate,
      numbers: [data.drwtNo1, data.drwtNo2, data.drwtNo3, data.drwtNo4, data.drwtNo5, data.drwtNo6].sort((a, b) => a - b),
      bonusNumber: data.bnusNo,
      prizeMoney: {
        first: data.firstWinamnt,
        firstWinners: data.firstPrzwnerCo,
        second: data.scndWinamnt || 0,
        secondWinners: data.scndPrzwnerCo || 0
      }
    };
    
    return lottoResult;
    
  } catch (error) {
    console.error(`${drawNumber}회차 데이터 수집 실패:`, error.message);
    return null;
  }
}

// 여러 회차 데이터 수집 (배치 처리)
async function fetchMultipleLottoData(startRound, endRound, batchSize = 10) {
  const results = [];
  const total = endRound - startRound + 1;
  
  console.log(`${startRound}회차부터 ${endRound}회차까지 ${total}개 회차 데이터 수집 시작...`);
  
  for (let i = startRound; i <= endRound; i += batchSize) {
    const batchEnd = Math.min(i + batchSize - 1, endRound);
    const batchPromises = [];
    
    // 배치 단위로 병렬 처리
    for (let round = i; round <= batchEnd; round++) {
      batchPromises.push(fetchLottoData(round));
    }
    
    try {
      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter(result => result !== null);
      results.push(...validResults);
      
      console.log(`배치 ${i}-${batchEnd} 완료: ${validResults.length}/${batchResults.length} 성공`);
      
      // API 호출 제한 방지를 위한 지연
      if (batchEnd < endRound) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      console.error(`배치 ${i}-${batchEnd} 처리 중 오류:`, error);
    }
  }
  
  console.log(`총 ${results.length}개 회차 데이터 수집 완료`);
  return results;
}

// TypeScript 파일로 저장
async function saveLottoDataToFile(lottoData, filename = 'realLottoData.ts') {
  const outputDir = path.join(__dirname, '..', 'src', 'data');
  const outputPath = path.join(outputDir, filename);
  
  try {
    // 디렉토리 확인 및 생성
    await fs.mkdir(outputDir, { recursive: true });
    
    const fileContent = `// 실제 로또 데이터 (동행복권 공식 API에서 수집)
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
    console.log(`로또 데이터 파일 저장 완료: ${outputPath}`);
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
    
    // 1-100회차 데이터 수집 (초기 구현)
    const startRound = 1;
    const endRound = 100;
    
    const lottoData = await fetchMultipleLottoData(startRound, endRound, 5);
    
    if (lottoData.length === 0) {
      throw new Error('수집된 데이터가 없습니다');
    }
    
    // 데이터 검증
    console.log('\n=== 데이터 검증 ===');
    console.log(`수집된 회차: ${lottoData.length}개`);
    console.log(`첫 번째 회차: ${lottoData[0]?.round}회 (${lottoData[0]?.drawDate})`);
    console.log(`마지막 회차: ${lottoData[lottoData.length - 1]?.round}회`);
    
    // 샘플 데이터 표시
    console.log('\n=== 샘플 데이터 ===');
    console.log(JSON.stringify(lottoData[0], null, 2));
    
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

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = {
  fetchLottoData,
  fetchMultipleLottoData,
  saveLottoDataToFile
};
