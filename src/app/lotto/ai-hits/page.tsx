'use client';

import React, { useState, useEffect } from 'react';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import LottoNumbers from '@/components/lotto/LottoNumbers';
import { cn } from '@/lib/utils';
import type { AIPredictionWithResult, AIPrediction } from '@/data/aiPredictionHistory';

interface AIStats {
  avgMatch: number;
  maxMatch: number;
  totalPredictions: number;
  threeOrMore: number;
}

function getMatchBadgeVariant(count: number): 'danger' | 'warning' | 'success' | 'info' | 'default' {
  if (count >= 4) return 'danger';
  if (count >= 3) return 'success';
  if (count >= 2) return 'warning';
  if (count >= 1) return 'info';
  return 'default';
}

function getMatchBadgeText(count: number, bonusMatch?: boolean): string {
  const base = `${count}개 적중`;
  return bonusMatch ? `${base} +보너스` : base;
}

export default function AIHitsPage() {
  const [results, setResults] = useState<AIPredictionWithResult[]>([]);
  const [stats, setStats] = useState<AIStats>({ avgMatch: 0, maxMatch: 0, totalPredictions: 0, threeOrMore: 0 });
  const [nextPrediction, setNextPrediction] = useState<AIPrediction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ai-predictions')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setResults(data.matchResults || []);
          setStats(data.stats || { avgMatch: 0, maxMatch: 0, totalPredictions: 0, threeOrMore: 0 });
          setNextPrediction(data.nextPrediction || null);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Loading state
  if (loading) {
    return (
      <>
        <Breadcrumb items={[
          { label: '홈', href: '/' },
          { label: 'AI 적중 기록' },
        ]} />

        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
          AI 추천번호 적중 기록
        </h1>
        <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
          로또킹 AI가 추천한 번호의 실제 적중 현황
        </p>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} variant="glass">
              <div className="text-center space-y-2">
                <Skeleton width="60%" height="1rem" className="mx-auto" />
                <Skeleton width="40%" height="2rem" className="mx-auto" />
              </div>
            </Card>
          ))}
        </div>

        {/* Items skeleton */}
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} variant="glass">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton width="80px" height="1.25rem" />
                  <Skeleton width="100px" height="1.5rem" variant="rectangular" />
                </div>
                <Skeleton width="100%" height="2rem" />
                <Skeleton width="100%" height="2rem" />
              </div>
            </Card>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb items={[
        { label: '홈', href: '/' },
        { label: 'AI 적중 기록' },
      ]} />

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
          AI 추천번호 적중 기록
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          로또킹 AI가 추천한 번호의 실제 적중 현황
        </p>
      </div>

      {/* Next prediction card */}
      {nextPrediction && (
        <Card variant="gradient" hover="glow" className="mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #3B82F6)' }}
              >
                <span className="text-xl">🔮</span>
              </div>
              <div>
                <span className="font-bold text-lg" style={{ color: 'var(--text)' }}>
                  {nextPrediction.round}회 AI 추천번호
                </span>
                <Badge variant="secondary" size="sm" className="ml-2">
                  추첨 전
                </Badge>
              </div>
            </div>
            <div className="flex gap-2.5 flex-wrap">
              {nextPrediction.predictedNumbers.map(n => (
                <span
                  key={n}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)',
                  }}
                >
                  {n}
                </span>
              ))}
            </div>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              예측일: {nextPrediction.predictedAt} | AI 통계분석 기반 생성
            </p>
          </div>
        </Card>
      )}

      {/* Stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card variant="glass" hover="lift" className="text-center">
          <div className="space-y-1">
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>총 예측</p>
            <p className="text-3xl font-black" style={{ color: 'var(--text)' }}>{stats.totalPredictions}</p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>회</p>
          </div>
        </Card>
        <Card variant="glass" hover="lift" className="text-center">
          <div className="space-y-1">
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>평균 적중</p>
            <p className="text-3xl font-black text-primary">{stats.avgMatch}</p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>개</p>
          </div>
        </Card>
        <Card variant="glass" hover="lift" className="text-center">
          <div className="space-y-1">
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>최고 적중</p>
            <p className="text-3xl font-black" style={{ color: 'var(--secondary)' }}>{stats.maxMatch}</p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>개</p>
          </div>
        </Card>
        <Card variant="glass" hover="lift" className="text-center">
          <div className="space-y-1">
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>3개+ 적중</p>
            <p className="text-3xl font-black" style={{ color: '#E6A800' }}>{stats.threeOrMore}</p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>회</p>
          </div>
        </Card>
      </div>

      {/* Hit records */}
      <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>
        회차별 적중 기록
      </h2>

      <div className="space-y-4">
        {results.map((item) => (
          <Card
            key={item.round}
            variant="glass"
            hover="lift"
            className={cn(
              'transition-all duration-300',
              item.matchCount >= 3 && 'ring-2 ring-emerald-400/50 dark:ring-emerald-400/30'
            )}
          >
            <div className="space-y-4">
              {/* Header row */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg" style={{ color: 'var(--text)' }}>
                    {item.round}회
                  </span>
                  {item.matchCount >= 3 && (
                    <span className="text-sm">🔥</span>
                  )}
                </div>
                <Badge
                  variant={getMatchBadgeVariant(item.matchCount)}
                  size="md"
                >
                  {getMatchBadgeText(item.matchCount, item.bonusMatch)}
                </Badge>
              </div>

              {/* AI Predicted numbers */}
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-tertiary)' }}>
                  AI 추천번호
                </p>
                <div className="flex gap-2 flex-wrap">
                  {item.predictedNumbers.map(n => {
                    const isMatch = item.matchedNumbers.includes(n);
                    const isBonus = n === item.bonusNumber;
                    return (
                      <span
                        key={n}
                        className={cn(
                          'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200',
                          isMatch
                            ? 'text-white shadow-lg ring-2 ring-offset-1'
                            : isBonus
                              ? 'text-white shadow-md'
                              : ''
                        )}
                        style={{
                          ...(isMatch
                            ? {
                                background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                                ringColor: 'rgba(239, 68, 68, 0.3)',
                              }
                            : isBonus
                              ? {
                                  background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
                                  boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)',
                                }
                              : {
                                  backgroundColor: 'var(--surface-hover)',
                                  color: 'var(--text-secondary)',
                                }),
                        }}
                      >
                        {n}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Actual winning numbers */}
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-tertiary)' }}>
                  실제 당첨번호
                </p>
                <LottoNumbers numbers={item.actualNumbers} bonusNumber={item.bonusNumber} size="xs" />
              </div>

              {/* Matched numbers highlight */}
              {item.matchedNumbers.length > 0 && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                >
                  <span className="text-sm">✅</span>
                  <p className="text-sm font-medium" style={{ color: '#059669' }}>
                    적중 번호: <strong>{item.matchedNumbers.join(', ')}</strong>
                  </p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {!loading && results.length === 0 && (
        <Card variant="glass" className="text-center py-16">
          <div className="space-y-3">
            <span className="text-4xl">📭</span>
            <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>
              아직 적중 기록이 없습니다.
            </p>
          </div>
        </Card>
      )}
    </>
  );
}
