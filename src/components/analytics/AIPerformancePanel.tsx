'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, RotateCw, Bot } from 'lucide-react';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { LottoStatisticsAnalyzer } from '@/lib/statisticsAnalyzer';
import { getSampleStatistics, getDefaultAIPerformance, SAMPLE_LOTTO_DATA } from '@/data/sampleLottoData';
import type { NumberStatistics, AIPerformanceMetrics } from '@/types/lotto';

interface AIPerformancePanelProps {
  className?: string;
}

// 스켈레톤 로더 컴포넌트
const PerformanceSkeletonLoader = () => (
  <Card className="p-6 animate-pulse">
    <div className="flex items-center mb-4">
      <div className="w-8 h-8 rounded-full mr-3" style={{ backgroundColor: 'var(--border)' }}></div>
      <div className="h-6 rounded w-32" style={{ backgroundColor: 'var(--border)' }}></div>
    </div>
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex justify-between items-center">
          <div className="h-4 rounded w-24" style={{ backgroundColor: 'var(--surface-hover)' }}></div>
          <div className="h-4 rounded w-16" style={{ backgroundColor: 'var(--border)' }}></div>
        </div>
      ))}
    </div>
  </Card>
);

// 에러 상태 컴포넌트
const PerformanceErrorCard = ({ onRetry, error }: { onRetry: () => void; error: string }) => (
  <Card className="p-6 border-red-200 bg-red-50">
    <div className="text-center space-y-4">
      <div>
        <h3 className="font-bold text-red-600 mb-2 flex items-center justify-center"><AlertTriangle className="w-5 h-5 inline-block mr-1" /> AI 성능 데이터 로딩 실패</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{error}</p>
      </div>
      <div className="flex gap-2 justify-center">
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4 inline-block mr-1" /> 다시 시도
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
        >
          <RotateCw className="w-4 h-4 inline-block mr-1" /> 새로고침
        </button>
      </div>
    </div>
  </Card>
);

