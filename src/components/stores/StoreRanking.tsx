'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

interface RankingStore {
  store_name: string;
  store_address: string;
  region: string;
  sub_region: string;
  win_count: number;
  last_round: number;
  rounds: number[];
}

interface StoreRankingProps {
  ranking: RankingStore[];
  page: number;
  limit: number;
  className?: string;
}

const StoreRanking: React.FC<StoreRankingProps> = ({ ranking, page, limit, className }) => {
  if (ranking.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--text-secondary)]">
        랭킹 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {ranking.map((store, index) => {
        const globalRank = (page - 1) * limit + index + 1;
        const isTop3 = globalRank <= 3;
        const medalEmoji = globalRank === 1 ? '🥇' : globalRank === 2 ? '🥈' : globalRank === 3 ? '🥉' : null;

        return (
          <div
            key={`${store.store_name}-${store.store_address}`}
            className={cn(
              'rounded-xl p-4 sm:p-5',
              'bg-[var(--surface)] border border-[var(--border)]',
              'transition-all duration-300',
              'hover:-translate-y-0.5 hover:shadow-lg',
              isTop3 && 'border-primary/30 dark:border-primary/20',
              globalRank === 1 && 'bg-gradient-to-r from-yellow-500/5 to-transparent'
            )}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              {/* 순위 */}
              <div className={cn(
                'flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-bold text-lg',
                isTop3
                  ? 'bg-primary/10 text-primary'
                  : 'bg-[var(--surface-hover)] text-[var(--text-secondary)]'
              )}>
                {medalEmoji || globalRank}
              </div>

              {/* 정보 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <h3 className="text-base font-bold text-[var(--text)] truncate">
                    {store.store_name}
                  </h3>
                  <Badge variant="primary" size="sm">
                    {store.win_count}회 당첨
                  </Badge>
                </div>

                <p className="text-sm text-[var(--text-secondary)] mb-2 line-clamp-1">
                  📍 {store.store_address || '주소 정보 없음'}
                </p>

                {/* 당첨 회차 목록 */}
                <div className="flex flex-wrap gap-1">
                  {store.rounds.slice(0, 8).map((round) => (
                    <span
                      key={round}
                      className="text-xs px-1.5 py-0.5 rounded bg-[var(--surface-hover)] text-[var(--text-tertiary)]"
                    >
                      {round}회
                    </span>
                  ))}
                  {store.rounds.length > 8 && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--surface-hover)] text-[var(--text-tertiary)]">
                      +{store.rounds.length - 8}
                    </span>
                  )}
                </div>
              </div>

              {/* 지역 */}
              <div className="flex-shrink-0 text-right">
                <Badge variant="default" size="sm">
                  {store.region}
                </Badge>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">
                  최근 {store.last_round}회
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StoreRanking;
