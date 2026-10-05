'use client';

import React, { useState, useEffect } from 'react';
import { Target } from 'lucide-react';

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
            // matchResults는 정적 기록(1215회~)이 앞에 오므로 [0]이 아니라 가장 최근 회차를 고른다
            const latest = (data.matchResults as MatchResult[]).reduce((a, b) => (b.round > a.round ? b : a));
            setLatestHit({
              round: latest.round,
              matchCount: latest.matchCount,
              matchedNumbers: latest.matchedNumbers,
            });
          }
        }
      })
      .catch(() => {});
  }, []);

  if (!latestHit) return null;

  return (
    <a href="/lotto/ai-hits" className="block group">
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
                AI 추천번호 {latestHit.round}회 결과:{' '}
                <span style={{ color: '#D36135' }}>
                  {latestHit.matchCount}개 일치
                </span>
              </p>
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-tertiary)' }}>
                추첨 전 데이터 기준 | 최고 {stats.maxMatch}개 | 평균{' '}
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
    </a>
  );
};

export default AIHitsBanner;
