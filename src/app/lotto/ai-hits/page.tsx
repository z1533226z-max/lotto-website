'use client';

import React, { useState, useEffect } from 'react';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import LottoNumbers from '@/components/lotto/LottoNumbers';
import { cn } from '@/lib/utils';
import type { AIMultiSetResult } from '@/data/aiPredictionHistory';
import { Eye, Flame, Trophy, CheckCircle2, Inbox } from 'lucide-react';

interface AIMultiSetStats {
  avgMatch: number;
  maxMatch: number;
  totalPredictions: number;
  threeOrMore: number;
  totalSets: number;
}

interface NextMultiSetPrediction {
  round: number;
  sets: { setIndex: number; predictedNumbers: number[] }[];
  predictedAt: string;
}

const STRATEGY_LABELS = ['통계 기본', '트렌드 강화', '핫넘버', '콜드넘버', '균형 분석'];
const STRATEGY_COLORS = ['#3B82F6', '#8B5CF6', '#EF4444', '#06B6D4', '#10B981'];

function getMatchBadgeVariant(count: number): 'danger' | 'warning' | 'success' | 'info' | 'default' {
  if (count >= 4) return 'danger';
  if (count >= 3) return 'success';
  if (count >= 2) return 'warning';
  if (count >= 1) return 'info';
  return 'default';
}

