'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import type { WinningStore } from '@/types/database';

interface StoreCardProps {
  store: WinningStore;
  className?: string;
}

const rankStyles = {
  1: {
    badge: 'primary' as const,
    label: '1등',
    glow: 'shadow-glow',
  },
  2: {
    badge: 'secondary' as const,
    label: '2등',
    glow: 'shadow-glow-secondary',
  },
};

const purchaseTypeStyles = {
  '자동': 'success' as const,
  '수동': 'warning' as const,
  '반자동': 'info' as const,
};

const StoreCard: React.FC<StoreCardProps> = ({ store, className }) => {
  const rankStyle = rankStyles[store.rank as 1 | 2] || rankStyles[2];

  return (
    <div
      className={cn(
        'rounded-xl p-4 sm:p-5',
        'bg-[var(--surface)] border border-[var(--border)]',
        'transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-lg',
        'dark:bg-dark-surface dark:border-dark-border',
        store.rank === 1 && 'border-primary/30 dark:border-primary/20',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={rankStyle.badge} size="sm">
              {rankStyle.label}
            </Badge>
            <Badge variant={purchaseTypeStyles[store.purchase_type]} size="sm">
              {store.purchase_type}
            </Badge>
          </div>

          <h3 className="text-base font-bold text-[var(--text)] truncate mb-1">
            {store.store_name}
          </h3>

          <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
            📍 {store.store_address || '주소 정보 없음'}
          </p>
        </div>

        <div className="flex-shrink-0 text-right">
          <span className="text-xs text-[var(--text-tertiary)]">
            {store.round}회
          </span>
          <div className="mt-1">
            <Badge variant="default" size="sm">
              {store.region}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreCard;
