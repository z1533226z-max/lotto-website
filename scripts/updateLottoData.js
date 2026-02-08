// 로또 데이터 증분 업데이트 스크립트
// 기존 realLottoData.ts에서 마지막 회차를 읽고, 이후 회차만 추가 fetch
// smok95 GitHub Pages API 사용

const fs = require('fs').promises;
const path = require('path');

const API_BASE_URL = 'https://smok95.github.io/lotto/results';
const DATA_FILE = path.join(__dirname, '..', 'src', 'data', 'realLottoData.ts');

// 현재 데이터에서 마지막 회차 번호 추출
async function getLastRoundFromFile() {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf8');
    // "round": 1209 같은 패턴에서 마지막 round 값 추출
    const matches = content.match(/"round":\s*(\d+)/g);
    if (!matches || matches.length === 0) return 0;
    const lastMatch = matches[matches.length - 1];
    const round = parseInt(lastMatch.match(/(\d+)/)[1]);
    return round;
  } catch {
    return 0;
  }
}

// smok95 API에서 단일 회차 데이터 fetch
async function fetchRound(round) {
  const url = `${API_BASE_URL}/${round}.json`;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.draw_no || !data.numbers || !data.bonus_no) return null;

    return {
      round: data.draw_no,
      drawDate: data.date ? data.date.split('T')[0] : '',
      numbers: [...data.numbers].sort((a, b) => a - b),
      bonusNumber: data.bonus_no,
      prizeMoney: {
        first: data.divisions?.[0]?.prize || 0,
        firstWinners: data.divisions?.[0]?.winners || 0,
        second: data.divisions?.[1]?.prize || 0,
        secondWinners: data.divisions?.[1]?.winners || 0,
      },
    };
  } catch {
    return null;
  }
}

// 최신 회차 자동 감지 (프로빙)
async function detectLatestRound(startFrom) {
  let latest = startFrom;
  for (let probe = startFrom + 1; probe <= startFrom + 20; probe++) {
    const result = await fetchRound(probe);
    if (result) {
      latest = probe;
    } else {
      break;
    }
  }
  return latest;
}

// 기존 데이터 파일에서 배열 부분 파싱
async function parseExistingData() {
  const content = await fs.readFile(DATA_FILE, 'utf8');
  // "= [" 패턴으로 실제 데이터 배열 시작 위치 찾기
  // (LottoResult[] 의 []와 구분하기 위해)
  const assignMarker = '= [';
  const assignIdx = content.indexOf(assignMarker);
  if (assignIdx === -1) throw new Error('데이터 배열 할당을 찾을 수 없습니다');

  const arrayStart = assignIdx + 2; // '= ' 건너뛰고 '[' 위치

  // 매칭되는 '];' 찾기 (중첩 대괄호 고려)
  let depth = 0;
  let arrayEnd = -1;
  for (let i = arrayStart; i < content.length; i++) {
    if (content[i] === '[') depth++;
    if (content[i] === ']') {
      depth--;
      if (depth === 0) {
        arrayEnd = i + 1;
        break;
      }
    }
  }
  if (arrayEnd === -1) throw new Error('배열 끝을 찾을 수 없습니다');

  const arrayStr = content.substring(arrayStart, arrayEnd);
  return JSON.parse(arrayStr);
}

// 데이터 파일 재작성
async function writeDataFile(lottoData) {
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

  await fs.writeFile(DATA_FILE, fileContent, 'utf8');
}

async function main() {
  console.log('=== 로또 데이터 증분 업데이트 ===');

  const lastRound = await getLastRoundFromFile();
  console.log(`현재 데이터 마지막 회차: ${lastRound}회`);

  if (lastRound === 0) {
    console.error('기존 데이터를 읽을 수 없습니다. fetchLottoData.js를 먼저 실행하세요.');
    process.exit(1);
  }

  const latestAvailable = await detectLatestRound(lastRound);
  console.log(`smok95 API 최신 회차: ${latestAvailable}회`);

  if (latestAvailable <= lastRound) {
    console.log('이미 최신 데이터입니다. 업데이트 불필요.');
    return;
  }

  const newRounds = latestAvailable - lastRound;
  console.log(`${newRounds}개 새 회차 발견 (${lastRound + 1}~${latestAvailable}회)`);

  // 새 회차 데이터 fetch
  const newData = [];
  for (let round = lastRound + 1; round <= latestAvailable; round++) {
    const result = await fetchRound(round);
    if (result) {
      newData.push(result);
      console.log(`  ${round}회차: ${result.numbers.join(', ')} + ${result.bonusNumber} (${result.drawDate})`);
    } else {
      console.warn(`  ${round}회차: fetch 실패`);
    }
  }

  if (newData.length === 0) {
    console.log('새로 가져온 데이터가 없습니다.');
    return;
  }

  // 기존 데이터에 추가
  console.log('\n기존 데이터 파싱 중...');
  const existingData = await parseExistingData();
  console.log(`기존 데이터: ${existingData.length}개 회차`);

  if (existingData.length < 100) {
    throw new Error(`기존 데이터가 너무 적습니다 (${existingData.length}개). 파싱 오류 가능성.`);
  }

  const updatedData = [...existingData, ...newData];

  console.log(`병합 후 데이터: ${updatedData.length}개 회차`);
  await writeDataFile(updatedData);
  console.log(`\n=== 업데이트 완료 ===`);
  console.log(`총 ${updatedData.length}개 회차 (${newData.length}개 추가됨)`);
  console.log(`마지막 회차: ${updatedData[updatedData.length - 1].round}회`);
}

main().catch(err => {
  console.error('업데이트 실패:', err.message);
  process.exit(1);
});
