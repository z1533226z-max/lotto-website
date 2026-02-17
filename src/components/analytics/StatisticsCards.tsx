'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import { LottoStatisticsAnalyzer } from '@/lib/statisticsAnalyzer';
import { getSampleStatistics, getDefaultHotNumber, getDefaultColdNumber } from '@/data/sampleLottoData';
import type { NumberStatistics } from '@/types/lotto';

interface StatisticsCardsProps {
  className?: string;
}

// 스켈레톤 로더 컴포넌트
const SkeletonCard = ({ icon, title }: { icon: string; title: string }) => (
  <div className="rounded-xl p-6 animate-pulse" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
    <div className="flex items-center mb-3">
      <span className="text-2xl mr-2">{icon}</span>
      <h3 className="font-bold" style={{ color: 'var(--text)' }}>{title}</h3>
    </div>
    <div className="space-y-2">
      <div className="h-8 rounded w-20" style={{ backgroundColor: 'var(--border)' }}></div>
      <div className="h-4 rounded w-32" style={{ backgroundColor: 'var(--surface-hover)' }}></div>
    </div>
  </div>
);

// 에러 상태 컴포넌트
const ErrorCard = ({ onRetry, error }: { onRetry: () => void; error: string }) => (
  <Card className="col-span-full text-center py-8 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
    <div className="space-y-4">
      <div>
        <p className="text-red-600 dark:text-red-400 font-semibold mb-2">통계 데이터 로딩 실패</p>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{error}</p>
      </div>
      <button
        onClick={onRetry}
        className="px-4 py-2 text-white rounded-lg transition-colors text-sm"
        style={{ background: '#D36135' }}
      >
        다시 시도
      </button>
    </div>
  </Card>
);

interface AIHitStats {
  avgMatch: number;
  maxMatch: number;
  totalPredictions: number;
  threeOrMore: number;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ className }) => {
  const [statistics, setStatistics] = useState<NumberStatistics[] | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [aiHitStats, setAiHitStats] = useState<AIHitStats | null>(null);

  // 통계 + AI적중 데이터 로딩
  const fetchStatistics = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      setStatsError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const [statsRes, aiRes] = await Promise.allSettled([
        fetch('/api/lotto/statistics', {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' },
        }),
        fetch('/api/ai-predictions', {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' },
        }),
      ]);

      clearTimeout(timeoutId);

      // 통계 데이터 처리
      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        const result = await statsRes.value.json();
        if (result.success) {
          const { statistics: statsData } = result.data;
          if (Array.isArray(statsData) && statsData.length === 45) {
            setStatistics(statsData);
          }
        }
      }

      // AI 적중 데이터 처리
      if (aiRes.status === 'fulfilled' && aiRes.value.ok) {
        const aiData = await aiRes.value.json();
        if (aiData.success && aiData.stats) {
          setAiHitStats(aiData.stats);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setStatsError('요청 시간이 초과되었습니다.');
      } else {
        setStatsError(error instanceof Error ? error.message : '알 수 없는 오류');
      }
      setStatistics(null);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // 데이터 검증 및 Fallback
  const validateAndFallback = useCallback((inputStatistics: NumberStatistics[] | null): NumberStatistics[] => {
    if (!inputStatistics || inputStatistics.length === 0) return getSampleStatistics();
    if (inputStatistics.length !== 45) return getSampleStatistics();
    const isValid = LottoStatisticsAnalyzer.validateStatistics(inputStatistics);
    if (!isValid) return getSampleStatistics();
    return inputStatistics;
  }, []);

  const analysisData = useMemo(() => {
    try {
      const validatedStatistics = validateAndFallback(statistics);
      const hotNumbers = LottoStatisticsAnalyzer.getHotNumbers(validatedStatistics, 3);
      const coldNumbers = LottoStatisticsAnalyzer.getColdNumbers(validatedStatistics, 3);
      const hotNumber = hotNumbers.length > 0 ? hotNumbers[0] : getDefaultHotNumber();
      const coldNumber = coldNumbers.length > 0 ? coldNumbers[0] : getDefaultColdNumber();
      const finalColdNumber = coldNumber.number === hotNumber.number
        ? (coldNumbers.length > 1 ? coldNumbers[1] : getDefaultColdNumber())
        : coldNumber;

      // 총 분석 회차 계산
      const totalFrequency = validatedStatistics.reduce((sum, stat) => sum + stat.frequency, 0);
      const totalRounds = Math.round(totalFrequency / 6);

      return {
        hotNumber,
        coldNumber: finalColdNumber,
        totalRounds,
        dataSource: statistics === null ? 'fallback' : 'api',
      };
    } catch {
      return {
        hotNumber: getDefaultHotNumber(),
        coldNumber: getDefaultColdNumber(),
        totalRounds: 0,
        dataSource: 'error-fallback',
      };
    }
  }, [statistics, validateAndFallback]);

  if (isLoadingStats) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
        <SkeletonCard icon="🔥" title="핫넘버" />
        <SkeletonCard icon="❄️" title="콜드넘버" />
        <SkeletonCard icon="🎯" title="AI 적중" />
      </div>
    );
  }

  if (statsError) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
        <ErrorCard onRetry={fetchStatistics} error={statsError} />
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {/* 핫넘버 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-6 border border-red-200 dark:border-red-800 h-full">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">🔥</span>
            <h3 className="font-bold" style={{ color: 'var(--text)' }}>핫넘버</h3>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {analysisData.hotNumber ? `${analysisData.hotNumber.number}번` : '--'}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {analysisData.hotNumber
                ? `출현 ${analysisData.hotNumber.frequency}회 · 점수 ${Math.round(analysisData.hotNumber.hotColdScore)}`
                : '분석 중...'
              }
            </div>
          </div>
        </div>
      </motion.div>

      {/* 콜드넘버 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 h-full">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">❄️</span>
            <h3 className="font-bold" style={{ color: 'var(--text)' }}>콜드넘버</h3>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {analysisData.coldNumber ? `${analysisData.coldNumber.number}번` : '--'}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {analysisData.coldNumber
                ? `마지막 출현: ${analysisData.coldNumber.lastAppeared}회차`
                : '분석 중...'
              }
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI 적중 실적 카드 (실제 데이터) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800 h-full">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">🎯</span>
            <h3 className="font-bold" style={{ color: 'var(--text)' }}>AI 적중 실적</h3>
          </div>
          <div className="space-y-2">
            {aiHitStats ? (
              <>
                <div className="text-3xl font-bold" style={{ color: '#D36135' }}>
                  최대 {aiHitStats.maxMatch}개
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  평균 {aiHitStats.avgMatch.toFixed(1)}개 · 3개+ {aiHitStats.threeOrMore}회
                </div>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  총 {aiHitStats.totalPredictions}회 예측 검증 완료
                </div>
              </>
            ) : (
              <>
                <div className="text-3xl font-bold" style={{ color: '#D36135' }}>
                  {analysisData.totalRounds.toLocaleString()}회차
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  전체 데이터 분석 완료
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StatisticsCards;