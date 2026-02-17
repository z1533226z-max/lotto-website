'use client';

import React, { useMemo } from 'react';
import { CircleDot, Flame, Snowflake, Zap, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { LottoStatisticsAnalyzer } from '@/lib/statisticsAnalyzer';
import type { LottoResult } from '@/types/lotto';

interface WeeklyChangesProps {
  data: LottoResult[];
  className?: string;
}

/** Get ball background color based on lotto number range */
const getBallBg = (num: number): string => {
  if (num <= 10) return 'bg-yellow-400';
  if (num <= 20) return 'bg-blue-500';
  if (num <= 30) return 'bg-red-500';
  if (num <= 40) return 'bg-gray-500';
  return 'bg-green-500';
};

const getBallText = (num: number): string => {
  if (num <= 10) return 'text-gray-900';
  return 'text-white';
};

const NumberBall: React.FC<{ num: number; size?: 'sm' | 'md' }> = ({ num, size = 'sm' }) => {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return (
    <span
      className={cn(
        sizeClass,
        'rounded-full inline-flex items-center justify-center font-bold shadow-sm',
        getBallBg(num),
        getBallText(num)
      )}
    >
      {num}
    </span>
  );
};

const WeeklyChanges: React.FC<WeeklyChangesProps> = ({ data, className }) => {
  const weeklyChanges = useMemo(() => {
    if (!data || data.length === 0) return null;
    return LottoStatisticsAnalyzer.getWeeklyChanges(data);
  }, [data]);

  const windowComparison = useMemo(() => {
    if (!data || data.length < 20) return null;
    return LottoStatisticsAnalyzer.compareWindows(data, 10, 10);
  }, [data]);

  if (!weeklyChanges) {
    return (
      <Card variant="glass" className={className}>
        <div className="text-center py-8 text-[var(--text-secondary)]">
          데이터를 불러오는 중...
        </div>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Latest Round Info */}
      <Card variant="glass">
        <div className="flex items-center gap-2 mb-4">
          <CircleDot className="w-5 h-5" />
          <h3 className="text-lg font-bold text-[var(--text)]">
            {weeklyChanges.latestRound}회차 당첨번호
          </h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {weeklyChanges.newNumbers.map((num) => (
            <NumberBall key={num} num={num} size="md" />
          ))}
          <span className="text-[var(--text-tertiary)] mx-1 text-lg font-light">+</span>
          <div className="relative">
            <NumberBall num={weeklyChanges.bonusNumber} size="md" />
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-[var(--text-tertiary)] whitespace-nowrap">
              보너스
            </span>
          </div>
        </div>
      </Card>

      {/* Hot/Cold Trend Numbers */}
      {windowComparison && (
        <Card variant="glass">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5" />
            <h3 className="text-lg font-bold text-[var(--text)]">
              이번 주 핫넘버 / 콜드넘버
            </h3>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mb-3">
            최근 10회차 vs 이전 10회차 출현 빈도 비교
          </p>

          {/* Hot Numbers */}
          {windowComparison.hotNumbers.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
                상승 트렌드
              </h4>
              <div className="flex flex-wrap gap-2">
                {windowComparison.hotNumbers.slice(0, 7).map((item) => (
                  <div key={item.number} className="flex items-center gap-1">
                    <NumberBall num={item.number} />
                    <Badge variant="danger" size="sm">
                      +{(item.change * 100).toFixed(0)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cold Numbers */}
          {windowComparison.coldNumbers.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                하락 트렌드
              </h4>
              <div className="flex flex-wrap gap-2">
                {windowComparison.coldNumbers.slice(0, 7).map((item) => (
                  <div key={item.number} className="flex items-center gap-1">
                    <NumberBall num={item.number} />
                    <Badge variant="info" size="sm">
                      {(item.change * 100).toFixed(0)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Longest Absent Numbers */}
      <Card variant="glass">
        <div className="flex items-center gap-2 mb-4">
          <Snowflake className="w-5 h-5" />
          <h3 className="text-lg font-bold text-[var(--text)]">
            최장 미출현 번호
          </h3>
        </div>
        <div className="space-y-2">
          {weeklyChanges.longestAbsent.map((item) => (
            <div
              key={item.number}
              className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-b-0"
            >
              <NumberBall num={item.number} />
              <span className="text-sm text-[var(--text-secondary)]">
                <span className="font-semibold text-blue-600 dark:text-blue-400">{item.rounds}회</span> 연속 미출현
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Consecutive Appearances */}
      {weeklyChanges.hottestStreak.length > 0 && (
        <Card variant="glass">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5" />
            <h3 className="text-lg font-bold text-[var(--text)]">
              연속 출현 번호
            </h3>
          </div>
          <div className="space-y-2">
            {weeklyChanges.hottestStreak.map((item) => (
              <div
                key={item.number}
                className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-b-0"
              >
                <NumberBall num={item.number} />
                <span className="text-sm text-[var(--text-secondary)]">
                  <span className="font-semibold text-red-600 dark:text-red-400">{item.consecutiveAppearances}회</span> 연속 출현
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Overdue Predictions */}
      {weeklyChanges.overduePredictions.length > 0 && (
        <Card variant="glass">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5" />
            <h3 className="text-lg font-bold text-[var(--text)]">
              출현 예상 번호
            </h3>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mb-3">
            평균 출현 주기 대비 1.5배 이상 미출현된 번호
          </p>
          <div className="flex flex-wrap gap-2">
            {weeklyChanges.overduePredictions.map((num) => (
              <NumberBall key={num} num={num} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default WeeklyChanges;
