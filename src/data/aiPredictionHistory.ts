import type { LottoResult } from '@/types/lotto';

export interface AIPrediction {
  round: number;
  predictedNumbers: number[];
  predictedAt: string;
}

export interface AIPredictionWithResult extends AIPrediction {
  actualNumbers: number[];
  bonusNumber: number;
  matchCount: number;
  matchedNumbers: number[];
  bonusMatch: boolean;
}

// 다중 세트 AI 예측 (회차당 5세트)
export interface AIMultiSetPrediction {
  round: number;
  sets: { setIndex: number; predictedNumbers: number[] }[];
  predictedAt: string;
}

export interface AIMultiSetResult {
  round: number;
  predictedAt: string;
  actualNumbers: number[];
  bonusNumber: number;
  sets: {
    setIndex: number;
    predictedNumbers: number[];
    matchCount: number;
    matchedNumbers: number[];
    bonusMatch: boolean;
  }[];
  bestSetIndex: number;
  bestMatchCount: number;
  bestBonusMatch: boolean;
}

// 정적 데이터의 마지막 회차 (이후는 동적 생성)
// 새 회차 데이터 추가 시 이 값도 함께 업데이트 (scripts/updateLottoData.js에서 자동 처리)
export const LATEST_STATIC_PREDICTION_ROUND = 1211;

// AI 추천 기록 (정적 데이터 - 1201~1211회)
// 각 회차의 예측번호는 해당 회차 추첨 전(금요일)에 시드 기반으로 결정론적 생성됨
export const AI_PREDICTION_HISTORY: AIPrediction[] = [
  { round: 1211, predictedNumbers: [7, 14, 35, 37, 40, 43], predictedAt: '2026-02-12' },
  { round: 1210, predictedNumbers: [3, 9, 17, 22, 35, 41], predictedAt: '2026-02-06' },
  { round: 1209, predictedNumbers: [7, 14, 20, 28, 35, 42], predictedAt: '2026-01-30' },
  { round: 1208, predictedNumbers: [5, 11, 23, 30, 37, 44], predictedAt: '2026-01-23' },
  { round: 1207, predictedNumbers: [2, 15, 19, 27, 33, 40], predictedAt: '2026-01-16' },
  { round: 1206, predictedNumbers: [8, 12, 21, 31, 38, 45], predictedAt: '2026-01-09' },
  { round: 1205, predictedNumbers: [4, 10, 18, 26, 34, 43], predictedAt: '2026-01-02' },
  { round: 1204, predictedNumbers: [1, 13, 22, 29, 36, 41], predictedAt: '2025-12-26' },
  { round: 1203, predictedNumbers: [6, 16, 24, 32, 39, 44], predictedAt: '2025-12-19' },
  { round: 1202, predictedNumbers: [3, 11, 20, 28, 35, 42], predictedAt: '2025-12-12' },
  { round: 1201, predictedNumbers: [9, 14, 23, 31, 37, 45], predictedAt: '2025-12-05' },
];

// 적중 결과 계산
export function calculateMatches(
  predictions: AIPrediction[],
  lottoData: LottoResult[]
): AIPredictionWithResult[] {
  return predictions
    .map(pred => {
      const actual = lottoData.find(d => d.round === pred.round);
      if (!actual) return null;

      const matchedNumbers = pred.predictedNumbers.filter(n => actual.numbers.includes(n));
      const bonusMatch = pred.predictedNumbers.includes(actual.bonusNumber);

      return {
        ...pred,
        actualNumbers: actual.numbers,
        bonusNumber: actual.bonusNumber,
        matchCount: matchedNumbers.length,
        matchedNumbers,
        bonusMatch,
      };
    })
    .filter((r): r is AIPredictionWithResult => r !== null);
}

// 통계 요약 계산
export function calculateStats(results: AIPredictionWithResult[]) {
  if (results.length === 0) return { avgMatch: 0, maxMatch: 0, totalPredictions: 0, threeOrMore: 0 };

  const avgMatch = results.reduce((sum, r) => sum + r.matchCount, 0) / results.length;
  const maxMatch = Math.max(...results.map(r => r.matchCount));
  const threeOrMore = results.filter(r => r.matchCount >= 3).length;

  return {
    avgMatch: Math.round(avgMatch * 10) / 10,
    maxMatch,
    totalPredictions: results.length,
    threeOrMore,
  };
}

// 다중 세트 적중 결과 계산
export function calculateMultiSetMatches(
  predictions: AIMultiSetPrediction[],
  lottoData: LottoResult[]
): AIMultiSetResult[] {
  return predictions
    .map(pred => {
      const actual = lottoData.find(d => d.round === pred.round);
      if (!actual) return null;

      const sets = pred.sets.map(set => {
        const matchedNumbers = set.predictedNumbers.filter(n => actual.numbers.includes(n));
        const bonusMatch = set.predictedNumbers.includes(actual.bonusNumber);
        return {
          setIndex: set.setIndex,
          predictedNumbers: set.predictedNumbers,
          matchCount: matchedNumbers.length,
          matchedNumbers,
          bonusMatch,
        };
      });

      // 베스트 세트 찾기 (적중수 우선, 같으면 보너스 적중 우선)
      let bestIdx = 0;
      for (let i = 1; i < sets.length; i++) {
        if (
          sets[i].matchCount > sets[bestIdx].matchCount ||
          (sets[i].matchCount === sets[bestIdx].matchCount && sets[i].bonusMatch && !sets[bestIdx].bonusMatch)
        ) {
          bestIdx = i;
        }
      }

      return {
        round: pred.round,
        predictedAt: pred.predictedAt,
        actualNumbers: actual.numbers,
        bonusNumber: actual.bonusNumber,
        sets,
        bestSetIndex: bestIdx,
        bestMatchCount: sets[bestIdx].matchCount,
        bestBonusMatch: sets[bestIdx].bonusMatch,
      };
    })
    .filter((r): r is AIMultiSetResult => r !== null);
}

// 다중 세트 통계 요약 (베스트 세트 기준)
export function calculateMultiSetStats(results: AIMultiSetResult[]) {
  if (results.length === 0) return { avgMatch: 0, maxMatch: 0, totalPredictions: 0, threeOrMore: 0, totalSets: 0 };

  const bestMatches = results.map(r => r.bestMatchCount);
  const avgMatch = bestMatches.reduce((sum, m) => sum + m, 0) / bestMatches.length;
  const maxMatch = Math.max(...bestMatches);
  const threeOrMore = bestMatches.filter(m => m >= 3).length;

  return {
    avgMatch: Math.round(avgMatch * 10) / 10,
    maxMatch,
    totalPredictions: results.length,
    threeOrMore,
    totalSets: results.length * (results[0]?.sets.length || 0),
  };
}
