'use client';

import React, { useState, useEffect } from 'react';
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
  const [stats, setStats] = useState<BannerStats>({ avgMatch: 0, maxMatch: 0, totalPredictions: 0, threeOrMore: 0 });
  const [latestHit, setLatestHit] = useState<MatchResult | null>(null);

  useEffect(() => {
    fetch('/api/ai-predictions')
      .then(res => res.json())
      .then(data => {
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
    <Link href="/lotto/ai-hits">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-4 cursor-pointer hover:opacity-95 transition-opacity">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="font-bold text-sm md:text-base">
                AI가 {latestHit.round}회에서 <span className="text-yellow-300">{latestHit.matchCount}개 적중!</span>
              </p>
              <p className="text-xs text-white/80">
                역대 최고 {stats.maxMatch}개 적중 | 평균 {stats.avgMatch}개 | 3개 이상 {stats.threeOrMore}회
              </p>
            </div>
          </div>
          <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
            적중 기록 보기 →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default AIHitsBanner;
