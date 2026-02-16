'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { useUserProgress } from '@/hooks/useUserProgress';
import LottoNumbers from '@/components/lotto/LottoNumbers';
import { cn } from '@/lib/utils';
import { calculateRank, getRankLabel, getRankColor } from '@/lib/lottoUtils';
import type { SavedNumber, NumberStats, NumberSource } from '@/types/database';

// --- Helpers ---

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

function formatJoinDate(dateString: string | undefined): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const SOURCE_LABELS: Record<NumberSource, { emoji: string; label: string; bg: string }> = {
  ai: { emoji: '\uD83E\uDD16', label: 'AI', bg: '#FF6B35' },
  dream: { emoji: '\uD83C\uDF19', label: '\uAFC8', bg: '#8B5CF6' },
  fortune: { emoji: '\uD83C\uDF40', label: '\uD589\uC6B4', bg: '#10B981' },
};

const FILTER_TABS: { key: NumberSource | 'all'; label: string }[] = [
  { key: 'all', label: '\uC804\uCCB4' },
  { key: 'ai', label: '\uD83E\uDD16 AI' },
  { key: 'dream', label: '\uD83C\uDF19 \uAFC8\uBC88\uD638' },
  { key: 'fortune', label: '\uD83C\uDF40 \uD589\uC6B4\uBC88\uD638' },
];

// --- Subcomponents ---

function Spinner({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div
        className="rounded-full"
        style={{
          width: size,
          height: size,
          border: '3px solid var(--border)',
          borderTopColor: '#FF6B35',
          animation: 'mypage-spin 0.8s linear infinite',
        }}
      />
    </div>
  );
}

function CircularProgress({ value, size = 80 }: { value: number; size?: number }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - value * circumference;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--border)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#FF6B35"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  );
}

// --- Main Component ---

