'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import { useAuthSafe } from '@/components/providers/AuthProvider';

// ─── Types ──────────────────────────────────────────────────

interface LeaderboardEntry {
  nickname: string;
  longest_streak: number;
  badge_count: number;
  rank: number;
}

// ─── Component ──────────────────────────────────────────────

interface LeaderboardWidgetProps {
  className?: string;
}

const LeaderboardWidget: React.FC<LeaderboardWidgetProps> = ({ className }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = useAuthSafe();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
    try {
      const res = await fetch('/api/user/leaderboard');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setEntries(data.leaderboard || []);
        }
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }

  const rankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '\uD83E\uDD47'; // 🥇
      case 2: return '\uD83E\uDD48'; // 🥈
      case 3: return '\uD83E\uDD49'; // 🥉
      default: return `${rank}`;
    }
  };

  return (
    <Card variant="default" padding="none" className={cn('overflow-hidden', className)}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">{'\uD83C\uDFC6'}</span>
          <h4
            className="text-sm font-bold"
            style={{ color: 'var(--text, #1f2937)' }}
          >
            리더보드
          </h4>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 rounded-lg animate-pulse"
                style={{ background: 'var(--border, #e5e7eb)' }}
              />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div
            className="text-center py-6 text-sm"
            style={{ color: 'var(--text, #1f2937)', opacity: 0.5 }}
          >
            <p>아직 참여자가 없습니다</p>
            <p className="text-xs mt-1">회원가입하면 리더보드에 참여할 수 있어요!</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {entries.slice(0, 10).map((entry) => {
              const isMe = auth?.user?.nickname === entry.nickname;
              return (
                <div
                  key={entry.rank}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200',
                  )}
                  style={{
                    background: isMe
                      ? 'rgba(255, 107, 53, 0.08)'
                      : entry.rank <= 3
                        ? 'var(--surface, #f9fafb)'
                        : 'transparent',
                    border: isMe ? '1px solid rgba(255, 107, 53, 0.3)' : undefined,
                  }}
                >
                  {/* Rank */}
                  <span className={cn(
                    'flex-shrink-0 w-7 text-center',
                    entry.rank <= 3 ? 'text-base' : 'text-xs font-bold',
                  )} style={{ opacity: entry.rank <= 3 ? 1 : 0.5 }}>
                    {rankEmoji(entry.rank)}
                  </span>

                  {/* Nickname */}
                  <span
                    className={cn(
                      'flex-1 text-sm truncate',
                      entry.rank <= 3 ? 'font-bold' : 'font-medium',
                      isMe && 'text-primary',
                    )}
                    style={{ color: isMe ? undefined : 'var(--text, #1f2937)' }}
                  >
                    {entry.nickname}
                    {isMe && <span className="text-xs ml-1" style={{ opacity: 0.6 }}>(나)</span>}
                  </span>

                  {/* Stats */}
                  <div className="flex items-center gap-2 text-xs flex-shrink-0">
                    <span
                      className="flex items-center gap-0.5"
                      style={{ color: 'var(--text, #1f2937)', opacity: 0.6 }}
                      title="최장 연속 방문"
                    >
                      {'\uD83D\uDD25'} {entry.longest_streak}
                    </span>
                    <span
                      className="flex items-center gap-0.5"
                      style={{ color: 'var(--text, #1f2937)', opacity: 0.6 }}
                      title="획득 배지"
                    >
                      {'\uD83C\uDFC5'} {entry.badge_count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA for non-members */}
        {!auth?.user && !auth?.isLoading && (
          <button
            onClick={() => auth?.openAuthModal()}
            className={cn(
              'w-full mt-3 py-2 rounded-lg text-xs font-semibold',
              'transition-all duration-200 hover:opacity-90',
            )}
            style={{
              background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
              color: '#fff',
            }}
          >
            회원가입하고 리더보드 참여하기
          </button>
        )}
      </div>
    </Card>
  );
};

export default LeaderboardWidget;
