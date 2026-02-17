'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LottoNumbers from '@/components/lotto/LottoNumbers';
import { cn } from '@/lib/utils';
import { LOTTO_CONFIG, PRIZE_RANKS } from '@/lib/constants';
import type { LottoResult } from '@/types/lotto';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import UsageLimitBanner from '@/components/usage/UsageLimitBanner';
import UsageLimitModal from '@/components/usage/UsageLimitModal';
import MemberGate from '@/components/auth/MemberGate';
import { Dices, Trash2, Rocket, Coins, Gem, BarChart3, Trophy, Frown, RefreshCw, Target } from 'lucide-react';

// ============================================================
// Types
// ============================================================

interface SimulationMatch {
  round: number;
  drawDate: string;
  drawNumbers: number[];
  bonusNumber: number;
  matchedNumbers: number[];
  matchedBonus: boolean;
  matchCount: number;
  rank: number; // 0 = no prize, 1-5 = prize rank
  prize: number;
}

interface SimulationSummary {
  totalRounds: number;
  totalInvestment: number;
  totalPrize: number;
  returnRate: number;
  rankCounts: Record<number, number>; // rank -> count
  bestRank: number;
  matches: SimulationMatch[];
}

type PeriodType = 'all' | 'recent100' | 'recent500' | 'custom';

// ============================================================
// Prize estimation
// ============================================================

function estimatePrize(rank: number): number {
  switch (rank) {
    case 1: return 2_000_000_000; // average 1st prize ~20억
    case 2: return 50_000_000;    // average 2nd ~5천만
    case 3: return 1_500_000;     // ~150만
    case 4: return 50_000;        // 5만
    case 5: return 5_000;         // 5천
    default: return 0;
  }
}

function getRankFromMatch(matchCount: number, matchedBonus: boolean): number {
  if (matchCount === 6) return 1;
  if (matchCount === 5 && matchedBonus) return 2;
  if (matchCount === 5) return 3;
  if (matchCount === 4) return 4;
  if (matchCount === 3) return 5;
  return 0;
}

function formatKRW(amount: number): string {
  if (amount >= 100_000_000) {
    const eok = Math.floor(amount / 100_000_000);
    const man = Math.floor((amount % 100_000_000) / 10_000);
    return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
  }
  if (amount >= 10_000) {
    return `${Math.floor(amount / 10_000).toLocaleString()}만원`;
  }
  return `${amount.toLocaleString()}원`;
}

// ============================================================
// Component
// ============================================================

