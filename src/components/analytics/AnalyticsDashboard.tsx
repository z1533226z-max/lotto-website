'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { RefreshCw, TrendingUp, Map, BarChart3, ClipboardList, Flame, Snowflake, Clock, CircleDot, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Tabs from '@/components/ui/Tabs';
import StatisticsCards from './StatisticsCards';
import NumberPatternChart from './NumberPatternChart';
import WeeklyChanges from './WeeklyChanges';
import TrendChart from './TrendChart';
import HeatmapChart from './HeatmapChart';
import TrendAlerts from '@/components/gamification/TrendAlerts';
import type { NumberStatistics, LottoResult } from '@/types/lotto';

interface AnalyticsDashboardProps {
  className?: string;
}

const TABS = [
  { id: 'weekly', label: '이번 주 변화', icon: <RefreshCw className="w-4 h-4" /> },
  { id: 'trend', label: '트렌드 분석', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'heatmap', label: '히트맵', icon: <Map className="w-4 h-4" /> },
  { id: 'overview', label: '전체 통계', icon: <BarChart3 className="w-4 h-4" /> },
];

// 데이터 기반 요약 카드
const DataSummary: React.FC<{ statistics: NumberStatistics[]; lottoData: LottoResult[] }> = ({
  statistics,
  lottoData,
}) => {
  if (!statistics || statistics.length === 0) return null;

  const totalFrequency = statistics.reduce((sum, s) => sum + s.frequency, 0);
  const totalRounds = Math.round(totalFrequency / 6);
  const maxRound = Math.max(...statistics.map((s) => s.lastAppeared));
  const avgFrequency = totalFrequency / statistics.length;

  // 가장 핫한 번호 5개
  const hotTop5 = [...statistics].sort((a, b) => b.frequency - a.frequency).slice(0, 5);
  // 가장 콜드한 번호 5개
  const coldTop5 = [...statistics].sort((a, b) => a.frequency - b.frequency).slice(0, 5);
  // 장기 미출현 (10회차+)
  const longAbsent = statistics
    .filter((s) => maxRound - s.lastAppeared >= 10)
    .sort((a, b) => (maxRound - b.lastAppeared) - (maxRound - a.lastAppeared));

  // 홀짝 비율
  const oddFreq = statistics.filter((s) => s.number % 2 === 1).reduce((sum, s) => sum + s.frequency, 0);
  const oddPct = Math.round((oddFreq / totalFrequency) * 100);

  // 최근 회차 (rawData에서)
  const latestRound = lottoData.length > 0 ? lottoData[0] : null;

  return (
    <div className="space-y-4">
      {/* 데이터 기반 요약 */}
      <div
        className="rounded-xl p-5 border"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <h3 className="text-base font-bold mb-4 flex items-center" style={{ color: 'var(--text)' }}>
          <ClipboardList className="w-5 h-5 inline-block mr-2" />
          데이터 요약
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: '#D36135' }}>
              {totalRounds.toLocaleString()}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              분석 회차
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: '#3E5641' }}>
              {maxRound.toLocaleString()}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              최신 회차
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              {oddPct}:{100 - oddPct}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              홀짝 비율
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              {Math.round(avgFrequency)}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              번호당 평균 출현
            </div>
          </div>
        </div>
      </div>

      {/* 핫 / 콜드 / 장기미출현 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 핫넘버 TOP 5 */}
        <div
          className="rounded-xl p-4 border"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <h4 className="text-sm font-bold mb-3 flex items-center" style={{ color: 'var(--text)' }}>
            <Flame className="w-4 h-4 inline-block mr-1" /> 핫넘버 TOP 5
          </h4>
          <div className="space-y-2">
            {hotTop5.map((s, i) => (
              <div key={s.number} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold w-5 text-center"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {i + 1}
                  </span>
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: '#D36135' }}
                  >
                    {s.number}
                  </span>
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {s.frequency}회
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 콜드넘버 TOP 5 */}
        <div
          className="rounded-xl p-4 border"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <h4 className="text-sm font-bold mb-3 flex items-center" style={{ color: 'var(--text)' }}>
            <Snowflake className="w-4 h-4 inline-block mr-1" /> 콜드넘버 TOP 5
          </h4>
          <div className="space-y-2">
            {coldTop5.map((s, i) => (
              <div key={s.number} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold w-5 text-center"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {i + 1}
                  </span>
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: '#3B82F6' }}
                  >
                    {s.number}
                  </span>
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {s.frequency}회
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 장기 미출현 */}
        <div
          className="rounded-xl p-4 border"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <h4 className="text-sm font-bold mb-3 flex items-center" style={{ color: 'var(--text)' }}>
            <Clock className="w-4 h-4 inline-block mr-1" /> 장기 미출현
          </h4>
          {longAbsent.length > 0 ? (
            <div className="space-y-2">
              {longAbsent.slice(0, 5).map((s, i) => (
                <div key={s.number} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-bold w-5 text-center"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {i + 1}
                    </span>
                    <span
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border"
                      style={{
                        color: 'var(--text)',
                        borderColor: 'var(--border)',
                        backgroundColor: 'var(--surface-hover)',
                      }}
                    >
                      {s.number}
                    </span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {maxRound - s.lastAppeared}회차 전
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              10회차 이상 미출현 번호 없음
            </p>
          )}
        </div>
      </div>

      {/* 최근 당첨번호 */}
      {latestRound && (
        <div
          className="rounded-xl p-4 border"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold flex items-center" style={{ color: 'var(--text)' }}>
              <CircleDot className="w-4 h-4 inline-block mr-1" /> {latestRound.round}회 당첨번호
              <span className="ml-2 text-xs font-normal" style={{ color: 'var(--text-tertiary)' }}>
                {latestRound.drawDate}
              </span>
            </h4>
            <Link
              href="/lotto/recent"
              className="text-xs font-medium transition-opacity hover:opacity-80"
              style={{ color: '#D36135' }}
            >
              전체 보기 →
            </Link>
          </div>
          <div className="flex items-center gap-2 mt-3">
            {latestRound.numbers.map((n: number) => {
              const bgColor =
                n <= 10
                  ? '#FFC107'
                  : n <= 20
                    ? '#2196F3'
                    : n <= 30
                      ? '#FF5722'
                      : n <= 40
                        ? '#9E9E9E'
                        : '#4CAF50';
              return (
                <span
                  key={n}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: bgColor }}
                >
                  {n}
                </span>
              );
            })}
            <span className="text-sm mx-1" style={{ color: 'var(--text-tertiary)' }}>
              +
            </span>
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2"
              style={{
                color: 'var(--text)',
                borderColor: 'var(--border)',
                backgroundColor: 'var(--surface-hover)',
              }}
            >
              {latestRound.bonusNumber}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

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

      try {
        setIsLoadingStats(true);
        setStatsError(null);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch('/api/lotto/statistics', {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
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

        if (!Array.isArray(statsData) || statsData.length !== 45) {
          throw new Error('통계 데이터가 유효하지 않습니다');
        }

        setStatistics(statsData);

        if (Array.isArray(rawData) && rawData.length > 0) {
          setLottoData(rawData);
        }

        setTimeout(() => setDashboardReady(true), 200);

        const loadTime = Date.now() - loadStartTime;
        console.log(`AnalyticsDashboard: 초기화 완료 (${loadTime}ms), ${rawData?.length || 0}회차`);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          setStatsError('대시보드 로딩 시간이 초과되었습니다');
        } else {
          setStatsError(error instanceof Error ? error.message : '알 수 없는 오류');
        }
        setDashboardReady(true);
      } finally {
        setIsLoadingStats(false);
      }
    };

    initializeDashboard();
  }, []);

  // Loading state
  if (isLoadingStats || !dashboardReady) {
    return (
      <div className={`min-h-[50vh] flex flex-col items-center justify-center ${className}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-4"
        >
          <LoadingSpinner size="lg" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
              분석 대시보드 준비 중
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              전체 회차 데이터를 분석하고 있습니다...
            </p>
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
        <h2
          className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2"
        >
          AI 분석 대시보드
        </h2>
        <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
          매주 업데이트되는 동적 통계 분석
        </p>

        <div className="flex justify-center items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${hasError ? 'bg-orange-500' : 'bg-green-500'}`} />
            <span className={hasError ? 'text-orange-600' : 'text-green-600 dark:text-green-400'}>
              {hasError ? '일부 기능 제한' : '정상'}
            </span>
          </div>
          <div className="text-[var(--text-tertiary)]">|</div>
          <div className="text-[var(--text-tertiary)]">
            {new Date().toLocaleDateString('ko-KR')} 기준
          </div>
        </div>
      </motion.div>

      {/* Error Alert */}
      {hasError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mx-auto max-w-2xl"
        >
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
            <div>
              <p className="text-orange-800 dark:text-orange-300 font-medium text-sm">
                데이터 로딩 지연
              </p>
              <p className="text-orange-600 dark:text-orange-400 text-xs mt-1">{statsError}</p>
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
        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} variant="default" fullWidth />
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
              <div className="text-center py-12 text-[var(--text-secondary)]">
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
              <div className="text-center py-12 text-[var(--text-secondary)]">
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
              <div className="text-center py-12 text-[var(--text-secondary)]">
                데이터를 불러오는 중입니다...
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Full Statistics - REBUILT */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* 핵심 지표 카드 (핫넘버/콜드넘버/AI적중 실적) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <StatisticsCards />
            </motion.div>

            {/* 번호 출현 패턴 차트 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <NumberPatternChart />
            </motion.div>

            {/* 트렌드 알림 */}
            {statistics && statistics.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <TrendAlerts statistics={statistics} />
              </motion.div>
            )}

            {/* 데이터 기반 요약 (핫/콜드 TOP5, 장기미출현, 최근 당첨번호) */}
            {statistics && statistics.length > 0 && lottoData && lottoData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <DataSummary statistics={statistics} lottoData={lottoData} />
              </motion.div>
            )}
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
        <p className="text-xs text-[var(--text-tertiary)]">
          매주 토요일 추첨 후 자동 업데이트 · 1회~최신 회차 전체 데이터 분석
        </p>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;