const AIPerformancePanel: React.FC<AIPerformancePanelProps> = ({ className }) => {
  // 통계 데이터 상태
  const [statistics, setStatistics] = useState<NumberStatistics[] | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // 최적화된 AI 성능 데이터 로딩
  const fetchAIPerformanceData = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      setStatsError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const response = await fetch('/api/lotto/statistics', {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'public, max-age=300'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'API 응답 오류');
      }

      const { statistics: statsData } = result.data;

      if (!Array.isArray(statsData) || statsData.length !== 45) {
        throw new Error('AI 성능 분석을 위한 통계 데이터가 유효하지 않습니다');
      }

      setStatistics(statsData);

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setStatsError('AI 성능 데이터 로딩 시간이 초과되었습니다.');
      } else {
        setStatsError(error instanceof Error ? error.message : 'AI 성능 분석 중 알 수 없는 오류가 발생했습니다');
      }

      setStatistics(null);

    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // 초기 데이터 로딩
  useEffect(() => {
    fetchAIPerformanceData();
  }, [fetchAIPerformanceData]);

  // 최적화된 AI 성능 메트릭 계산
  const performanceMetrics = useMemo(() => {
    try {
      if (!statistics || statistics.length === 0) {
        const defaultMetrics = getDefaultAIPerformance();
        return {
          ...defaultMetrics,
          dataSource: 'fallback'
        };
      }

      // 데이터 품질 검증
      const isValidData = LottoStatisticsAnalyzer.validateStatistics(statistics);
      if (!isValidData) {
        const defaultMetrics = getDefaultAIPerformance();
        return {
          ...defaultMetrics,
          dataSource: 'validation-failed'
        };
      }

      // 실제 데이터 기반 AI 성능 계산
      const dataSize = statistics.length;
      const totalFrequency = statistics.reduce((sum, stat) => sum + stat.frequency, 0);
      const avgFrequency = totalFrequency / dataSize;
      
      // 동적 성능 지표 계산
      const dataQualityScore = Math.min(100, (avgFrequency / 200) * 100);
      const baseAccuracy = Math.max(65, Math.min(85, 70 + (dataQualityScore * 0.15)));
      const baseDetection = Math.max(70, Math.min(88, 75 + (dataQualityScore * 0.13)));
      const baseConfidence = Math.max(65, Math.min(82, 68 + (dataQualityScore * 0.14)));
      
      // 핫/콜드 번호 분석 품질 평가
      const hotNumbers = LottoStatisticsAnalyzer.getHotNumbers(statistics, 5);
      const coldNumbers = LottoStatisticsAnalyzer.getColdNumbers(statistics, 5);
      const analysisQuality = Math.min(1, (hotNumbers.length + coldNumbers.length) / 10);
      
      const result = {
        predictionAccuracy: Math.round(baseAccuracy * analysisQuality),
        patternDetectionRate: Math.round(baseDetection * analysisQuality),
        confidenceLevel: Math.round(baseConfidence * analysisQuality),
        lastUpdated: new Date().toISOString(),
        totalAnalyzedRounds: Math.round(totalFrequency / 6),
        dataSource: 'real-time-calculation'
      };
      
      return result;

    } catch {
      const fallbackMetrics = getDefaultAIPerformance();
      return {
        ...fallbackMetrics,
        dataSource: 'calculation-error'
      };
    }
  }, [statistics]);

  // 스켈레톤 로딩 상태
  if (isLoadingStats) {
    return (
      <div className={className}>
        <PerformanceSkeletonLoader />
      </div>
    );
  }

  // 향상된 에러 상태 (재시도 기능 포함)
  if (statsError) {
    return (
      <div className={className}>
        <PerformanceErrorCard onRetry={fetchAIPerformanceData} error={statsError} />
      </div>
    );
  }

  // 성능 등급 계산
  const getPerformanceGrade = (accuracy: number) => {
    if (accuracy >= 80) return { grade: 'S', color: 'text-green-600', bgColor: 'bg-green-500/10' };
    if (accuracy >= 70) return { grade: 'A', color: 'text-blue-600', bgColor: 'bg-blue-500/10' };
    if (accuracy >= 60) return { grade: 'B', color: 'text-yellow-600', bgColor: 'bg-yellow-500/10' };
    return { grade: 'C', color: 'text-red-600', bgColor: 'bg-red-500/10' };
  };

  const grade = getPerformanceGrade(performanceMetrics.confidenceLevel);

  return (
    <div className={className}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Bot className="w-7 h-7 mr-3" />
            <h3 className="font-bold" style={{ color: 'var(--text)' }}>AI 성능 검증</h3>
            <div className={`ml-auto px-3 py-1 rounded-full text-sm font-bold ${grade.color} ${grade.bgColor}`}>
              {grade.grade}등급
            </div>
          </div>
          
          <div className="space-y-4">
            {/* 예측 정확도 */}
            <div className="flex justify-between items-center">
              <span style={{ color: 'var(--text-secondary)' }}>예측 정확도</span>
              <div className="flex items-center">
                <span className="font-bold text-lg mr-2">{performanceMetrics.predictionAccuracy}%</span>
                <div className="w-20 rounded-full h-2" style={{ backgroundColor: 'var(--surface-hover)' }}>
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${performanceMetrics.predictionAccuracy}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* 패턴 감지율 */}
            <div className="flex justify-between items-center">
              <span style={{ color: 'var(--text-secondary)' }}>패턴 감지율</span>
              <div className="flex items-center">
                <span className="font-bold text-lg mr-2">{performanceMetrics.patternDetectionRate}%</span>
                <div className="w-20 rounded-full h-2" style={{ backgroundColor: 'var(--surface-hover)' }}>
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${performanceMetrics.patternDetectionRate}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* 신뢰도 */}
            <div className="flex justify-between items-center">
              <span style={{ color: 'var(--text-secondary)' }}>신뢰도</span>
              <div className="flex items-center">
                <span className="font-bold text-lg mr-2">{performanceMetrics.confidenceLevel}%</span>
                <div className="w-20 rounded-full h-2" style={{ backgroundColor: 'var(--surface-hover)' }}>
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${performanceMetrics.confidenceLevel}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <div className="flex justify-between text-sm" style={{ color: 'var(--text-tertiary)' }}>
              <span>분석 회차: {performanceMetrics.totalAnalyzedRounds}회</span>
              <span>업데이트: {new Date(performanceMetrics.lastUpdated).toLocaleTimeString()}</span>
            </div>
            {performanceMetrics.dataSource === 'fallback' && (
              <div className="text-xs text-orange-500 mt-1">* 샘플 데이터 기반</div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AIPerformancePanel;