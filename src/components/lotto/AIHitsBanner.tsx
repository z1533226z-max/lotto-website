'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BannerStats {
  avgMatch: number;
  maxMatch: number;
  totalPredictions: number;
  threeOrMore: number;
}

interface MatchResult {
  round: number;
  matchCount: number;
  matchedNumbers: number[];
}

const AIHitsBanner: React.FC = () => {
  const [stats, setStats] = useState<BannerStats>({
    avgMatch: 0,
    maxMatch: 0,
    totalPredictions: 0,
    threeOrMore: 0,
  });
  const [latestHit, setLatestHit] = useState<MatchResult | null>(null);

  useEffect(() => {
    fetch('/api/ai-predictions')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stats) {
          setStats(data.stats);
          if (data.matchResults && data.matchResults.length > 0) {
            const latest = data.matchResults[0];
            setLatestHit({
              round: latest.round,
              matchCount: latest.matchCount,
              matchedNumbers: latest.matchedNumbers,
            });
          }
        }
      })
      .catch(console.error);
  }, []);

  if (!latestHit) return null;

  return (
    <Link href="/lotto/ai-hits" className="block group">
      <div
        className={cn(
          'relative overflow-hidden',
          'rounded-2xl p-5',
          'transition-all duration-300',
          'hover:shadow-glow hover:-translate-y-0.5',
          'cursor-pointer'
        )}
        style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
        }}
      >
        {/* Animated shimmer overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s linear infinite',
          }}
        />

        {/* Glow circles */}
        <div
          className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {/* Animated target icon */}
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                'bg-white/20 backdrop-blur-sm',
                'transition-transform duration-300 group-hover:scale-110'
              )}
            >
              <span className="text-xl">🎯</span>
            </div>

            <div>
              <p className="font-bold text-sm md:text-base text-white">
                AI가 {latestHit.round}회에서{' '}
                <span className="text-yellow-100 drop-shadow-sm">
                  {latestHit.matchCount}개 적중!
                </span>
              </p>
              <p className="text-xs text-white/80 mt-0.5">
                역대 최고 {stats.maxMatch}개 적중 | 평균{' '}
                {stats.avgMatch}개 | 3개 이상 {stats.threeOrMore}회
              </p>
            </div>
          </div>

          {/* CTA */}
          <span
            className={cn(
              'text-xs font-medium',
              'px-4 py-1.5 rounded-full',
              'bg-white/20 backdrop-blur-sm text-white',
              'transition-all duration-300',
              'group-hover:bg-white/30 group-hover:px-5'
            )}
          >
            적중 기록 보기 →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default AIHitsBanner;
