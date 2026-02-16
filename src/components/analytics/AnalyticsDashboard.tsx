'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Tabs from '@/components/ui/Tabs';
import StatisticsCards from './StatisticsCards';
import AIPerformancePanel from './AIPerformancePanel';
import NumberPatternChart from './NumberPatternChart';
import WeeklyChanges from './WeeklyChanges';
import TrendChart from './TrendChart';
import HeatmapChart from './HeatmapChart';
import UserEngagementPanel from '@/components/gamification/UserEngagementPanel';
import TrendAlerts from '@/components/gamification/TrendAlerts';
import PersonalizedInsights from '@/components/gamification/PersonalizedInsights';
import type { NumberStatistics, LottoResult } from '@/types/lotto';

interface AnalyticsDashboardProps {
  className?: string;
}

const TABS = [
  { id: 'weekly', label: '이번 주 변화', icon: <span>🔄</span> },
  { id: 'trend', label: '트렌드 분석', icon: <span>📈</span> },
  { id: 'heatmap', label: '히트맵', icon: <span>🗺️</span> },
  { id: 'overview', label: '전체 통계', icon: <span>📊</span> },
];

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className }) => {
  const [statistics, setStatistics] = useState<NumberStatistics[] | null>(null);
  const [lottoData, setLottoData] = useState<LottoResult[] | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [dashboardReady, setDashboardReady] = useState(false);
  const [activeTab, setActiveTab] = useState('weekly');

  // Load statistics and raw data
  useEffect(() => {
    const initializeDashboard = async () => {
      const loadStartTime = Date.now();
      console.time('Analytics Dashboard Loading');

      try {
        setIsLoadingStats(true);
        setStatsError(null);

        console.log('AnalyticsDashboard: 대시보드 초기화 시작...');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch('/api/lotto/statistics', {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: API 호출 실패`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'API 응답 오류');
        }

        const { statistics: statsData, rawData } = result.data;

        // Validate statistics
        if (!Array.isArray(statsData) || statsData.length !== 45) {
          throw new Error('통계 데이터가 유효하지 않습니다');
        }

        setStatistics(statsData);

        // Set raw lotto data for windowed analysis
        if (Array.isArray(rawData) && rawData.length > 0) {
          setLottoData(rawData);
        }

        const loadTime = Date.now() - loadStartTime;

        setTimeout(() => {
          setDashboardReady(true);
        }, 200);

        console.log(`AnalyticsDashboard: 초기화 완료 (${loadTime}ms), ${rawData?.length || 0}회차 데이터`);
      } catch (error) {
        const loadTime = Date.now() - loadStartTime;

        if (error instanceof Error && error.name === 'AbortError') {
          console.error(`AnalyticsDashboard: 초기화 타임아웃 (${loadTime}ms)`);
          setStatsError('대시보드 로딩 시간이 초과되었습니다');
        } else {
          console.error(`AnalyticsDashboard: 초기화 실패 (${loadTime}ms):`, error);
          setStatsError(error instanceof Error ? error.message : '알 수 없는 오류');
        }

        setDashboardReady(true);
      } finally {
        setIsLoadingStats(false);
        console.timeEnd('Analytics Dashboard Loading');
      }
    };

    initializeDashboard();
  }, []);

  // Loading state
  if (isLoadingStats || !dashboardReady) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${className}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          <div className="relative">
            <LoadingSpinner size="lg" />
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-800 dark:text-dark-text">AI 분석 대시보드 준비 중</h3>
            <p className="text-gray-600 dark:text-dark-text-secondary">전체 회차 데이터를 종합 분석하고 있습니다...</p>
            <div className="flex justify-center space-x-2 text-sm text-gray-500 dark:text-dark-text-tertiary">
              <span>이번 주 변화</span>
              <span>트렌드 분석</span>
              <span>히트맵</span>
              <span>전체 통계</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const hasError = statsError !== null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Dashboard Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
          AI 분석 대시보드
        </h2>
        <p className="text-gray-600 dark:text-dark-text-secondary mb-2">
          매주 업데이트되는 동적 통계 분석
        </p>

        <div className="flex justify-center items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${hasError ? 'bg-orange-500' : 'bg-green-500'}`} />
            <span className={hasError ? 'text-orange-600' : 'text-green-600 dark:text-green-400'}>
              {hasError ? '일부 기능 제한' : '모든 시스템 정상'}
            </span>
          </div>
          <div className="text-gray-400 dark:text-dark-text-tertiary">|</div>
          <div className="text-gray-500 dark:text-dark-text-tertiary">
            마지막 업데이트: {new Date().toLocaleDateString('ko-KR')}
          </div>
        </div>
      </motion.div>

      {/* Error Alert */}
      {hasError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mx-auto max-w-2xl"
        >
          <div className="flex items-center">
            <span className="text-orange-500 mr-2">!</span>
            <div>
              <p className="text-orange-800 dark:text-orange-300 font-medium">일부 데이터 로딩 지연</p>
              <p className="text-orange-600 dark:text-orange-400 text-sm mt-1">
                {statsError} - 각 분석 모듈이 개별적으로 데이터를 처리 중입니다.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <Tabs
          tabs={TABS}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="default"
          fullWidth
        />
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Tab 1: Weekly Changes */}
        {activeTab === 'weekly' && (
          <div className="space-y-6">
            {lottoData && lottoData.length > 0 ? (
              <WeeklyChanges data={lottoData} />
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-dark-text-secondary">
                데이터를 불러오는 중입니다...
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Trend Analysis */}
        {activeTab === 'trend' && (
          <div className="space-y-6">
            {lottoData && lottoData.length > 0 ? (
              <TrendChart data={lottoData} />
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-dark-text-secondary">
                데이터를 불러오는 중입니다...
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Heatmap */}
        {activeTab === 'heatmap' && (
          <div className="space-y-6">
            {lottoData && lottoData.length > 0 ? (
              <HeatmapChart data={lottoData} />
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-dark-text-secondary">
                데이터를 불러오는 중입니다...
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Full Statistics (existing content) */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Statistics Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <StatisticsCards />
            </motion.div>

            {/* AI Performance + Number Pattern */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="grid grid-cols-1 xl:grid-cols-2 gap-8"
            >
              <AIPerformancePanel />
              <NumberPatternChart />
            </motion.div>

            {/* Gamification Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-1">
                <UserEngagementPanel />
              </div>
              <div className="lg:col-span-1">
                <TrendAlerts statistics={statistics || []} />
              </div>
              <div className="lg:col-span-1">
                <PersonalizedInsights statistics={statistics || []} />
              </div>
            </motion.div>

            {/* Insights Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800"
            >
              <h3 className="text-lg font-bold text-indigo-800 dark:text-indigo-300 mb-4 flex items-center">
                <span className="mr-2">🎯</span>
                종합 분석 인사이트
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                <div className="space-y-2">
                  <h4 className="font-semibold text-indigo-700 dark:text-indigo-400">실시간 통계</h4>
                  <ul className="text-indigo-600 dark:text-indigo-300/80 space-y-1">
                    <li>핫/콜드 번호 실시간 추적</li>
                    <li>AI 신뢰도 지수 모니터링</li>
                    <li>전체 회차 완전 분석</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-indigo-700 dark:text-indigo-400">패턴 분석</h4>
                  <ul className="text-indigo-600 dark:text-indigo-300/80 space-y-1">
                    <li>구간별 출현 분포 분석</li>
                    <li>홀짝 비율 모니터링</li>
                    <li>Top 10 빈도 순위</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-indigo-700 dark:text-indigo-400">AI 성능</h4>
                  <ul className="text-indigo-600 dark:text-indigo-300/80 space-y-1">
                    <li>예측 적중률 투명 공개</li>
                    <li>패턴 감지 정확도</li>
                    <li>실제 데이터 기반 검증</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-indigo-200 dark:border-indigo-700">
                <p className="text-indigo-700 dark:text-indigo-300 font-medium text-center">
                  모든 분석은 실제 로또 데이터를 기반으로 하며, 투명하고 신뢰할 수 있는 정보를 제공합니다
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Dashboard Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="text-center py-4"
      >
        <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">
          대시보드는 매주 새 회차 데이터가 추가될 때마다 자동으로 업데이트됩니다
        </p>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;
