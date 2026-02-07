'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import StatisticsCards from './StatisticsCards';
import AIPerformancePanel from './AIPerformancePanel';
import NumberPatternChart from './NumberPatternChart';
import UserEngagementPanel from '@/components/gamification/UserEngagementPanel';
import TrendAlerts from '@/components/gamification/TrendAlerts';
import PersonalizedInsights from '@/components/gamification/PersonalizedInsights';
import type { NumberStatistics } from '@/types/lotto';

interface AnalyticsDashboardProps {
  className?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className }) => {
  // 통계 데이터 상태 (중앙 집중식 관리)
  const [statistics, setStatistics] = useState<NumberStatistics[] | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [dashboardReady, setDashboardReady] = useState(false);

  // 대시보드 초기화 및 통계 데이터 로딩
  useEffect(() => {
    const initializeDashboard = async () => {
      const loadStartTime = Date.now();
      console.time('Analytics Dashboard Loading');
      
      try {
        setIsLoadingStats(true);
        setStatsError(null);
        
        console.log('AnalyticsDashboard: 대시보드 초기화 시작...');
        
        // 통계 API 호출 (NumberGenerator와 동일한 패턴)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15초 타임아웃
        
        const response = await fetch('/api/lotto/statistics', {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: API 호출 실패`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'API 응답 오류');
        }
        
        const { statistics: statsData } = result.data;
        
        // 데이터 유효성 확인
        if (!Array.isArray(statsData) || statsData.length !== 45) {
          throw new Error('통계 데이터가 유효하지 않습니다');
        }
        
        setStatistics(statsData);
        
        const loadEndTime = Date.now();
        const loadTime = loadEndTime - loadStartTime;
        
        // 대시보드 준비 완료 (애니메이션을 위한 지연)
        setTimeout(() => {
          setDashboardReady(true);
        }, 200);
        
        console.log(`AnalyticsDashboard: 초기화 완료 (${loadTime}ms)`);
        console.log(`대시보드 구성: StatisticsCards, AIPerformancePanel, NumberPatternChart`);
        
      } catch (error) {
        const loadEndTime = Date.now();
        const loadTime = loadEndTime - loadStartTime;
        
        if (error instanceof Error && error.name === 'AbortError') {
          console.error(`AnalyticsDashboard: 초기화 타임아웃 (${loadTime}ms)`);
          setStatsError('대시보드 로딩 시간이 초과되었습니다');
        } else {
          console.error(`AnalyticsDashboard: 초기화 실패 (${loadTime}ms):`, error);
          setStatsError(error instanceof Error ? error.message : '알 수 없는 오류');
        }
        
        // 에러 상태에서도 대시보드는 표시 (각 컴포넌트가 개별 처리)
        setDashboardReady(true);
        
      } finally {
        setIsLoadingStats(false);
        console.timeEnd('Analytics Dashboard Loading');
      }
    };
    
    initializeDashboard();
  }, []);

  // 로딩 상태
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
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-800">📊 AI 분석 대시보드 준비 중</h3>
            <p className="text-gray-600">전체 회차 데이터를 종합 분석하고 있습니다...</p>
            <div className="flex justify-center space-x-2 text-sm text-gray-500">
              <span>• 실시간 통계 카드</span>
              <span>• AI 성능 검증</span>
              <span>• 패턴 차트</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // 에러 상태 (하지만 대시보드는 계속 표시)
  const hasError = statsError !== null;

  return (
    <div className={`space-y-8 ${className}`}>
      {/* 대시보드 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
          📊 AI 분석 대시보드
        </h2>
        <p className="text-gray-600 mb-2">
          역대 전체 회차 데이터 기반 종합 분석 결과
        </p>
        
        {/* 대시보드 상태 표시 */}
        <div className="flex justify-center items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${hasError ? 'bg-orange-500' : 'bg-green-500'}`} />
            <span className={`${hasError ? 'text-orange-600' : 'text-green-600'}`}>
              {hasError ? '일부 기능 제한' : '모든 시스템 정상'}
            </span>
          </div>
          <div className="text-gray-400">|</div>
          <div className="text-gray-500">
            마지막 업데이트: {new Date().toLocaleDateString('ko-KR')}
          </div>
        </div>
      </motion.div>

      {/* 에러 알림 (있을 경우) */}
      {hasError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-orange-50 border border-orange-200 rounded-lg p-4 mx-auto max-w-2xl"
        >
          <div className="flex items-center">
            <span className="text-orange-500 mr-2">⚠️</span>
            <div>
              <p className="text-orange-800 font-medium">일부 데이터 로딩 지연</p>
              <p className="text-orange-600 text-sm mt-1">
                {statsError} - 각 분석 모듈이 개별적으로 데이터를 처리 중입니다.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* 상단 통계 카드들 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <StatisticsCards />
      </motion.div>

      {/* 메인 분석 패널들 - 2열 그리드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="grid grid-cols-1 xl:grid-cols-2 gap-8"
      >
        {/* AI 성능 검증 패널 */}
        <AIPerformancePanel />
        
        {/* 번호 패턴 차트 */}
        <NumberPatternChart />
      </motion.div>

      {/* 게임화 및 개인화 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* 사용자 참여 패널 */}
        <div className="lg:col-span-1">
          <UserEngagementPanel />
        </div>
        
        {/* 트렌드 알림 */}
        <div className="lg:col-span-1">
          <TrendAlerts statistics={statistics || []} />
        </div>
        
        {/* 개인화된 분석 */}
        <div className="lg:col-span-1">
          <PersonalizedInsights statistics={statistics || []} />
        </div>
      </motion.div>

      {/* 대시보드 요약 및 인사이트 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200"
      >
        <h3 className="text-lg font-bold text-indigo-800 mb-4 flex items-center">
          <span className="mr-2">🎯</span>
          종합 분석 인사이트
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
          <div className="space-y-2">
            <h4 className="font-semibold text-indigo-700">🔥 실시간 통계</h4>
            <ul className="text-indigo-600 space-y-1">
              <li>• 핫/콜드 번호 실시간 추적</li>
              <li>• AI 신뢰도 지수 모니터링</li>
              <li>• 전체 회차 완전 분석</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-indigo-700">📊 패턴 분석</h4>
            <ul className="text-indigo-600 space-y-1">
              <li>• 구간별 출현 분포 분석</li>
              <li>• 홀짝 비율 모니터링</li>
              <li>• Top 10 빈도 순위</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-indigo-700">🤖 AI 성능</h4>
            <ul className="text-indigo-600 space-y-1">
              <li>• 예측 적중률 투명 공개</li>
              <li>• 패턴 감지 정확도</li>
              <li>• 실제 데이터 기반 검증</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-indigo-200">
          <p className="text-indigo-700 font-medium text-center">
            ✨ 모든 분석은 실제 로또 데이터를 기반으로 하며, 투명하고 신뢰할 수 있는 정보를 제공합니다
          </p>
        </div>
      </motion.div>

      {/* 대시보드 푸터 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="text-center py-4"
      >
        <p className="text-xs text-gray-500">
          📈 대시보드는 실시간으로 업데이트되며, 새로운 회차 데이터가 추가될 때마다 자동으로 분석됩니다
        </p>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;