export default function MyPage() {
  const auth = useAuth();
  const { progress, badges } = useUserProgress();

  // Number history state
  const [numbers, setNumbers] = useState<SavedNumber[]>([]);
  const [totalNumbers, setTotalNumbers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sourceFilter, setSourceFilter] = useState<NumberSource | 'all'>('all');
  const [numbersLoading, setNumbersLoading] = useState(false);
  const [numbersInitialized, setNumbersInitialized] = useState(false);

  // Check results state
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{ checked: number } | null>(null);

  // Stats state
  const [stats, setStats] = useState<NumberStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // --- Data fetching ---

  const fetchNumbers = useCallback(
    async (page: number, append: boolean = false) => {
      if (!auth.user) return;
      setNumbersLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: '20' });
        if (sourceFilter !== 'all') params.set('source', sourceFilter);
        const res = await fetch(`/api/user/numbers?${params}`, { credentials: 'include' });
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        if (data.success) {
          setNumbers((prev) => (append ? [...prev, ...data.numbers] : data.numbers));
          setTotalNumbers(data.total);
          setCurrentPage(data.page);
          setTotalPages(data.totalPages);
        }
      } catch (err) {
        console.error('Failed to fetch numbers:', err);
      } finally {
        setNumbersLoading(false);
        setNumbersInitialized(true);
      }
    },
    [auth.user, sourceFilter]
  );

  const fetchStats = useCallback(async () => {
    if (!auth.user) return;
    setStatsLoading(true);
    try {
      const res = await fetch('/api/user/numbers/stats', { credentials: 'include' });
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [auth.user]);

  useEffect(() => {
    if (auth.user) {
      setNumbers([]);
      setCurrentPage(1);
      setNumbersInitialized(false);
      fetchNumbers(1, false);
    }
  }, [auth.user, sourceFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (auth.user) fetchStats();
  }, [auth.user]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Actions ---

  const handleCheck = async () => {
    if (checking || !auth.user) return;
    setChecking(true);
    setCheckResult(null);
    try {
      const res = await fetch('/api/user/numbers/check', { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error('check failed');
      const data = await res.json();
      if (data.success) {
        setCheckResult({ checked: data.checked });
        fetchNumbers(1, false);
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to check numbers:', err);
    } finally {
      setChecking(false);
    }
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !numbersLoading) {
      fetchNumbers(currentPage + 1, true);
    }
  };

  // --- Computed values ---

  const badgeStats = useMemo(() => {
    const unlocked = badges.filter((b) => b.unlocked).length;
    const total = badges.length;
    const ratio = total > 0 ? unlocked / total : 0;
    return { unlocked, total, ratio };
  }, [badges]);

  const maxMatchDist = useMemo(() => {
    if (!stats?.matchDistribution) return 1;
    const vals = Object.values(stats.matchDistribution);
    return Math.max(...vals, 1);
  }, [stats]);

  // --- Auth loading state ---

  if (auth.isLoading) {
    return <Spinner size={48} />;
  }

  // --- Not logged in ---

  if (!auth.user) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <div
          className="rounded-2xl p-8"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div
            className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center text-3xl"
            style={{ background: 'linear-gradient(135deg, #FF6B35, #FF8C42)' }}
          >
            {'\uD83D\uDD12'}
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            {'\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4'}
          </h2>
          <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {'\uB9C8\uC774\uD398\uC774\uC9C0\uB294 \uD68C\uC6D0 \uC804\uC6A9 \uAE30\uB2A5\uC785\uB2C8\uB2E4.'}
            <br />
            {'\uB85C\uADF8\uC778\uD558\uC5EC \uBC88\uD638 \uD788\uC2A4\uD1A0\uB9AC\uC640 \uBC30\uC9C0\uB97C \uD655\uC778\uD558\uC138\uC694.'}
          </p>
          <button
            onClick={() => auth.openAuthModal()}
            className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #FF6B35, #FF8C42)' }}
          >
            {'\uB85C\uADF8\uC778 / \uD68C\uC6D0\uAC00\uC785'}
          </button>
        </div>
      </div>
    );
  }

  // --- Main dashboard render ---

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-8">
      {/* Global keyframes */}
      <style>{`@keyframes mypage-spin { to { transform: rotate(360deg); } }`}</style>

      {/* == Section 1: Profile Card == */}
      <section
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="h-1.5" style={{ background: 'linear-gradient(135deg, #FF6B35, #FF8C42)' }} />
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0"
              style={{ background: 'linear-gradient(135deg, #FF6B35, #FF8C42)' }}
            >
              {'\uD83D\uDC64'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                  {auth.user.nickname}
                </h1>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
                  style={{ backgroundColor: '#FF6B35' }}
                >
                  {'\uD68C\uC6D0'}
                </span>
              </div>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {'\uAC00\uC785\uC77C: '}{formatJoinDate(auth.user.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex gap-5 sm:ml-auto">
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: '#FF6B35' }}>
                {progress.visitStreak}
                <span className="text-xs font-normal ml-0.5" style={{ color: 'var(--text-secondary)' }}>{'\uC77C'}</span>
              </p>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{'\uC5F0\uC18D \uBC29\uBB38'}</p>
            </div>
            <div className="w-px" style={{ backgroundColor: 'var(--border)' }} />
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                {progress.longestStreak}
                <span className="text-xs font-normal ml-0.5" style={{ color: 'var(--text-secondary)' }}>{'\uC77C'}</span>
              </p>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{'\uCD5C\uC7A5 \uC5F0\uC18D'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* == Section 2: Number History == */}
      <section
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
              {'\uD83D\uDCCA \uB0B4 \uBC88\uD638 \uD788\uC2A4\uD1A0\uB9AC'}
            </h2>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: 'rgba(255, 107, 53, 0.15)', color: '#FF6B35' }}
            >
              {totalNumbers}{'\uAC1C'}
            </span>
          </div>
          <button
            onClick={handleCheck}
            disabled={checking}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 sm:ml-auto shrink-0"
            style={{
              background: checking ? 'var(--text-tertiary)' : 'linear-gradient(135deg, #FF6B35, #FF8C42)',
            }}
          >
            {checking ? (
              <span className="flex items-center gap-2">
                <span
                  className="inline-block w-4 h-4 rounded-full"
                  style={{
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    animation: 'mypage-spin 0.7s linear infinite',
                  }}
                />
                {'\uD655\uC778 \uC911...'}
              </span>
            ) : (
              '\uB2F9\uCCA8 \uD655\uC778\uD558\uAE30'
            )}
          </button>
        </div>

        {/* Check result notification */}
        {checkResult !== null && (
          <div
            className="mx-5 sm:mx-6 mb-3 p-3 rounded-lg text-sm flex items-center gap-2"
            style={{
              backgroundColor: checkResult.checked > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 107, 53, 0.1)',
              color: checkResult.checked > 0 ? '#10B981' : '#FF6B35',
              border: `1px solid ${checkResult.checked > 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 107, 53, 0.2)'}`,
            }}
          >
            {checkResult.checked > 0
              ? `${checkResult.checked}\uAC1C \uBC88\uD638\uC758 \uB2F9\uCCA8 \uACB0\uACFC\uB97C \uD655\uC778\uD588\uC2B5\uB2C8\uB2E4!`
              : '\uD655\uC778\uD560 \uBBF8\uB300\uC870 \uBC88\uD638\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.'}
          </div>
        )}

        {/* Filter tabs */}
        <div className="px-5 sm:px-6 pb-4 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {FILTER_TABS.map((tab) => {
            const isActive = sourceFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSourceFilter(tab.key)}
                className="px-3.5 py-1.5 rounded-full text-sm font-medium transition-all shrink-0 whitespace-nowrap"
                style={{
                  backgroundColor: isActive ? '#FF6B35' : 'var(--surface-hover)',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${isActive ? '#FF6B35' : 'var(--border)'}`,
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Number list */}
        <div className="border-t" style={{ borderColor: 'var(--border)' }}>
          {numbersLoading && !numbersInitialized ? (
            <Spinner size={32} />
          ) : numbers.length === 0 ? (
            <div className="py-16 px-6 text-center">
              <p className="text-4xl mb-3">{'\uD83D\uDCED'}</p>
              <p className="font-medium mb-1" style={{ color: 'var(--text)' }}>
                {'\uC544\uC9C1 \uC800\uC7A5\uB41C \uBC88\uD638\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4'}
              </p>
              <p className="text-sm mb-5" style={{ color: 'var(--text-tertiary)' }}>
                {'AI \uBC88\uD638\uB97C \uC0DD\uC131\uD574\uBCF4\uC138\uC694!'}
              </p>
              <Link
                href="/"
                className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #FF6B35, #FF8C42)' }}
              >
                {'\uBC88\uD638 \uC0DD\uC131\uD558\uB7EC \uAC00\uAE30'}
              </Link>
            </div>
          ) : (
            <>
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {numbers.map((num) => {
                  const src = SOURCE_LABELS[num.source];
                  const isChecked = num.checked_at !== null;
                  const rank = isChecked
                    ? calculateRank(num.matched_count ?? 0, num.bonus_matched ?? false)
                    : null;

                  return (
                    <div
                      key={num.id}
                      className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 transition-colors"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span
                          className="text-xs px-2 py-1 rounded-md font-medium text-white shrink-0"
                          style={{ backgroundColor: src.bg }}
                        >
                          {src.emoji} {src.label}
                        </span>
                        <div className="shrink-0">
                          <LottoNumbers numbers={num.numbers} size="sm" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs shrink-0 flex-wrap">
                        <span
                          className="px-2 py-1 rounded"
                          style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text-secondary)' }}
                        >
                          {'\uC81C '}{num.round_target}{'\uD68C \uB300\uC0C1'}
                        </span>
                        {isChecked ? (
                          <span
                            className="px-2.5 py-1 rounded font-semibold"
                            style={{
                              backgroundColor: rank && rank > 0 ? `${getRankColor(rank)}20` : 'var(--surface-hover)',
                              color: rank && rank > 0 ? getRankColor(rank) : 'var(--text-tertiary)',
                              border: `1px solid ${rank && rank > 0 ? `${getRankColor(rank)}40` : 'var(--border)'}`,
                            }}
                          >
                            {rank && rank > 0
                              ? `${getRankLabel(rank)} (${num.matched_count}\uAC1C \uC77C\uCE58)`
                              : `${num.matched_count}\uAC1C \uC77C\uCE58`}
                          </span>
                        ) : (
                          <span
                            className="px-2.5 py-1 rounded"
                            style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text-tertiary)', border: '1px solid var(--border)' }}
                          >
                            {'\uBBF8\uD655\uC778'}
                          </span>
                        )}
                        <span style={{ color: 'var(--text-tertiary)' }}>{formatDate(num.created_at)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {currentPage < totalPages && (
                <div className="p-5 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={numbersLoading}
                    className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80 disabled:opacity-50"
                    style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                  >
                    {numbersLoading ? '\uBD88\uB7EC\uC624\uB294 \uC911...' : '\uB354\uBCF4\uAE30'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* == Section 3: Statistics Summary == */}
      <section
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="p-5 sm:p-6">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>
            {'\uD83D\uDCC8 \uD1B5\uACC4 \uC694\uC57D'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: '\uCD1D \uC800\uC7A5 \uBC88\uD638', value: stats ? `${stats.totalSaved}\uAC1C` : '-', icon: '\uD83D\uDCBE', accent: '#FF6B35' },
              { label: '\uCD5C\uACE0 \uB9E4\uCE58', value: stats ? `${stats.bestMatch}\uAC1C \uC77C\uCE58` : '-', icon: '\uD83C\uDFAF', accent: '#10B981' },
              { label: '\uB2F9\uCCA8 \uD655\uC778', value: stats ? `${stats.totalChecked}\uD68C` : '-', icon: '\u2705', accent: '#3B82F6' },
              { label: 'AI \uC0DD\uC131', value: `${progress.actions.aiGenerations}\uD68C`, icon: '\uD83E\uDD16', accent: '#8B5CF6' },
            ].map((card, i) => (
              <div
                key={i}
                className="rounded-xl p-4 text-center"
                style={{ backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)' }}
              >
                <p className="text-xl mb-1">{card.icon}</p>
                <p className="text-lg font-bold" style={{ color: card.accent }}>{card.value}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{card.label}</p>
              </div>
            ))}
          </div>

          {/* Match distribution */}
          {stats && stats.totalChecked > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                {'\uC77C\uCE58 \uAC1C\uC218 \uBD84\uD3EC'}
              </h3>
              <div className="flex flex-col gap-2">
                {[0, 1, 2, 3, 4, 5, 6].map((matchCount) => {
                  const count = stats.matchDistribution[matchCount] ?? 0;
                  const widthPct = maxMatchDist > 0 ? (count / maxMatchDist) * 100 : 0;
                  const barColors = ['var(--text-tertiary)', '#94A3B8', '#60A5FA', '#34D399', '#FBBF24', '#F97316', '#EF4444'];
                  return (
                    <div key={matchCount} className="flex items-center gap-3">
                      <span className="text-xs font-medium w-14 text-right shrink-0" style={{ color: 'var(--text-secondary)' }}>
                        {matchCount}{'\uAC1C \uC77C\uCE58'}
                      </span>
                      <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(widthPct, count > 0 ? 4 : 0)}%`, backgroundColor: barColors[matchCount] }}
                        />
                      </div>
                      <span className="text-xs font-medium w-8 shrink-0" style={{ color: 'var(--text-tertiary)' }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {stats && stats.totalChecked === 0 && (
            <p className="text-sm text-center py-4" style={{ color: 'var(--text-tertiary)' }}>
              {'\uB2F9\uCCA8 \uD655\uC778\uC744 \uD558\uBA74 \uC77C\uCE58 \uBD84\uD3EC \uCC28\uD2B8\uAC00 \uB098\uD0C0\uB0A9\uB2C8\uB2E4.'}
            </p>
          )}
          {!stats && statsLoading && (
            <div className="flex justify-center py-4">
              <div
                className="rounded-full"
                style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: '#FF6B35', animation: 'mypage-spin 0.8s linear infinite' }}
              />
            </div>
          )}
        </div>
      </section>

      {/* == Section 4: Badge Progress == */}
      <section
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
              {'\uD83C\uDFC5 \uBC30\uC9C0 \uC9C4\uD589\uB960'}
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <CircularProgress value={badgeStats.ratio} size={52} />
                <div
                  className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                  style={{ color: '#FF6B35' }}
                >
                  {Math.round(badgeStats.ratio * 100)}%
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                  {badgeStats.unlocked}/{badgeStats.total}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {'\uBC30\uC9C0 \uB2EC\uC131'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {badges.map((badge) => {
              const progressPct = Math.min(badge.progress * 100, 100);
              return (
                <div
                  key={badge.id}
                  className="rounded-xl p-4 relative overflow-hidden transition-all"
                  style={{
                    backgroundColor: badge.unlocked ? 'rgba(255, 107, 53, 0.06)' : 'var(--surface-hover)',
                    border: `1px solid ${badge.unlocked ? 'rgba(255, 107, 53, 0.25)' : 'var(--border)'}`,
                  }}
                >
                  {badge.unlocked && (
                    <div
                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ backgroundColor: '#10B981' }}
                    >
                      {'\u2713'}
                    </div>
                  )}
                  <div
                    className="text-2xl mb-2"
                    style={{ opacity: badge.unlocked ? 1 : 0.4, filter: badge.unlocked ? 'none' : 'grayscale(1)' }}
                  >
                    {badge.icon}
                  </div>
                  <p
                    className="text-sm font-semibold mb-0.5 leading-tight"
                    style={{ color: badge.unlocked ? 'var(--text)' : 'var(--text-secondary)' }}
                  >
                    {badge.name}
                  </p>
                  <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                    {badge.description}
                  </p>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progressPct}%`,
                        background: badge.unlocked ? 'linear-gradient(135deg, #FF6B35, #FF8C42)' : 'var(--text-tertiary)',
                      }}
                    />
                  </div>
                  <p className="text-xs mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
                    {badge.current >= badge.requirement ? '\uB2EC\uC131 \uC644\uB8CC!' : `${badge.current} / ${badge.requirement}`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
