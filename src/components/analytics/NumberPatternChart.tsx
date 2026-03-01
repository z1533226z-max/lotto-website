'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, BarChart3, Flame, Zap } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { LottoStatisticsAnalyzer } from '@/lib/statisticsAnalyzer';
import { CHART_COLORS } from '@/lib/constants';
import { getSampleStatistics, SAMPLE_LOTTO_DATA } from '@/data/sampleLottoData';
import type { NumberStatistics, SectionDistribution, OddEvenPattern } from '@/types/lotto';

interface NumberPatternChartProps {
  className?: string;
}

// 차트 스켈레톤 로더
const ChartSkeletonLoader = () => (
  <Card className="p-6 animate-pulse">
    <div className="flex items-center mb-4">
      <div className="h-6 rounded w-40" style={{ backgroundColor: 'var(--surface-hover)' }}></div>
    </div>
    <div className="space-y-4">
      <div className="h-64 rounded" style={{ backgroundColor: 'var(--surface-hover)' }}></div>
      <div className="flex gap-4">
        <div className="h-32 rounded flex-1" style={{ backgroundColor: 'var(--surface-hover)' }}></div>
        <div className="h-32 rounded flex-1" style={{ backgroundColor: 'var(--surface-hover)' }}></div>
      </div>
    </div>
  </Card>
);

// 차트 에러 컴포넌트
const ChartErrorCard = ({ onRetry, error }: { onRetry: () => void; error: string }) => (
  <Card className="p-6 border-red-200 bg-red-50">
    <div className="text-center space-y-4">
      <div>
        <h3 className="font-bold text-red-600 mb-2 flex items-center justify-center"><AlertTriangle className="w-5 h-5 inline-block mr-1" /> 패턴 차트 로딩 실패</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{error}</p>
      </div>
      <div className="flex gap-2 justify-center">
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4 inline-block mr-1" /> 다시 시도
        </button>
      </div>
    </div>
  </Card>
);

