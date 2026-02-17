/**
 * 결정론적 AI 예측번호 생성기
 *
 * 핵심: 같은 회차번호 → 항상 같은 예측번호 (DB 없이 동작)
 * 시드 기반 의사 난수로 통계 가중치 반영
 *
 * 중요: "추첨 전 예측"의 공정성
 * - 정적 데이터(aiPredictionHistory.ts): 배포 전에 확정되므로 공정
 * - 동적 생성: 현재 전체 통계를 사용하므로 해당 회차 데이터가 포함될 수 있음
 * - useFairMode 옵션: true이면 해당 회차 미만의 데이터만으로 통계를 재계산
 * - 단, 시드 기반이므로 통계 유무와 관계없이 결과는 결정론적
 */

import type { LottoResult, NumberStatistics } from '@/types/lotto';
import type { AIPrediction, AIMultiSetPrediction } from '@/data/aiPredictionHistory';
import { LOTTO_CONFIG } from './constants';
import { LottoStatisticsAnalyzer } from './statisticsAnalyzer';

/**
 * 시드 기반 의사 난수 생성기 (Mulberry32)
 * 같은 시드 → 항상 같은 수열
 */
function createSeededRandom(seed: number) {
  let state = seed | 0;
  return () => {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 특정 회차에 대한 결정론적 시드 생성
 */
function getRoundSeed(round: number): number {
  // 소수 곱으로 분산 극대화
  return round * 7919 + 104729;
}

/**
 * 해당 회차의 추첨일 계산 (로또는 매주 토요일)
 * 1회: 2002-12-07 (토요일) 기준
 */
function getDrawDate(round: number): string {
  const firstDraw = new Date(2002, 11, 7); // 2002-12-07
  const drawDate = new Date(firstDraw.getTime() + (round - 1) * 7 * 24 * 60 * 60 * 1000);
  return drawDate.toISOString().split('T')[0];
}

/**
 * 예측 생성일 계산 (추첨일 1일 전 = 금요일)
 */
function getPredictionDate(round: number): string {
  const firstDraw = new Date(2002, 11, 7);
  const drawDate = new Date(firstDraw.getTime() + (round - 1) * 7 * 24 * 60 * 60 * 1000);
  drawDate.setDate(drawDate.getDate() - 1); // 하루 전
  return drawDate.toISOString().split('T')[0];
}

/**
 * 통계 가중치 기반 결정론적 번호 선택
 */
function selectWeightedNumbers(
  random: () => number,
  statistics: NumberStatistics[],
  count: number
): number[] {
  const seed = Math.floor(random() * 100000);

  // 가중치 계산 (numberGenerator.ts 로직 재사용)
  const latestRound = Math.max(...statistics.map(s => s.lastAppeared));
  const weighted = statistics.map(stat => {
    const averageFrequency = Math.max(1, latestRound * 7 / 45);
    const frequencyWeight = (stat.frequency / averageFrequency) * 0.3;
    const roundsSinceLastAppear = latestRound - stat.lastAppeared;
    const recentnessWeight = Math.max(0, (50 - roundsSinceLastAppear) / 50) * 0.2;
    const hotColdWeight = (stat.hotColdScore + 100) / 200 * 0.3;
    const seedFactor = (Math.sin(seed * stat.number * 0.1) + 1) / 2 * 0.2;
    const weight = Math.max(0.1, 1.0 + frequencyWeight + recentnessWeight + hotColdWeight + seedFactor);

    return { number: stat.number, weight };
  });

  // 가중치 기반 선택 (결정론적)
  const selected: number[] = [];
  const available = [...weighted];

  while (selected.length < count && available.length > 0) {
    const totalWeight = available.reduce((sum, item) => sum + item.weight, 0);
    const target = random() * totalWeight;

    let cumulative = 0;
    for (let i = 0; i < available.length; i++) {
      cumulative += available[i].weight;
      if (target <= cumulative) {
        selected.push(available[i].number);
        available.splice(i, 1);
        break;
      }
    }
  }

  return selected.sort((a, b) => a - b);
}

/**
 * 통계 없을 때 기본 번호 생성 (결정론적)
 */
function selectRandomNumbers(random: () => number, count: number): number[] {
  const selected: number[] = [];

  while (selected.length < count) {
    const num = Math.floor(random() * LOTTO_CONFIG.MAX_NUMBER) + 1;
    if (!selected.includes(num)) {
      selected.push(num);
    }
  }

  return selected.sort((a, b) => a - b);
}

/**
 * 특정 회차의 AI 예측번호 생성
 * 같은 회차 + 같은 통계 → 항상 같은 결과
 *
 * @param round - 예측 대상 회차
 * @param statistics - 번호 통계 (없으면 시드 기반 랜덤 생성)
 * @param options.useFairMode - true이면 allData에서 round 미만의 데이터만 필터링하여 통계 재계산
 * @param options.allData - 전체 로또 데이터 (useFairMode 사용 시 필요)
 */
export function generatePredictionForRound(
  round: number,
  statistics?: NumberStatistics[],
  options?: { useFairMode?: boolean; allData?: LottoResult[] }
): AIPrediction {
  const seed = getRoundSeed(round);
  const random = createSeededRandom(seed);

  let effectiveStatistics = statistics;

  // 공정 모드: 해당 회차 이전 데이터만으로 통계 재계산
  if (options?.useFairMode && options?.allData) {
    const dataBeforeRound = options.allData.filter(d => d.round < round);
    if (dataBeforeRound.length > 0) {
      effectiveStatistics = LottoStatisticsAnalyzer.generateStatistics(dataBeforeRound);
    } else {
      effectiveStatistics = undefined;
    }
  }

  const predictedNumbers = effectiveStatistics && effectiveStatistics.length > 0
    ? selectWeightedNumbers(random, effectiveStatistics, LOTTO_CONFIG.NUMBERS_COUNT)
    : selectRandomNumbers(random, LOTTO_CONFIG.NUMBERS_COUNT);

  return {
    round,
    predictedNumbers,
    predictedAt: getPredictionDate(round),
  };
}

/**
 * 정적 데이터 이후~현재 회차까지 모든 예측 생성
 *
 * 참고: 동적 예측에서는 현재 전체 통계를 사용합니다.
 * 이는 해당 회차 결과가 이미 통계에 포함될 수 있음을 의미하지만,
 * 시드 기반 결정론적 생성이므로 결과의 일관성은 보장됩니다.
 * 진정한 "추첨 전 예측"이 필요한 경우 useFairMode 옵션을 사용하세요.
 *
 * @param options.useFairMode - true이면 각 회차 R의 예측에 R-1까지의 데이터 통계만 사용
 * @param options.allData - 전체 로또 데이터 (useFairMode 사용 시 필요)
 */
export function generateDynamicPredictions(
  latestStaticRound: number,
  currentRound: number,
  statistics?: NumberStatistics[],
  options?: { useFairMode?: boolean; allData?: LottoResult[] }
): AIPrediction[] {
  const predictions: AIPrediction[] = [];

  for (let round = latestStaticRound + 1; round <= currentRound + 1; round++) {
    predictions.push(generatePredictionForRound(round, statistics, options));
  }

  return predictions;
}

/**
 * 현재 최신 회차 번호 추정 (클라이언트/서버 공용)
 */
export function estimateCurrentRound(): number {
  const firstDraw = new Date(2002, 11, 7); // 2002-12-07 (1회)
  const now = new Date();
  const diffMs = now.getTime() - firstDraw.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  return diffWeeks + 1;
}

/**
 * 특정 회차에 대해 다중 세트(5세트) AI 예측번호 생성
 * 각 세트는 서로 다른 시드 변형을 사용하여 결정론적으로 생성
 *
 * 세트별 전략:
 * - Set 0: 기본 통계 가중치 (기존과 동일)
 * - Set 1: 최근 트렌드 강화 (recentness 가중치 UP)
 * - Set 2: 핫넘버 강화 (hotCold 가중치 UP)
 * - Set 3: 콜드넘버 역발상 (잘 안 나온 번호 가중치 UP)
 * - Set 4: 균형 번호 (가중치 평균화)
 */
export function generateMultiSetPrediction(
  round: number,
  statistics?: NumberStatistics[],
  options?: { useFairMode?: boolean; allData?: LottoResult[] }
): AIMultiSetPrediction {
  const baseSeed = getRoundSeed(round);
  const sets: { setIndex: number; predictedNumbers: number[] }[] = [];

  let effectiveStatistics = statistics;
  if (options?.useFairMode && options?.allData) {
    const dataBeforeRound = options.allData.filter(d => d.round < round);
    if (dataBeforeRound.length > 0) {
      effectiveStatistics = LottoStatisticsAnalyzer.generateStatistics(dataBeforeRound);
    } else {
      effectiveStatistics = undefined;
    }
  }

  for (let setIdx = 0; setIdx < 5; setIdx++) {
    // 각 세트마다 다른 시드 변형 (소수 곱 활용)
    const setSeed = baseSeed + setIdx * 31337;
    const random = createSeededRandom(setSeed);

    let numbers: number[];

    if (effectiveStatistics && effectiveStatistics.length > 0) {
      numbers = selectWeightedNumbersWithStrategy(random, effectiveStatistics, LOTTO_CONFIG.NUMBERS_COUNT, setIdx);
    } else {
      numbers = selectRandomNumbers(random, LOTTO_CONFIG.NUMBERS_COUNT);
    }

    sets.push({ setIndex: setIdx, predictedNumbers: numbers });
  }

  return {
    round,
    sets,
    predictedAt: getPredictionDate(round),
  };
}

/**
 * 전략별 가중치 번호 선택
 */
function selectWeightedNumbersWithStrategy(
  random: () => number,
  statistics: NumberStatistics[],
  count: number,
  strategy: number
): number[] {
  const seed = Math.floor(random() * 100000);

  const latestRound = Math.max(...statistics.map(s => s.lastAppeared));
  const weighted = statistics.map(stat => {
    const averageFrequency = Math.max(1, latestRound * 7 / 45);
    let frequencyW: number, recentnessW: number, hotColdW: number, seedW: number;

    switch (strategy) {
      case 1: // 최근 트렌드 강화
        frequencyW = 0.2;
        recentnessW = 0.4;
        hotColdW = 0.2;
        seedW = 0.2;
        break;
      case 2: // 핫넘버 강화
        frequencyW = 0.2;
        recentnessW = 0.1;
        hotColdW = 0.5;
        seedW = 0.2;
        break;
      case 3: // 콜드넘버 역발상
        frequencyW = 0.15;
        recentnessW = 0.15;
        hotColdW = -0.3;
        seedW = 0.2;
        break;
      case 4: // 균형
        frequencyW = 0.25;
        recentnessW = 0.25;
        hotColdW = 0.25;
        seedW = 0.25;
        break;
      default: // 기본 (Set 0)
        frequencyW = 0.3;
        recentnessW = 0.2;
        hotColdW = 0.3;
        seedW = 0.2;
        break;
    }

    const frequencyWeight = (stat.frequency / averageFrequency) * frequencyW;
    const roundsSinceLastAppear = latestRound - stat.lastAppeared;
    const recentnessWeight = Math.max(0, (50 - roundsSinceLastAppear) / 50) * recentnessW;
    const hotColdWeight = (stat.hotColdScore + 100) / 200 * hotColdW;
    const seedFactor = (Math.sin(seed * stat.number * 0.1) + 1) / 2 * seedW;
    const weight = Math.max(0.1, 1.0 + frequencyWeight + recentnessWeight + hotColdWeight + seedFactor);

    return { number: stat.number, weight };
  });

  const selected: number[] = [];
  const available = [...weighted];

  while (selected.length < count && available.length > 0) {
    const totalWeight = available.reduce((sum, item) => sum + item.weight, 0);
    const target = random() * totalWeight;
    let cumulative = 0;
    for (let i = 0; i < available.length; i++) {
      cumulative += available[i].weight;
      if (target <= cumulative) {
        selected.push(available[i].number);
        available.splice(i, 1);
        break;
      }
    }
  }

  return selected.sort((a, b) => a - b);
}

/**
 * 다중 세트 동적 예측 생성 (정적 데이터 이후 ~ 현재+1)
 */
export function generateDynamicMultiSetPredictions(
  latestStaticRound: number,
  currentRound: number,
  statistics?: NumberStatistics[],
  options?: { useFairMode?: boolean; allData?: LottoResult[] }
): AIMultiSetPrediction[] {
  const predictions: AIMultiSetPrediction[] = [];

  for (let round = latestStaticRound + 1; round <= currentRound + 1; round++) {
    predictions.push(generateMultiSetPrediction(round, statistics, options));
  }

  return predictions;
}

/**
 * 정적 데이터를 다중 세트 형식으로 변환
 * 기존 1세트 데이터를 Set 0으로 유지하고, 나머지 4세트를 시드 기반으로 추가 생성
 */
export function convertStaticToMultiSet(
  staticPredictions: AIPrediction[],
  statistics?: NumberStatistics[],
  options?: { useFairMode?: boolean; allData?: LottoResult[] }
): AIMultiSetPrediction[] {
  return staticPredictions.map(pred => {
    const multiSet = generateMultiSetPrediction(pred.round, statistics, options);
    // Set 0은 정적 데이터의 원래 번호로 교체 (일관성 유지)
    multiSet.sets[0].predictedNumbers = pred.predictedNumbers;
    multiSet.predictedAt = pred.predictedAt;
    return multiSet;
  });
}
