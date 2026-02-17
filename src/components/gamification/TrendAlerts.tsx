'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Snowflake, Zap, Clock, BarChart3, Scale, Bell, TrendingUp, TrendingDown, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import type { NumberStatistics } from '@/types/lotto';

interface TrendAlert {
  id: string;
  type: 'hot' | 'cold' | 'rising' | 'falling' | 'pattern' | 'streak';
  title: string;
  description: string;
  numbers: number[];
  severity: 'low' | 'medium' | 'high';
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface TrendAlertsProps {
  statistics: NumberStatistics[];
  className?: string;
}

const TrendAlerts: React.FC<TrendAlertsProps> = ({ statistics, className }) => {
  
  // 트렌드 알림 생성 로직
  const trendAlerts = useMemo<TrendAlert[]>(() => {
    if (!statistics || statistics.length === 0) {
      return [];
    }

    const alerts: TrendAlert[] = [];
    
    // 빈도 기반 분석
    const sortedByFrequency = [...statistics].sort((a, b) => b.frequency - a.frequency);
    const highestFreq = sortedByFrequency[0]?.frequency || 0;
    const lowestFreq = sortedByFrequency[sortedByFrequency.length - 1]?.frequency || 0;
    const avgFrequency = statistics.reduce((sum, stat) => sum + stat.frequency, 0) / statistics.length;

    // 1. 핫 번호 알림 (상위 3개 고빈도 번호)
    const hotNumbers = sortedByFrequency.slice(0, 3).filter(stat => stat.frequency > avgFrequency * 1.2);
    if (hotNumbers.length > 0) {
      alerts.push({
        id: 'hot-numbers',
        type: 'hot',
        title: '핫넘버 감지',
        description: `${hotNumbers.map(n => n.number).join(', ')}번이 평균보다 ${Math.round(((hotNumbers[0].frequency / avgFrequency) - 1) * 100)}% 더 자주 출현`,
        numbers: hotNumbers.map(n => n.number),
        severity: hotNumbers[0].frequency > avgFrequency * 1.5 ? 'high' : 'medium',
        icon: <Flame className="w-5 h-5" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800'
      });
    }

    // 2. 콜드 번호 알림 (하위 3개 저빈도 번호)
    const coldNumbers = sortedByFrequency.slice(-3).filter(stat => stat.frequency < avgFrequency * 0.8);
    if (coldNumbers.length > 0) {
      alerts.push({
        id: 'cold-numbers',
        type: 'cold',
        title: '콜드넘버 주의',
        description: `${coldNumbers.map(n => n.number).join(', ')}번이 평균보다 ${Math.round((1 - (coldNumbers[0].frequency / avgFrequency)) * 100)}% 적게 출현`,
        numbers: coldNumbers.map(n => n.number),
        severity: coldNumbers[0].frequency < avgFrequency * 0.6 ? 'high' : 'medium',
        icon: <Snowflake className="w-5 h-5" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800'
      });
    }

    // 3. 최근 출현 패턴 분석
    const maxRound = Math.max(...statistics.map(s => s.lastAppeared));
    const recentlyAppeared = statistics.filter(stat => 
      maxRound - stat.lastAppeared <= 3 && stat.consecutiveCount >= 2
    );
    
    if (recentlyAppeared.length > 0) {
      alerts.push({
        id: 'recent-streak',
        type: 'streak',
        title: '연속 출현 감지',
        description: `${recentlyAppeared.map(n => n.number).join(', ')}번이 최근 ${recentlyAppeared[0].consecutiveCount}회 연속 출현`,
        numbers: recentlyAppeared.map(n => n.number),
        severity: recentlyAppeared[0].consecutiveCount >= 3 ? 'high' : 'medium',
        icon: <Zap className="w-5 h-5" />,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800'
      });
    }

    // 4. 장기 미출현 번호
    const longAbsent = statistics.filter(stat => maxRound - stat.lastAppeared > 10);
    if (longAbsent.length > 0) {
      const sortedAbsent = longAbsent.sort((a, b) => (maxRound - b.lastAppeared) - (maxRound - a.lastAppeared));
      const topAbsent = sortedAbsent.slice(0, 3);
      
      alerts.push({
        id: 'long-absent',
        type: 'rising',
        title: '장기 미출현',
        description: `${topAbsent.map(n => n.number).join(', ')}번이 ${maxRound - topAbsent[0].lastAppeared}회차 동안 미출현`,
        numbers: topAbsent.map(n => n.number),
        severity: (maxRound - topAbsent[0].lastAppeared) > 20 ? 'high' : 'medium',
        icon: <Clock className="w-5 h-5" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        borderColor: 'border-purple-200 dark:border-purple-800'
      });
    }

    // 5. 구간별 패턴 분석
    const sections = {
      '1-10': statistics.filter(s => s.number >= 1 && s.number <= 10),
      '11-20': statistics.filter(s => s.number >= 11 && s.number <= 20),
      '21-30': statistics.filter(s => s.number >= 21 && s.number <= 30),
      '31-40': statistics.filter(s => s.number >= 31 && s.number <= 40),
      '41-45': statistics.filter(s => s.number >= 41 && s.number <= 45)
    };

    const sectionFreqs = Object.entries(sections).map(([range, nums]) => ({
      range,
      avgFreq: nums.reduce((sum, n) => sum + n.frequency, 0) / nums.length,
      numbers: nums.length
    }));

    const dominantSection = sectionFreqs.reduce((max, current) => 
      current.avgFreq > max.avgFreq ? current : max
    );

    if (dominantSection.avgFreq > avgFrequency * 1.3) {
      alerts.push({
        id: 'section-dominance',
        type: 'pattern',
        title: '구간 편중 패턴',
        description: `${dominantSection.range} 구간이 다른 구간보다 ${Math.round(((dominantSection.avgFreq / avgFrequency) - 1) * 100)}% 더 활발`,
        numbers: sections[dominantSection.range as keyof typeof sections].map(n => n.number),
        severity: dominantSection.avgFreq > avgFrequency * 1.5 ? 'high' : 'medium',
        icon: <BarChart3 className="w-5 h-5" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800'
      });
    }

    // 6. 홀짝 균형 분석
    const oddNumbers = statistics.filter(s => s.number % 2 === 1);
    const evenNumbers = statistics.filter(s => s.number % 2 === 0);
    const oddAvgFreq = oddNumbers.reduce((sum, n) => sum + n.frequency, 0) / oddNumbers.length;
    const evenAvgFreq = evenNumbers.reduce((sum, n) => sum + n.frequency, 0) / evenNumbers.length;
    
    const imbalanceRatio = Math.abs(oddAvgFreq - evenAvgFreq) / Math.min(oddAvgFreq, evenAvgFreq);
    
    if (imbalanceRatio > 0.2) {
      const dominant = oddAvgFreq > evenAvgFreq ? '홀수' : '짝수';
      const dominantPercent = Math.round(imbalanceRatio * 100);
      
      alerts.push({
        id: 'odd-even-imbalance',
        type: 'pattern',
        title: '홀짝 불균형',
        description: `${dominant} 번호가 ${dominantPercent}% 더 자주 출현하는 패턴 감지`,
        numbers: dominant === '홀수' ? oddNumbers.map(n => n.number) : evenNumbers.map(n => n.number),
        severity: imbalanceRatio > 0.3 ? 'high' : 'medium',
        icon: <Scale className="w-5 h-5" />,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
        borderColor: 'border-indigo-200 dark:border-indigo-800'
      });
    }

    return alerts.slice(0, 5); // 최대 5개 알림만 표시
  }, [statistics]);

  if (!statistics || statistics.length === 0) {
    return (
      <div className={`p-4 rounded-lg border ${className}`} style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <p className="text-[var(--text-tertiary)] text-center">트렌드 분석을 위한 데이터를 로딩 중...</p>
      </div>
    );
  }

  if (trendAlerts.length === 0) {
    return (
      <div className={`p-4 rounded-lg border ${className}`} style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <p className="text-[var(--text-tertiary)] text-center">현재 특별한 트렌드가 감지되지 않았습니다.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-lg font-bold text-[var(--text)] flex items-center mb-4">
        <Bell className="w-5 h-5 mr-2 text-red-500" />
        실시간 트렌드 알림
      </h3>
      
      <AnimatePresence>
        {trendAlerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`p-4 rounded-lg border-l-4 ${alert.bgColor} ${alert.borderColor} ${alert.color}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="flex-shrink-0">{alert.icon}</span>
                  <h4 className="font-bold text-sm">{alert.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    alert.severity === 'high' 
                      ? 'bg-red-100 text-red-800' 
                      : alert.severity === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {alert.severity === 'high' ? '높음' : alert.severity === 'medium' ? '보통' : '낮음'}
                  </span>
                </div>
                
                <p className="text-sm text-[var(--text-secondary)] mb-3">{alert.description}</p>
                
                {/* 관련 번호 표시 */}
                <div className="flex flex-wrap gap-1">
                  {alert.numbers.slice(0, 6).map(number => (
                    <span
                      key={number}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium shadow-sm"
                      style={{ backgroundColor: 'var(--surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', color: 'var(--text)' }}
                    >
                      {number}
                    </span>
                  ))}
                  {alert.numbers.length > 6 && (
                    <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs" style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text-secondary)' }}>
                      +{alert.numbers.length - 6}
                    </span>
                  )}
                </div>
              </div>
              
              {/* 트렌드 화살표 */}
              <div className="ml-4">
                {alert.type === 'hot' && <TrendingUp className="w-6 h-6" />}
                {alert.type === 'cold' && <TrendingDown className="w-6 h-6" />}
                {alert.type === 'rising' && <ArrowUp className="w-6 h-6" />}
                {alert.type === 'falling' && <ArrowDown className="w-6 h-6" />}
                {alert.type === 'pattern' && <RefreshCw className="w-6 h-6" />}
                {alert.type === 'streak' && <Zap className="w-6 h-6" />}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* 업데이트 시간 표시 */}
      <div className="text-center text-xs text-[var(--text-tertiary)] mt-4">
        마지막 업데이트: {new Date().toLocaleString('ko-KR')}
      </div>
    </div>
  );
};

export default TrendAlerts;