const NumberPatternChart: React.FC<NumberPatternChartProps> = ({ className }) => {
  // 통계 데이터 상태
  const [statistics, setStatistics] = useState<NumberStatistics[] | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<any[]>([]);

  // 최적화된 패턴 데이터 로딩
  const fetchPatternData = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      setStatsError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch('/api/lotto/statistics', {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'public, max-age=600'
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

      const { statistics: statsData, rawData } = result.data;

      if (!Array.isArray(statsData) || statsData.length !== 45) {
        throw new Error('패턴 분석을 위한 통계 데이터가 유효하지 않습니다');
      }

      setStatistics(statsData);
      setRawData(rawData || SAMPLE_LOTTO_DATA);

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setStatsError('패턴 차트 데이터 로딩 시간이 초과되었습니다.');
      } else {
        setStatsError(error instanceof Error ? error.message : '패턴 분석 중 알 수 없는 오류가 발생했습니다');
      }

      // Fallback 데이터 설정
      setStatistics(getSampleStatistics());
      setRawData(SAMPLE_LOTTO_DATA);

    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // 초기 데이터 로딩
  useEffect(() => {
    fetchPatternData();
  }, [fetchPatternData]);

  // 차트 데이터 계산 헬퍼 함수
  const calculateChartData = useCallback((stats: NumberStatistics[], data: any[]) => {
    // 1. 상위 10개 빈도 번호 차트 데이터
    const top10Data = stats
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10)
      .map(stat => ({
        number: `${stat.number}번`,
        frequency: stat.frequency,
        hotColdScore: Math.round(stat.hotColdScore)
      }));

    // 2. 구간별 분포 분석
    const sectionData: SectionDistribution[] = [
      { section: '1-9', count: 0, percentage: 0 },
      { section: '10-19', count: 0, percentage: 0 },
      { section: '20-29', count: 0, percentage: 0 },
      { section: '30-39', count: 0, percentage: 0 },
      { section: '40-45', count: 0, percentage: 0 }
    ];

    const totalFrequency = stats.reduce((sum, stat) => sum + stat.frequency, 0);
    
    stats.forEach(stat => {
      const number = stat.number;
      if (number <= 9) sectionData[0].count += stat.frequency;
      else if (number <= 19) sectionData[1].count += stat.frequency;
      else if (number <= 29) sectionData[2].count += stat.frequency;
      else if (number <= 39) sectionData[3].count += stat.frequency;
      else sectionData[4].count += stat.frequency;
    });

    sectionData.forEach(section => {
      section.percentage = Math.round((section.count / totalFrequency) * 100);
    });

    // 3. 홀짝 분석
    const oddCount = stats.filter(stat => stat.number % 2 === 1).reduce((sum, stat) => sum + stat.frequency, 0);
    const evenCount = totalFrequency - oddCount;
    
    const oddEvenData: OddEvenPattern[] = [
      { 
        type: '홀수', 
        count: oddCount, 
        percentage: Math.round((oddCount / totalFrequency) * 100),
        numbers: stats.filter(stat => stat.number % 2 === 1).length
      },
      { 
        type: '짝수', 
        count: evenCount, 
        percentage: Math.round((evenCount / totalFrequency) * 100),
        numbers: stats.filter(stat => stat.number % 2 === 0).length
      }
    ];

    return {
      top10Data,
      sectionData,
      oddEvenData,
      totalAnalyzed: totalFrequency,
      lastUpdated: new Date().toISOString()
    };
  }, []);

  // 최적화된 차트 데이터 계산
  const chartData = useMemo(() => {
    try {
      if (!statistics || statistics.length === 0) {
        const fallbackStats = getSampleStatistics();
        const result = calculateChartData(fallbackStats, SAMPLE_LOTTO_DATA);
        return { ...result, dataSource: 'fallback' };
      }

      const result = calculateChartData(statistics, rawData);
      return { ...result, dataSource: 'api' };

    } catch {
      const fallbackStats = getSampleStatistics();
      const result = calculateChartData(fallbackStats, SAMPLE_LOTTO_DATA);
      return { ...result, dataSource: 'error-fallback' };
    }
  }, [statistics, rawData, calculateChartData]);

  // 스켈레톤 로딩 상태
  if (isLoadingStats) {
    return (
      <div className={className}>
        <ChartSkeletonLoader />
      </div>
    );
  }

  // 에러 상태 (Fallback 데이터로 계속 진행)
  if (statsError && !statistics) {
    return (
      <div className={className}>
        <ChartErrorCard onRetry={fetchPatternData} error={statsError} />
      </div>
    );
  }

  return (
    <div className={className}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center" style={{ color: 'var(--text)' }}><BarChart3 className="w-5 h-5 inline-block mr-1" /> 번호별 출현 패턴</h3>
            {chartData.dataSource === 'fallback' && (
              <span className="text-xs text-orange-500">* 샘플 데이터</span>
            )}
          </div>
          
          {/* 상위 10개 번호 막대 차트 */}
          <div className="mb-8">
            <h4 className="font-semibold mb-4 flex items-center" style={{ color: 'var(--text-secondary)' }}><Flame className="w-4 h-4 inline-block mr-1" /> 빈도 TOP 10</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.top10Data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="number" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value}회`,
                    name === 'frequency' ? '출현 빈도' : '핫 스코어'
                  ]}
                />
                <Bar dataKey="frequency" fill={CHART_COLORS.primary} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 구간별 분포 파이 차트 */}
            <div>
              <h4 className="font-semibold mb-4 flex items-center" style={{ color: 'var(--text-secondary)' }}><BarChart3 className="w-4 h-4 inline-block mr-1" /> 구간별 분포</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData.sectionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ section, percentage }) => `${section}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {chartData.sectionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS.sections[index % CHART_COLORS.sections.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}회`, '출현 횟수']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* 홀짝 분포 파이 차트 */}
            <div>
              <h4 className="font-semibold mb-4 flex items-center" style={{ color: 'var(--text-secondary)' }}><Zap className="w-4 h-4 inline-block mr-1" /> 홀짝 분포</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData.oddEvenData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percentage }) => `${type}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {chartData.oddEvenData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? CHART_COLORS.warning : CHART_COLORS.success} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value}회 (${props.payload.numbers}개 번호)`, 
                      '총 출현 횟수'
                    ]} 
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex justify-between text-sm" style={{ color: 'var(--text-tertiary)' }}>
              <span>총 분석 데이터: {chartData.totalAnalyzed.toLocaleString()}회</span>
              <span>업데이트: {new Date(chartData.lastUpdated).toLocaleTimeString()}</span>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default NumberPatternChart;
