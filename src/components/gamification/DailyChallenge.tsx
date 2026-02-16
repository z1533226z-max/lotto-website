'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import type { DailyChallenge as DailyChallengeType } from '@/hooks/useUserProgress';

// ─── Props ─────────────────────────────────────────────────

interface DailyChallengeProps {
  challenge: DailyChallengeType;
  streak: number;
  className?: string;
}

// ─── Component ─────────────────────────────────────────────

const DailyChallenge: React.FC<DailyChallengeProps> = ({
  challenge,
  streak,
  className,
}) => {
  return (
    <Card variant="default" padding="none" className={cn('overflow-hidden', className)}>
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">{'\uD83C\uDFAF'}</span>
            <h4
              className="text-sm font-bold"
              style={{ color: 'var(--text, #1f2937)' }}
            >
              오늘의 도전
            </h4>
          </div>

          {/* Streak badge */}
          {streak > 0 && (
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold'
              )}
              style={{
                background: streak >= 7
                  ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
                  : 'var(--border, #e5e7eb)',
                color: streak >= 7 ? '#ffffff' : 'var(--text, #1f2937)',
              }}
            >
              <span>{'\uD83D\uDD25'}</span>
              <span>{streak}일 연속</span>
            </div>
          )}
        </div>

        {/* Challenge details */}
        <div
          className={cn(
            'flex items-center gap-3 p-3 rounded-lg',
            challenge.completed && 'ring-1 ring-green-300'
          )}
          style={{
            background: challenge.completed
              ? 'rgba(34, 197, 94, 0.08)'
              : 'var(--surface, #f9fafb)',
            borderColor: 'var(--border, #e5e7eb)',
          }}
        >
          {/* Status icon */}
          <div
            className={cn(
              'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm',
              challenge.completed ? 'text-white' : ''
            )}
            style={{
              background: challenge.completed
                ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                : 'var(--border, #e5e7eb)',
            }}
          >
            {challenge.completed ? '\u2713' : '\u2022\u2022\u2022'}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                'text-sm font-semibold',
                challenge.completed && 'line-through opacity-60'
              )}
              style={{ color: 'var(--text, #1f2937)' }}
            >
              {challenge.name}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: 'var(--text, #1f2937)', opacity: 0.55 }}
            >
              {challenge.description}
            </p>
          </div>
        </div>

        {/* Reward hint */}
        <div
          className="mt-2.5 flex items-center justify-between text-xs"
          style={{ color: 'var(--text, #1f2937)', opacity: 0.5 }}
        >
          <span>
            {challenge.completed
              ? '오늘의 도전을 완료했습니다!'
              : '도전을 완료하면 연속 방문 보너스!'}
          </span>
          {!challenge.completed && streak >= 3 && (
            <span
              className="font-medium"
              style={{ color: '#f59e0b', opacity: 1 }}
            >
              배지 힌트: 꾸준히 방문하세요
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default DailyChallenge;