export default function SimulatorPage() {
  // ----------------------------------------------------------
  // State
  // ----------------------------------------------------------
  const [numbers, setNumbers] = useState<(number | null)[]>([null, null, null, null, null, null]);
  const [periodType, setPeriodType] = useState<PeriodType>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [lottoData, setLottoData] = useState<LottoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [result, setResult] = useState<SimulationSummary | null>(null);
  const [showAllResults, setShowAllResults] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showLimitModal, setShowLimitModal] = useState(false);
  const { canUse, recordUsage } = useUsageLimit();

  // ----------------------------------------------------------
  // Derived state
  // ----------------------------------------------------------
  const validNumbers = useMemo(() => {
    const filtered = numbers.filter((n): n is number => n !== null && n >= 1 && n <= 45);
    const unique = new Set(filtered);
    return unique.size === filtered.length ? filtered : [];
  }, [numbers]);

  const isValid = validNumbers.length === 6;

  const maxRound = useMemo(() => {
    if (lottoData.length === 0) return 0;
    return Math.max(...lottoData.map(d => d.round));
  }, [lottoData]);

  // ----------------------------------------------------------
  // Data fetching
  // ----------------------------------------------------------
  const fetchData = useCallback(async () => {
    if (dataLoaded && lottoData.length > 0) return;
    setDataLoading(true);
    try {
      const res = await fetch('/api/lotto/statistics');
      const json = await res.json();
      if (json.success && json.data?.rawData) {
        const sorted = [...json.data.rawData].sort(
          (a: LottoResult, b: LottoResult) => a.round - b.round
        );
        setLottoData(sorted);
        setDataLoaded(true);
      }
    } catch (err) {
      console.error('데이터 로딩 실패:', err);
    } finally {
      setDataLoading(false);
    }
  }, [dataLoaded, lottoData.length]);

  // ----------------------------------------------------------
  // Number input handlers
  // ----------------------------------------------------------
  const handleNumberChange = useCallback((index: number, value: string) => {
    setValidationError('');
    const raw = value.replace(/[^0-9]/g, '');
    if (raw === '') {
      setNumbers(prev => {
        const next = [...prev];
        next[index] = null;
        return next;
      });
      return;
    }
    const num = parseInt(raw, 10);
    if (num < 1 || num > 45) {
      setValidationError('1~45 사이의 숫자를 입력해주세요.');
      return;
    }
    // Check duplicates
    const existing = numbers.filter((n, i) => i !== index && n !== null);
    if (existing.includes(num)) {
      setValidationError('중복된 번호는 입력할 수 없습니다.');
      return;
    }
    setNumbers(prev => {
      const next = [...prev];
      next[index] = num;
      return next;
    });
  }, [numbers]);

  const handleRandom = useCallback(() => {
    setValidationError('');
    const pool = Array.from({ length: 45 }, (_, i) => i + 1);
    const picked: number[] = [];
    for (let i = 0; i < 6; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      picked.push(pool[idx]);
      pool.splice(idx, 1);
    }
    picked.sort((a, b) => a - b);
    setNumbers(picked);
  }, []);

  const handleClear = useCallback(() => {
    setNumbers([null, null, null, null, null, null]);
    setResult(null);
    setValidationError('');
    setShowAllResults(false);
  }, []);

  // ----------------------------------------------------------
  // Simulation
  // ----------------------------------------------------------
  const runSimulation = useCallback(async () => {
    if (!isValid) return;

    // Usage limit check
    if (!canUse('simulator')) {
      setShowLimitModal(true);
      return;
    }

    setLoading(true);
    setResult(null);
    setShowAllResults(false);

    // Ensure data is loaded
    if (!dataLoaded || lottoData.length === 0) {
      await fetchData();
    }

    // Small delay for loading animation
    await new Promise(resolve => setTimeout(resolve, 600));

    // Use latest data from state via closure workaround
    setLottoData(currentData => {
      if (currentData.length === 0) {
        setLoading(false);
        return currentData;
      }

      // Filter by period
      let filtered = [...currentData];
      if (periodType === 'recent100') {
        filtered = filtered.slice(-100);
      } else if (periodType === 'recent500') {
        filtered = filtered.slice(-500);
      } else if (periodType === 'custom') {
        const start = parseInt(customStart) || 1;
        const end = parseInt(customEnd) || currentData[currentData.length - 1].round;
        filtered = filtered.filter(d => d.round >= start && d.round <= end);
      }

      if (filtered.length === 0) {
        setLoading(false);
        return currentData;
      }

      const userNums = new Set(validNumbers);
      const matches: SimulationMatch[] = [];
      const rankCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let totalPrize = 0;
      let bestRank = 0;

      for (const draw of filtered) {
        const drawSet = new Set(draw.numbers);
        const matchedNumbers = validNumbers.filter(n => drawSet.has(n));
        const matchCount = matchedNumbers.length;
        const matchedBonus = userNums.has(draw.bonusNumber);
        const rank = getRankFromMatch(matchCount, matchedBonus);

        if (matchCount >= 3) {
          const prize = rank > 0 ? estimatePrize(rank) : 0;
          totalPrize += prize;
          if (rank > 0) {
            rankCounts[rank] = (rankCounts[rank] || 0) + 1;
            if (bestRank === 0 || rank < bestRank) bestRank = rank;
          }

          matches.push({
            round: draw.round,
            drawDate: draw.drawDate,
            drawNumbers: draw.numbers,
            bonusNumber: draw.bonusNumber,
            matchedNumbers,
            matchedBonus,
            matchCount,
            rank,
            prize,
          });
        }
      }

      // Sort matches: best rank first, then by round desc
      matches.sort((a, b) => {
        if (a.rank !== b.rank) {
          if (a.rank === 0) return 1;
          if (b.rank === 0) return -1;
          return a.rank - b.rank;
        }
        return b.round - a.round;
      });

      const totalInvestment = filtered.length * 1000;
      const returnRate = totalInvestment > 0
        ? ((totalPrize - totalInvestment) / totalInvestment) * 100
        : 0;

      setResult({
        totalRounds: filtered.length,
        totalInvestment,
        totalPrize,
        returnRate,
        rankCounts,
        bestRank,
        matches,
      });

      setLoading(false);

      // Record usage
      recordUsage('simulator');

      // 게임화 배지 카운터
      if (typeof window !== 'undefined' && (window as any).__trackAction) {
        (window as any).__trackAction('simulatorRun');
      }

      return currentData;
    });
  }, [isValid, dataLoaded, lottoData.length, fetchData, periodType, customStart, customEnd, validNumbers, canUse, recordUsage]);

  // Load data on mount
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ----------------------------------------------------------
  // Render helpers
  // ----------------------------------------------------------
  const rankBadgeVariant = (rank: number): 'warning' | 'primary' | 'secondary' | 'info' | 'success' | 'default' => {
    switch (rank) {
      case 1: return 'warning';
      case 2: return 'primary';
      case 3: return 'secondary';
      case 4: return 'info';
      case 5: return 'success';
      default: return 'default';
    }
  };

  const periodTabs: { id: PeriodType; label: string }[] = [
    { id: 'all', label: '전체 회차' },
    { id: 'recent100', label: '최근 100회' },
    { id: 'recent500', label: '최근 500회' },
    { id: 'custom', label: '직접 입력' },
  ];

  const displayedMatches = showAllResults ? result?.matches : result?.matches.slice(0, 20);

  // ----------------------------------------------------------
  // JSX
  // ----------------------------------------------------------
  return (
    <MemberGate featureName="당첨 시뮬레이터" featureIcon={<Dices className="w-10 h-10 mx-auto" />} featureDesc="내 번호로 역대 당첨을 시뮬레이션해요">
      <Breadcrumb items={[
        { label: '홈', href: '/' },
        { label: '당첨 시뮬레이터' },
      ]} />

      <div className="max-w-3xl mx-auto">
        {/* Page header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              boxShadow: '0 8px 24px rgba(211, 97, 53, 0.3)',
            }}
          >
            <Dices className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            로또 당첨 시뮬레이터
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            내가 매주 같은 번호를 샀다면? 과거 전 회차 당첨 결과를 확인해보세요
          </p>
        </div>

        <UsageLimitBanner feature="simulator" />

        {/* ========== Number Input Section ========== */}
        <Card variant="glass" padding="lg" className="mb-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
                나의 번호 선택 (1~45)
              </label>
              <div className="grid grid-cols-6 gap-2 sm:gap-3">
                {numbers.map((num, idx) => (
                  <div key={idx} className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={2}
                      value={num !== null ? String(num) : ''}
                      onChange={(e) => handleNumberChange(idx, e.target.value)}
                      placeholder={String(idx + 1)}
                      className={cn(
                        'w-full text-center py-3 sm:py-4 rounded-xl text-lg sm:text-xl font-bold',
                        'transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:scale-105',
                        num !== null
                          ? 'shadow-md'
                          : ''
                      )}
                      style={{
                        backgroundColor: num !== null ? 'var(--primary)' : 'var(--bg)',
                        color: num !== null ? 'white' : 'var(--text)',
                        border: num !== null ? '2px solid var(--primary)' : '2px solid var(--border)',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Validation error */}
              {validationError && (
                <p className="text-sm mt-2 text-red-500 font-medium animate-fadeInUp">
                  {validationError}
                </p>
              )}

              {/* Status indicator */}
              {!validationError && (
                <p className="text-sm mt-2" style={{ color: 'var(--text-tertiary)' }}>
                  {validNumbers.length === 6
                    ? '6개 번호가 모두 입력되었습니다!'
                    : `${validNumbers.length}/6 번호 입력됨`}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button
                variant="gradient"
                size="md"
                onClick={handleRandom}
                className="flex-1"
                icon={<Dices className="w-4 h-4" />}
              >
                랜덤 생성
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={handleClear}
                className="flex-1"
                icon={<Trash2 className="w-4 h-4" />}
              >
                초기화
              </Button>
            </div>

            {/* Show selected numbers as lotto balls */}
            {isValid && (
              <div className="pt-3 border-t" style={{ borderColor: 'var(--border-light)' }}>
                <p className="text-xs font-medium mb-3 text-center" style={{ color: 'var(--text-tertiary)' }}>
                  선택한 번호
                </p>
                <LottoNumbers
                  numbers={validNumbers.sort((a, b) => a - b)}
                  size="md"
                  animated
                />
              </div>
            )}
          </div>
        </Card>

        {/* ========== Period Selection ========== */}
        <Card variant="glass" padding="lg" className="mb-6">
          <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
            조회 기간
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {periodTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPeriodType(tab.id)}
                className={cn(
                  'px-3 py-2.5 rounded-xl text-sm font-medium',
                  'transition-all duration-200',
                  'hover:-translate-y-0.5 hover:shadow-md',
                  'active:scale-95'
                )}
                style={{
                  backgroundColor: periodType === tab.id ? 'var(--primary)' : 'var(--surface-hover)',
                  color: periodType === tab.id ? 'white' : 'var(--text-secondary)',
                  border: periodType === tab.id ? 'none' : '1px solid var(--border)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Custom range inputs */}
          {periodType === 'custom' && (
            <div className="flex items-center gap-3 mt-4 animate-fadeInUp">
              <input
                type="number"
                min={1}
                max={maxRound}
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                placeholder="시작 회차"
                className={cn(
                  'flex-1 px-4 py-3 rounded-xl text-sm font-medium',
                  'transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50'
                )}
                style={{
                  backgroundColor: 'var(--bg)',
                  color: 'var(--text)',
                  border: '2px solid var(--border)',
                }}
              />
              <span className="text-sm font-bold" style={{ color: 'var(--text-tertiary)' }}>~</span>
              <input
                type="number"
                min={1}
                max={maxRound}
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                placeholder="끝 회차"
                className={cn(
                  'flex-1 px-4 py-3 rounded-xl text-sm font-medium',
                  'transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50'
                )}
                style={{
                  backgroundColor: 'var(--bg)',
                  color: 'var(--text)',
                  border: '2px solid var(--border)',
                }}
              />
            </div>
          )}

          {/* Data status */}
          {dataLoading && (
            <p className="text-xs mt-3 animate-pulse" style={{ color: 'var(--text-tertiary)' }}>
              데이터 로딩 중...
            </p>
          )}
          {dataLoaded && lottoData.length > 0 && (
            <p className="text-xs mt-3" style={{ color: 'var(--text-tertiary)' }}>
              총 {lottoData.length}회차 데이터 (1회~{maxRound}회)
            </p>
          )}
        </Card>

        {/* ========== Simulation Button ========== */}
        <div className="mb-8">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!isValid || dataLoading}
            loading={loading}
            onClick={runSimulation}
            icon={!loading ? <Rocket className="w-4 h-4" /> : undefined}
            className="text-base"
          >
            {loading ? '시뮬레이션 분석 중...' : '시뮬레이션 시작'}
          </Button>
        </div>

        {/* ========== Results Section ========== */}
        {result && (
          <div className="space-y-5 animate-fadeInUp">
            {/* Hero summary card */}
            <div
              className="rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden"
              style={{
                background: result.bestRank >= 1 && result.bestRank <= 3
                  ? 'linear-gradient(135deg, #FFD700, #D36135)'
                  : 'linear-gradient(135deg, var(--primary), var(--secondary))',
              }}
            >
              {/* Decorative elements */}
              <div
                className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }}
              />
              <div
                className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }}
              />

              <div className="relative z-10 space-y-2">
                {result.bestRank >= 1 && result.bestRank <= 3 ? (
                  <>
                    <p className="text-lg text-white/90 font-bold">
                      최고 {PRIZE_RANKS[result.bestRank as keyof typeof PRIZE_RANKS]?.name} 당첨!
                    </p>
                    <p className="text-4xl md:text-5xl font-black text-white">
                      {formatKRW(result.totalPrize)}
                    </p>
                    <p className="text-sm text-white/70">예상 총 당첨금</p>
                  </>
                ) : result.bestRank >= 4 ? (
                  <>
                    <p className="text-lg text-white/90 font-bold">
                      최고 {PRIZE_RANKS[result.bestRank as keyof typeof PRIZE_RANKS]?.name} 당첨
                    </p>
                    <p className="text-3xl md:text-4xl font-black text-white">
                      {formatKRW(result.totalPrize)}
                    </p>
                    <p className="text-sm text-white/70">예상 총 당첨금</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg text-white/90 font-bold">아쉽지만 당첨 이력 없음</p>
                    <p className="text-3xl md:text-4xl font-black text-white">0원</p>
                    <p className="text-sm text-white/70">다른 번호로 도전해보세요!</p>
                  </>
                )}
              </div>
            </div>

            {/* Summary cards grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Total investment */}
              <Card variant="glass" padding="sm">
                <div className="text-center space-y-1 py-1">
                  <p className="text-2xl"><Coins className="w-6 h-6 mx-auto" /></p>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    총 투자금
                  </p>
                  <p className="text-sm sm:text-base font-bold" style={{ color: 'var(--text)' }}>
                    {formatKRW(result.totalInvestment)}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {result.totalRounds.toLocaleString()}회차
                  </p>
                </div>
              </Card>

              {/* Total prize */}
              <Card variant="glass" padding="sm">
                <div className="text-center space-y-1 py-1">
                  <p className="text-2xl"><Gem className="w-6 h-6 mx-auto" /></p>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    예상 당첨금
                  </p>
                  <p className="text-sm sm:text-base font-bold" style={{
                    color: result.totalPrize > 0 ? '#10B981' : 'var(--text)',
                  }}>
                    {formatKRW(result.totalPrize)}
                  </p>
                </div>
              </Card>

              {/* Return rate */}
              <Card variant="glass" padding="sm">
                <div className="text-center space-y-1 py-1">
                  <p className="text-2xl"><BarChart3 className="w-6 h-6 mx-auto" /></p>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    수익률
                  </p>
                  <p className="text-sm sm:text-base font-bold" style={{
                    color: result.returnRate > 0 ? '#10B981' : '#EF4444',
                  }}>
                    {result.returnRate > 0 ? '+' : ''}{result.returnRate.toFixed(1)}%
                  </p>
                </div>
              </Card>

              {/* Total wins */}
              <Card variant="glass" padding="sm">
                <div className="text-center space-y-1 py-1">
                  <p className="text-2xl"><Trophy className="w-6 h-6 mx-auto" /></p>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    총 당첨 횟수
                  </p>
                  <p className="text-sm sm:text-base font-bold" style={{ color: 'var(--text)' }}>
                    {result.matches.filter(m => m.rank > 0).length}회
                  </p>
                </div>
              </Card>
            </div>

            {/* Rank breakdown */}
            <Card variant="glass" padding="md">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
                등수별 당첨 현황
              </h3>
              <div className="space-y-2.5">
                {([1, 2, 3, 4, 5] as const).map((rank) => {
                  const count = result.rankCounts[rank] || 0;
                  const info = PRIZE_RANKS[rank];
                  return (
                    <div
                      key={rank}
                      className={cn(
                        'flex items-center justify-between py-2.5 px-3 rounded-xl transition-all duration-200',
                        count > 0 ? 'shadow-sm' : ''
                      )}
                      style={{
                        backgroundColor: count > 0 ? 'var(--surface-hover)' : 'transparent',
                        border: count > 0 ? '1px solid var(--border)' : '1px solid transparent',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant={count > 0 ? rankBadgeVariant(rank) : 'default'} size="md">
                          {info.name}
                        </Badge>
                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          {info.description}
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className={cn('text-sm font-bold', count > 0 && 'text-primary')}
                          style={{ color: count > 0 ? undefined : 'var(--text-tertiary)' }}
                        >
                          {count}회
                        </span>
                        {count > 0 && (
                          <span className="text-xs ml-2" style={{ color: 'var(--text-secondary)' }}>
                            ({formatKRW(estimatePrize(rank) * count)})
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Detailed results table */}
            {result.matches.length > 0 && (
              <Card variant="glass" padding="md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                    상세 결과 (3개 이상 일치)
                  </h3>
                  <Badge variant="info" size="sm">
                    {result.matches.length}건
                  </Badge>
                </div>

                <div className="space-y-3">
                  {displayedMatches?.map((match, idx) => (
                    <div
                      key={match.round}
                      className={cn(
                        'rounded-xl p-3 sm:p-4 transition-all duration-200',
                        idx === 0 && result.bestRank > 0 && result.bestRank <= 3
                          ? 'ring-2 ring-yellow-400/50'
                          : ''
                      )}
                      style={{
                        backgroundColor: 'var(--surface-hover)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {/* Header row */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                            {match.round}회
                          </span>
                          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            {match.drawDate}
                          </span>
                        </div>
                        {match.rank > 0 ? (
                          <Badge variant={rankBadgeVariant(match.rank)} size="sm">
                            {PRIZE_RANKS[match.rank as keyof typeof PRIZE_RANKS]?.name} 당첨!
                          </Badge>
                        ) : (
                          <Badge variant="default" size="sm">
                            {match.matchCount}개 일치
                          </Badge>
                        )}
                      </div>

                      {/* Draw numbers */}
                      <div className="mb-2">
                        <LottoNumbers
                          numbers={match.drawNumbers}
                          bonusNumber={match.matchedBonus || match.matchCount >= 5 ? match.bonusNumber : undefined}
                          size="xs"
                        />
                      </div>

                      {/* Matched info */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          일치:
                        </span>
                        {match.matchedNumbers.map(n => (
                          <span
                            key={n}
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: 'var(--primary)' }}
                          >
                            {n}
                          </span>
                        ))}
                        {match.matchedBonus && (
                          <span className="text-xs font-medium text-yellow-500">
                            +보너스
                          </span>
                        )}
                        {match.prize > 0 && (
                          <span className="text-xs font-bold ml-auto" style={{ color: '#10B981' }}>
                            {formatKRW(match.prize)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Show more button */}
                {result.matches.length > 20 && !showAllResults && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllResults(true)}
                    >
                      나머지 {result.matches.length - 20}건 더 보기
                    </Button>
                  </div>
                )}
                {showAllResults && result.matches.length > 20 && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllResults(false)}
                    >
                      접기
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {/* No matches at all */}
            {result.matches.length === 0 && (
              <Card variant="glass" className="text-center py-10">
                <div className="space-y-3">
                  <span className="block"><Frown className="w-12 h-12 mx-auto" /></span>
                  <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {result.totalRounds.toLocaleString()}회차 동안 3개 이상 일치한 적이 없습니다
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    다른 번호로 다시 시도해보세요!
                  </p>
                </div>
              </Card>
            )}

            {/* Fun stats / tip */}
            <Card variant="outlined" padding="sm">
              <div className="space-y-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                <p>* 1등/2등 당첨금은 회차별 판매량에 따라 달라지므로 평균 예상 금액으로 계산됩니다.</p>
                <p>* 3등: 약 150만원, 4등: 5만원 (고정), 5등: 5천원 (고정)</p>
                <p>* 실제 당첨금과 차이가 있을 수 있으며, 본 시뮬레이션은 재미 목적으로 제공됩니다.</p>
              </div>
            </Card>

            {/* Try again button */}
            <div className="text-center pb-4">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  handleRandom();
                  setResult(null);
                  setShowAllResults(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                다른 번호로 다시 시도
              </Button>
            </div>
          </div>
        )}

        {/* Empty state (before simulation) */}
        {!result && !loading && (
          <Card variant="glass" className="text-center py-12">
            <div className="space-y-3">
              <span className="block"><Target className="w-12 h-12 mx-auto" /></span>
              <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>
                번호 6개를 선택하고 시뮬레이션을 시작하세요
              </p>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                과거 모든 회차에 대해 당첨 여부를 분석합니다
              </p>
            </div>
          </Card>
        )}
      </div>

      <UsageLimitModal
        feature="simulator"
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
      />
    </MemberGate>
  );
}
