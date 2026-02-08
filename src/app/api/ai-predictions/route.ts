import { NextRequest, NextResponse } from 'next/server';
import { REAL_LOTTO_DATA } from '@/data/realLottoData';
import {
  AI_PREDICTION_HISTORY,
  LATEST_STATIC_PREDICTION_ROUND,
  calculateMatches,
  calculateStats,
  type AIPrediction,
} from '@/data/aiPredictionHistory';
import { LottoStatisticsAnalyzer } from '@/lib/statisticsAnalyzer';
import {
  generateDynamicPredictions,
  estimateCurrentRound,
} from '@/lib/aiPredictionGenerator';

// 캐시 (1시간)
let cachedResult: {
  predictions: AIPrediction[];
  timestamp: number;
} | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1시간

export async function GET(request: NextRequest) {
  try {
    const now = Date.now();

    // 캐시 히트
    if (cachedResult && (now - cachedResult.timestamp) < CACHE_TTL) {
      const allPredictions = cachedResult.predictions;
      const results = calculateMatches(allPredictions, REAL_LOTTO_DATA);
      const stats = calculateStats(results);
      const latestDataRound = Math.max(...REAL_LOTTO_DATA.map(d => d.round));
      const nextPrediction = allPredictions.find(p => p.round > latestDataRound);

      return NextResponse.json({
        success: true,
        predictions: allPredictions,
        matchResults: results,
        stats,
        nextPrediction,
        latestDataRound,
        source: 'cached',
      });
    }

    // 통계 생성 (동적 예측의 가중치용)
    const statistics = LottoStatisticsAnalyzer.generateStatistics(REAL_LOTTO_DATA);

    // 현재 회차 추정
    const currentRound = estimateCurrentRound();

    // 동적 예측 생성 (1211회~현재+1)
    const dynamicPredictions = generateDynamicPredictions(
      LATEST_STATIC_PREDICTION_ROUND,
      currentRound,
      statistics
    );

    // 정적(1201~1210) + 동적(1211~) 합치기
    const allPredictions = [...AI_PREDICTION_HISTORY, ...dynamicPredictions];

    // 캐시 저장
    cachedResult = { predictions: allPredictions, timestamp: now };

    // 적중 결과 계산
    const results = calculateMatches(allPredictions, REAL_LOTTO_DATA);
    const stats = calculateStats(results);

    // 다음 회차 예측 (아직 추첨 안 된 것)
    const latestDataRound = Math.max(...REAL_LOTTO_DATA.map(d => d.round));
    const nextPrediction = allPredictions.find(p => p.round > latestDataRound);

    return NextResponse.json({
      success: true,
      predictions: allPredictions,
      matchResults: results,
      stats,
      nextPrediction,
      currentRound,
      latestDataRound,
      source: 'computed',
    });
  } catch (error) {
    console.error('AI predictions error:', error);
    // fallback: 정적 데이터만
    const results = calculateMatches(AI_PREDICTION_HISTORY, REAL_LOTTO_DATA);
    const stats = calculateStats(results);

    return NextResponse.json({
      success: true,
      predictions: AI_PREDICTION_HISTORY,
      matchResults: results,
      stats,
      source: 'static_fallback',
    });
  }
}
