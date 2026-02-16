import { NextRequest, NextResponse } from 'next/server';
import { getAllLottoData, registerCacheInvalidationCallback } from '@/lib/dataFetcher';
import {
  AI_PREDICTION_HISTORY,
  LATEST_STATIC_PREDICTION_ROUND,
  calculateMatches,
  calculateStats,
  calculateMultiSetMatches,
  calculateMultiSetStats,
  type AIPrediction,
  type AIMultiSetPrediction,
} from '@/data/aiPredictionHistory';
import { LottoStatisticsAnalyzer } from '@/lib/statisticsAnalyzer';
import {
  generateDynamicPredictions,
  generateDynamicMultiSetPredictions,
  convertStaticToMultiSet,
  estimateCurrentRound,
} from '@/lib/aiPredictionGenerator';

// 캐시 (1시간)
let cachedResult: {
  predictions: AIPrediction[];
  multiSetPredictions: AIMultiSetPrediction[];
  lottoDataLength: number;
  latestDataRound: number;
  timestamp: number;
} | null = null;
const CACHE_TTL = 60 * 60 * 1000;

registerCacheInvalidationCallback(() => {
  cachedResult = null;
});

export async function GET(request: NextRequest) {
  try {
    const now = Date.now();

    const allLottoData = await getAllLottoData();
    const latestDataRound = Math.max(...allLottoData.map(d => d.round));

    // 캐시 히트
    if (
      cachedResult &&
      (now - cachedResult.timestamp) < CACHE_TTL &&
      cachedResult.lottoDataLength === allLottoData.length &&
      cachedResult.latestDataRound === latestDataRound
    ) {
      const allPredictions = cachedResult.predictions;
      const multiSetPredictions = cachedResult.multiSetPredictions;

      // 기존 단일 세트 결과 (하위 호환)
      const results = calculateMatches(allPredictions, allLottoData);
      const stats = calculateStats(results);
      const nextPrediction = allPredictions.find(p => p.round > latestDataRound);

      // 다중 세트 결과
      const multiSetResults = calculateMultiSetMatches(multiSetPredictions, allLottoData);
      const multiSetStats = calculateMultiSetStats(multiSetResults);
      const nextMultiSetPrediction = multiSetPredictions.find(p => p.round > latestDataRound);

      return NextResponse.json({
        success: true,
        predictions: allPredictions,
        matchResults: results,
        stats,
        nextPrediction,
        // 다중 세트 데이터
        multiSetResults,
        multiSetStats,
        nextMultiSetPrediction,
        latestDataRound,
        source: 'cached',
      });
    }

    // 통계 생성
    const statistics = LottoStatisticsAnalyzer.generateStatistics(allLottoData);
    const currentRound = estimateCurrentRound();

    // 단일 세트 (하위 호환)
    const dynamicPredictions = generateDynamicPredictions(
      LATEST_STATIC_PREDICTION_ROUND,
      currentRound,
      statistics
    );
    const allPredictions = [...AI_PREDICTION_HISTORY, ...dynamicPredictions];

    // 다중 세트 생성
    const staticMultiSet = convertStaticToMultiSet(AI_PREDICTION_HISTORY, statistics);
    const dynamicMultiSet = generateDynamicMultiSetPredictions(
      LATEST_STATIC_PREDICTION_ROUND,
      currentRound,
      statistics
    );
    const allMultiSetPredictions = [...staticMultiSet, ...dynamicMultiSet];

    // 캐시 저장
    cachedResult = {
      predictions: allPredictions,
      multiSetPredictions: allMultiSetPredictions,
      lottoDataLength: allLottoData.length,
      latestDataRound,
      timestamp: now,
    };

    // 결과 계산
    const results = calculateMatches(allPredictions, allLottoData);
    const stats = calculateStats(results);
    const nextPrediction = allPredictions.find(p => p.round > latestDataRound);

    const multiSetResults = calculateMultiSetMatches(allMultiSetPredictions, allLottoData);
    const multiSetStats = calculateMultiSetStats(multiSetResults);
    const nextMultiSetPrediction = allMultiSetPredictions.find(p => p.round > latestDataRound);

    return NextResponse.json({
      success: true,
      predictions: allPredictions,
      matchResults: results,
      stats,
      nextPrediction,
      // 다중 세트 데이터
      multiSetResults,
      multiSetStats,
      nextMultiSetPrediction,
      currentRound,
      latestDataRound,
      source: 'computed',
    });
  } catch (error) {
    console.error('AI predictions error:', error);
    const { REAL_LOTTO_DATA } = await import('@/data/realLottoData');
    const results = calculateMatches(AI_PREDICTION_HISTORY, REAL_LOTTO_DATA);
    const stats = calculateStats(results);

    return NextResponse.json({
      success: true,
      predictions: AI_PREDICTION_HISTORY,
      matchResults: results,
      stats,
      multiSetResults: [],
      multiSetStats: { avgMatch: 0, maxMatch: 0, totalPredictions: 0, threeOrMore: 0, totalSets: 0 },
      source: 'static_fallback',
    });
  }
}