export default function AIHitsPage() {
  const [multiSetResults, setMultiSetResults] = useState<AIMultiSetResult[]>([]);
  const [multiSetStats, setMultiSetStats] = useState<AIMultiSetStats>({
    avgMatch: 0, maxMatch: 0, totalPredictions: 0, threeOrMore: 0, totalSets: 0
  });
  const [nextPrediction, setNextPrediction] = useState<NextMultiSetPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedRounds, setExpandedRounds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch('/api/ai-predictions')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMultiSetResults(data.multiSetResults || []);
          setMultiSetStats(data.multiSetStats || {
            avgMatch: 0, maxMatch: 0, totalPredictions: 0, threeOrMore: 0, totalSets: 0
          });
          setNextPrediction(data.nextMultiSetPrediction || null);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleExpanded = (round: number) => {
    setExpandedRounds(prev => {
      const next = new Set(prev);
      if (next.has(round)) {
        next.delete(round);
      } else {
        next.add(round);
      }
      return next;
    });
  };

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
          5가지 AI 전략의 실제 적중 현황을 확인하세요
        </p>
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
          매 회차 5가지 AI 전략으로 분석한 번호의 실제 적중 현황
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
                <Eye className="w-5 h-5 text-white" />
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

            <div className="space-y-3">
              {nextPrediction.sets.map((set) => (
                <div key={set.setIndex} className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full text-white shrink-0"
                    style={{ backgroundColor: STRATEGY_COLORS[set.setIndex], minWidth: '4.5rem', textAlign: 'center' }}
                  >
                    {STRATEGY_LABELS[set.setIndex]}
                  </span>
                  <div className="flex gap-1.5 flex-wrap">
                    {set.predictedNumbers.map(n => (
                      <span
                        key={n}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md"
                        style={{
                          background: `linear-gradient(135deg, ${STRATEGY_COLORS[set.setIndex]}, ${STRATEGY_COLORS[set.setIndex]}dd)`,
                        }}
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              예측일: {nextPrediction.predictedAt} | 5가지 AI 전략 기반 분석
            </p>
          </div>
        </Card>
      )}

      {/* Strategy legend */}
      <Card variant="glass" padding="sm" className="mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            AI 전략:
          </span>
          {STRATEGY_LABELS.map((label, idx) => (
            <span
              key={idx}
              className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: STRATEGY_COLORS[idx] }}
            >
              {label}
            </span>
          ))}
        </div>
      </Card>

      {/* Stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card variant="glass" hover="lift" className="text-center">
          <div className="space-y-1">
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>총 예측</p>
            <p className="text-3xl font-black" style={{ color: 'var(--text)' }}>{multiSetStats.totalPredictions}</p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>회 (x5세트)</p>
          </div>
        </Card>
        <Card variant="glass" hover="lift" className="text-center">
          <div className="space-y-1">
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>베스트 평균</p>
            <p className="text-3xl font-black text-primary">{multiSetStats.avgMatch}</p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>개 적중</p>
          </div>
        </Card>
        <Card variant="glass" hover="lift" className="text-center">
          <div className="space-y-1">
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>최고 적중</p>
            <p className="text-3xl font-black" style={{ color: 'var(--secondary)' }}>{multiSetStats.maxMatch}</p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>개</p>
          </div>
        </Card>
        <Card variant="glass" hover="lift" className="text-center">
          <div className="space-y-1">
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>3개+ 적중</p>
            <p className="text-3xl font-black" style={{ color: '#E6A800' }}>{multiSetStats.threeOrMore}</p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>회</p>
          </div>
        </Card>
      </div>

      {/* Hit records */}
      <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>
        회차별 적중 기록
      </h2>

      <div className="space-y-4">
        {multiSetResults.map((item) => {
          const isExpanded = expandedRounds.has(item.round);
          const bestSet = item.sets[item.bestSetIndex];

          return (
            <Card
              key={item.round}
              variant="glass"
              hover="lift"
              className={cn(
                'transition-all duration-300',
                item.bestMatchCount >= 3 && 'ring-2 ring-emerald-400/50 dark:ring-emerald-400/30'
              )}
            >
              <div className="space-y-4">
                {/* Header row */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg" style={{ color: 'var(--text)' }}>
                      {item.round}회
                    </span>
                    {item.bestMatchCount >= 3 && <Flame className="w-4 h-4 inline-block text-orange-500" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getMatchBadgeVariant(item.bestMatchCount)}
                      size="md"
                    >
                      베스트 {item.bestMatchCount}개 적중
                      {item.bestBonusMatch ? ' +보너스' : ''}
                    </Badge>
                  </div>
                </div>

                {/* Best set highlight */}
                <div
                  className="rounded-xl p-3"
                  style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 inline-block text-yellow-500" />
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: STRATEGY_COLORS[item.bestSetIndex] }}
                    >
                      {STRATEGY_LABELS[item.bestSetIndex]}
                    </span>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                      베스트 세트
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {bestSet.predictedNumbers.map(n => {
                      const isMatch = bestSet.matchedNumbers.includes(n);
                      const isBonus = n === item.bonusNumber;
                      return (
                        <span
                          key={n}
                          className={cn(
                            'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                            isMatch && 'text-white shadow-lg ring-2 ring-offset-1',
                            isBonus && !isMatch && 'text-white shadow-md',
                          )}
                          style={{
                            ...(isMatch
                              ? {
                                  background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
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
                  {bestSet.matchedNumbers.length > 0 && (
                    <p className="text-xs font-medium mt-2" style={{ color: '#059669' }}>
                      <CheckCircle2 className="w-3.5 h-3.5 inline-block mr-1" /> 적중: {bestSet.matchedNumbers.join(', ')}
                      {bestSet.bonusMatch && ' + 보너스'}
                    </p>
                  )}
                </div>

                {/* Actual winning numbers */}
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-tertiary)' }}>
                    실제 당첨번호
                  </p>
                  <LottoNumbers numbers={item.actualNumbers} bonusNumber={item.bonusNumber} size="xs" />
                </div>

                {/* All sets summary (mini view) */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                    전략별 적중:
                  </span>
                  {item.sets.map((set, idx) => (
                    <span
                      key={idx}
                      className={cn(
                        'text-xs font-bold px-2 py-0.5 rounded-full',
                        idx === item.bestSetIndex ? 'text-white' : 'opacity-70'
                      )}
                      style={{
                        backgroundColor: idx === item.bestSetIndex
                          ? STRATEGY_COLORS[idx]
                          : 'var(--surface-hover)',
                        color: idx === item.bestSetIndex ? 'white' : 'var(--text-secondary)',
                      }}
                    >
                      {set.matchCount}개
                    </span>
                  ))}
                </div>

                {/* Expand/collapse button */}
                <button
                  onClick={() => toggleExpanded(item.round)}
                  className="w-full text-center py-2 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--surface-hover)',
                  }}
                >
                  {isExpanded ? '▲ 전략별 상세 접기' : '▼ 전략별 상세 보기'}
                </button>

                {/* Expanded: all 5 sets detail */}
                {isExpanded && (
                  <div className="space-y-3 animate-fadeInUp">
                    {item.sets.map((set, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg p-3"
                        style={{
                          backgroundColor: idx === item.bestSetIndex
                            ? `${STRATEGY_COLORS[idx]}10`
                            : 'var(--surface)',
                          border: idx === item.bestSetIndex ? `1px solid ${STRATEGY_COLORS[idx]}40` : '1px solid transparent',
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: STRATEGY_COLORS[idx] }}
                          >
                            {STRATEGY_LABELS[idx]}
                          </span>
                          <Badge
                            variant={getMatchBadgeVariant(set.matchCount)}
                            size="sm"
                          >
                            {set.matchCount}개{set.bonusMatch ? ' +보너스' : ''}
                          </Badge>
                          {idx === item.bestSetIndex && (
                            <Trophy className="w-3 h-3 inline-block text-yellow-500" />
                          )}
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                          {set.predictedNumbers.map(n => {
                            const isMatch = set.matchedNumbers.includes(n);
                            const isBonus = n === item.bonusNumber;
                            return (
                              <span
                                key={n}
                                className={cn(
                                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                                  isMatch && 'text-white shadow-md',
                                  isBonus && !isMatch && 'text-white',
                                )}
                                style={{
                                  ...(isMatch
                                    ? { background: 'linear-gradient(135deg, #EF4444, #DC2626)' }
                                    : isBonus
                                      ? { background: 'linear-gradient(135deg, #FBBF24, #F59E0B)' }
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
                        {set.matchedNumbers.length > 0 && (
                          <p className="text-xs mt-1.5" style={{ color: '#059669' }}>
                            적중: {set.matchedNumbers.join(', ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {!loading && multiSetResults.length === 0 && (
        <Card variant="glass" className="text-center py-16">
          <div className="space-y-3">
            <Inbox className="w-10 h-10 mx-auto" />
            <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>
              아직 적중 기록이 없습니다.
            </p>
          </div>
        </Card>
      )}

      {/* Info note */}
      <Card variant="outlined" padding="sm" className="mt-6">
        <div className="space-y-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          <p>* 매 회차 5가지 AI 전략으로 번호를 분석하며, 베스트 적중 세트를 하이라이트합니다.</p>
          <p>* 전략: 통계 기본 / 최근 트렌드 / 핫넘버 / 콜드넘버 역발상 / 균형 분석</p>
          <p>* 모든 예측번호는 시드 기반 결정론적 생성으로, 과거 데이터 조작이 불가능합니다.</p>
        </div>
      </Card>
    </>
  );
}
