/**
 * 결정론적 AI 예측번호 생성기
 *
 * 핵심: 같은 회차번호 → 항상 같은 예측번호 (DB 없이 동작)
 * 시드 기반 의사 난수로 통계 가중치 반영
 */

import type { NumberStatistics } from '@/types/lotto';
import type { AIPrediction } from '@/data/aiPredictionHistory';
import { LOTTO_CONFIG } from './constants';

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
  const weighted = statistics.map(stat => {
    const averageFrequency = 25;
    const frequencyWeight = (stat.frequency / averageFrequency) * 0.3;
    const recentnessWeight = Math.max(0, (50 - stat.lastAppeared) / 50) * 0.2;
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
 */
export function generatePredictionForRound(
  round: number,
  statistics?: NumberStatistics[]
): AIPrediction {
  const seed = getRoundSeed(round);
  const random = createSeededRandom(seed);

  const predictedNumbers = statistics && statistics.length > 0
    ? selectWeightedNumbers(random, statistics, LOTTO_CONFIG.NUMBERS_COUNT)
    : selectRandomNumbers(random, LOTTO_CONFIG.NUMBERS_COUNT);

  return {
    round,
    predictedNumbers,
    predictedAt: getPredictionDate(round),
  };
}

/**
 * 정적 데이터 이후~현재 회차까지 모든 예측 생성
 */
export function generateDynamicPredictions(
  latestStaticRound: number,
  currentRound: number,
  statistics?: NumberStatistics[]
): AIPrediction[] {
  const predictions: AIPrediction[] = [];

  for (let round = latestStaticRound + 1; round <= currentRound + 1; round++) {
    predictions.push(generatePredictionForRound(round, statistics));
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
