import { NextRequest, NextResponse } from 'next/server';
import { getAllLottoData, registerCacheInvalidationCallback } from '@/lib/dataFetcher';
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

// 캐시 (1시간) - lottoDataLength와 latestDataRound 모두 확인하여 유효성 검증
let cachedResult: {
  predictions: AIPrediction[];
  lottoDataLength: number;
  latestDataRound: number;
  timestamp: number;
} | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1시간

// dataFetcher 캐시 무효화 시 이 캐시도 같이 날림
registerCacheInvalidationCallback(() => {
  cachedResult = null;
});

export async function GET(request: NextRequest) {
  try {
    const now = Date.now();

    // 최신 로또 데이터 가져오기 (정적 + 동적)
    const allLottoData = await getAllLottoData();

    // 최신 데이터 회차 번호 계산 (캐시 검증에도 사용)
    const latestDataRound = Math.max(...allLottoData.map(d => d.round));

    // 캐시 히트 (데이터 길이 + 최신 회차 모두 일치해야 유효)
    if (
      cachedResult &&
      (now - cachedResult.timestamp) < CACHE_TTL &&
      cachedResult.lottoDataLength === allLottoData.length &&
      cachedResult.latestDataRound === latestDataRound
    ) {
      const allPredictions = cachedResult.predictions;
      const results = calculateMatches(allPredictions, allLottoData);
      const stats = calculateStats(results);
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
    const statistics = LottoStatisticsAnalyzer.generateStatistics(allLottoData);

    // 현재 회차 추정
    const currentRound = estimateCurrentRound();

    // 동적 예측 생성 (정적 데이터 이후 ~ 현재+1)
    const dynamicPredictions = generateDynamicPredictions(
      LATEST_STATIC_PREDICTION_ROUND,
      currentRound,
      statistics
    );

    // 정적(1201~LATEST_STATIC) + 동적(LATEST_STATIC+1~) 합치기
    const allPredictions = [...AI_PREDICTION_HISTORY, ...dynamicPredictions];

    // 캐시 저장 (latestDataRound 포함)
    cachedResult = {
      predictions: allPredictions,
      lottoDataLength: allLottoData.length,
      latestDataRound,
      timestamp: now,
    };

    // 적중 결과 계산
    const results = calculateMatches(allPredictions, allLottoData);
    const stats = calculateStats(results);

    // 다음 회차 예측 (아직 추첨 안 된 것)
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
    const { REAL_LOTTO_DATA } = await import('@/data/realLottoData');
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
