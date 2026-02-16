'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { RegionStats as RegionStatsType } from '@/types/database';

interface RegionStatsProps {
  stats: RegionStatsType[];
  className?: string;
}

const RegionStats: React.FC<RegionStatsProps> = ({ stats, className }) => {
  const maxCount = useMemo(() => {
    return Math.max(...stats.map(s => s.count), 1);
  }, [stats]);

  if (stats.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-secondary)]">
        지역별 통계 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-lg font-bold text-[var(--text)] mb-4">
        🗺️ 지역별 당첨 통계
      </h3>

      {stats.map((stat) => {
        const percentage = (stat.count / maxCount) * 100;

        return (
          <div key={stat.region} className="group">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium text-[var(--text)]">
                {stat.region}
              </span>
              <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                <span className="text-xs">
                  🥇 {stat.firstPrizeCount}
                </span>
                <span className="text-xs">
                  🥈 {stat.secondPrizeCount}
                </span>
                <span className="font-semibold text-[var(--text)]">
                  {stat.count}건
                </span>
              </div>
            </div>

            <div className="w-full h-6 bg-[var(--surface-hover)] rounded-full overflow-hidden dark:bg-dark-surface-hover">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500 ease-out',
                  'bg-gradient-to-r from-primary to-primary-300',
                  'group-hover:from-primary-500 group-hover:to-primary-200',
                  'relative'
                )}
                style={{ width: `${percentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20 rounded-full" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RegionStats;
