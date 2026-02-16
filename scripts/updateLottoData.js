// 로또 데이터 증분 업데이트 스크립트
// 기존 realLottoData.ts에서 마지막 회차를 읽고, 이후 회차만 추가 fetch
// smok95 GitHub Pages API 사용
// 새 회차 추가 시 aiPredictionHistory.ts도 자동으로 업데이트

const fs = require('fs').promises;
const path = require('path');

const API_BASE_URL = 'https://smok95.github.io/lotto/results';
const DATA_FILE = path.join(__dirname, '..', 'src', 'data', 'realLottoData.ts');
const AI_PREDICTION_FILE = path.join(__dirname, '..', 'src', 'data', 'aiPredictionHistory.ts');

// ===== Mulberry32 PRNG (aiPredictionGenerator.ts와 동일) =====
function createSeededRandom(seed) {
  let state = seed | 0;
  return () => {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getRoundSeed(round) {
  return round * 7919 + 104729;
}

function selectRandomNumbers(random, count) {
  const MAX_NUMBER = 45;
  const selected = [];
  while (selected.length < count) {
    const num = Math.floor(random() * MAX_NUMBER) + 1;
    if (!selected.includes(num)) {
      selected.push(num);
    }
  }
  return selected.sort((a, b) => a - b);
}

function getPredictionDate(round) {
  const firstDraw = new Date(2002, 11, 7); // 2002-12-07
  const drawDate = new Date(firstDraw.getTime() + (round - 1) * 7 * 24 * 60 * 60 * 1000);
  drawDate.setDate(drawDate.getDate() - 1); // 하루 전 (금요일)
  return drawDate.toISOString().split('T')[0];
}

/**
 * 시드 기반으로 예측번호 생성 (통계 없이, aiPredictionGenerator.ts의 selectRandomNumbers와 동일)
 * 참고: 정적 데이터에서는 통계 가중치 없이 시드만으로 생성
 * 동적 생성 시에는 API 서버에서 통계 가중치를 적용하므로 결과가 다를 수 있음
 * 하지만 정적 데이터는 "확정된 기록"이므로, 이 스크립트에서 생성한 값이 최종값
 */
function generatePredictionForRound(round) {
  const seed = getRoundSeed(round);
  const random = createSeededRandom(seed);
  const predictedNumbers = selectRandomNumbers(random, 6);
  const predictedAt = getPredictionDate(round);
  return { round, predictedNumbers, predictedAt };
}

// ===== AI 예측 기록 업데이트 =====

/**
 * aiPredictionHistory.ts에서 현재 LATEST_STATIC_PREDICTION_ROUND 값 추출
 */
async function getLatestStaticPredictionRound() {
  try {
    const content = await fs.readFile(AI_PREDICTION_FILE, 'utf8');
    const match = content.match(/LATEST_STATIC_PREDICTION_ROUND\s*=\s*(\d+)/);
    if (!match) return 0;
    return parseInt(match[1]);
  } catch {
    return 0;
  }
}

/**
 * aiPredictionHistory.ts에 새 회차 예측 추가
 * - LATEST_STATIC_PREDICTION_ROUND를 새 값으로 업데이트
 * - AI_PREDICTION_HISTORY 배열 맨 앞에 새 엔트리 추가
 */
async function updateAIPredictionHistory(newRounds) {
  if (newRounds.length === 0) return;

  let content = await fs.readFile(AI_PREDICTION_FILE, 'utf8');

  const currentLatest = await getLatestStaticPredictionRound();
  const newLatestRound = Math.max(...newRounds.map(r => r.round));

  if (newLatestRound <= currentLatest) {
    console.log(`AI 예측: 이미 최신 (${currentLatest}회). 스킵.`);
    return;
  }

  // 새로 추가할 회차만 필터링 (현재 정적 데이터 이후의 회차)
  const roundsToAdd = newRounds
    .filter(r => r.round > currentLatest)
    .sort((a, b) => b.round - a.round); // 내림차순 (최신이 위에)

  if (roundsToAdd.length === 0) {
    console.log('AI 예측: 추가할 새 회차 없음.');
    return;
  }

  console.log(`\nAI 예측 기록 업데이트 (${roundsToAdd.length}개 회차)...`);

  // 1. LATEST_STATIC_PREDICTION_ROUND 업데이트
  content = content.replace(
    /LATEST_STATIC_PREDICTION_ROUND\s*=\s*\d+/,
    `LATEST_STATIC_PREDICTION_ROUND = ${newLatestRound}`
  );

  // 2. 주석의 회차 범위 업데이트
  content = content.replace(
    /AI 추천 기록 \(정적 데이터 - \d+~\d+회\)/,
    `AI 추천 기록 (정적 데이터 - 1201~${newLatestRound}회)`
  );

  // 3. AI_PREDICTION_HISTORY 배열 앞에 새 엔트리 추가
  const newEntries = roundsToAdd.map(r => {
    const prediction = generatePredictionForRound(r.round);
    console.log(`  ${r.round}회차 예측: [${prediction.predictedNumbers.join(', ')}] (생성일: ${prediction.predictedAt})`);
    return `  { round: ${prediction.round}, predictedNumbers: [${prediction.predictedNumbers.join(', ')}], predictedAt: '${prediction.predictedAt}' },`;
  });

  // 배열 시작 부분 찾기: "AI_PREDICTION_HISTORY: AIPrediction[] = [" 다음 줄
  const arrayStartPattern = /AI_PREDICTION_HISTORY:\s*AIPrediction\[\]\s*=\s*\[\n/;
  const arrayStartMatch = content.match(arrayStartPattern);

  if (!arrayStartMatch) {
    console.error('AI 예측 배열을 찾을 수 없습니다.');
    return;
  }

  const insertPos = arrayStartMatch.index + arrayStartMatch[0].length;
  content = content.slice(0, insertPos) + newEntries.join('\n') + '\n' + content.slice(insertPos);

  await fs.writeFile(AI_PREDICTION_FILE, content, 'utf8');
  console.log(`AI 예측 기록 업데이트 완료 (LATEST_STATIC_PREDICTION_ROUND = ${newLatestRound})`);
}

// ===== 로또 데이터 업데이트 (기존 코드) =====

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
  console.log(`\n=== 로또 데이터 업데이트 완료 ===`);
  console.log(`총 ${updatedData.length}개 회차 (${newData.length}개 추가됨)`);
  console.log(`마지막 회차: ${updatedData[updatedData.length - 1].round}회`);

  // AI 예측 기록도 자동 업데이트
  try {
    await updateAIPredictionHistory(newData);
  } catch (err) {
    console.error('AI 예측 기록 업데이트 실패 (로또 데이터 업데이트는 정상):', err.message);
    // AI 예측 업데이트 실패는 치명적이지 않으므로 프로세스를 종료하지 않음
  }
}

main().catch(err => {
  console.error('업데이트 실패:', err.message);
  process.exit(1);
});
