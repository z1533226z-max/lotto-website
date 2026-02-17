'use client';

import React, { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import Link from 'next/link';

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
        className="relative overflow-hidden rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5"
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Left accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
          style={{ background: 'linear-gradient(180deg, #D36135, #3E5641)' }}
        />

        {/* Content */}
        <div className="flex items-center justify-between gap-3 pl-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(211, 97, 53, 0.1)' }}
            >
              <Target className="w-5 h-5 text-[#D36135]" />
            </div>

            <div className="min-w-0">
              <p className="font-bold text-sm truncate" style={{ color: 'var(--text)' }}>
                AI가 {latestHit.round}회에서{' '}
                <span style={{ color: '#D36135' }}>
                  {latestHit.matchCount}개 적중!
                </span>
              </p>
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-tertiary)' }}>
                역대 최고 {stats.maxMatch}개 적중 | 평균{' '}
                {stats.avgMatch}개 | 3개 이상 {stats.threeOrMore}회
              </p>
            </div>
          </div>

          {/* CTA */}
          <span
            className="text-xs font-medium px-3 py-1.5 rounded-full flex-shrink-0 transition-colors duration-200 group-hover:opacity-80"
            style={{
              backgroundColor: 'rgba(211, 97, 53, 0.08)',
              color: '#D36135',
            }}
          >
            적중 기록 보기 →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default AIHitsBanner;
