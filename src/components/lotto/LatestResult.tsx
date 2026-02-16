'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import LottoNumbers from './LottoNumbers';
import { cn, formatDate, formatCurrency, getNextDrawTime, formatCountdown } from '@/lib/utils';
import type { LottoResult } from '@/types/lotto';

const LatestResult: React.FC = () => {
  const [result, setResult] = useState<LottoResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string>('');
  const [searchRound, setSearchRound] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);

  // Fetch latest lotto data
  useEffect(() => {
    const fetchLatestResult = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/lotto/latest');
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || '로또 데이터를 가져올 수 없습니다.');
        }

        setResult(data.data);
      } catch (err) {
        console.error('최신 로또 데이터 로드 실패:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestResult();
  }, []);

  // Update countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const nextDraw = getNextDrawTime();
      setCountdown(formatCountdown(nextDraw));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  // Search by round number
  const handleSearch = async (round: string) => {
    if (!round || isNaN(Number(round))) {
      alert('올바른 회차 번호를 입력해주세요.');
      return;
    }

    const roundNum = Number(round);
    if (roundNum < 1 || roundNum > 9999) {
      alert('회차 번호는 1~9999 사이여야 합니다.');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(`/api/lotto/round/${round}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `${round}회차 데이터를 찾을 수 없습니다.`);
      }

      setResult(data.data);

      if (data.source === 'mock_data') {
        alert('해당 회차의 실제 데이터가 없어 임시 데이터를 표시합니다.');
      }
    } catch (err) {
      console.error('회차 검색 실패:', err);
      setError(err instanceof Error ? err.message : '회차 검색에 실패했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(searchRound);
    }
  };

  // Back to latest result
  const handleBackToLatest = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/lotto/latest');
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '최신 로또 데이터를 가져올 수 없습니다.');
      }

      setResult(data.data);
      setSearchRound('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터 로드에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card variant="glass" padding="lg">
        <div className="space-y-6 text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p style={{ color: 'var(--text-secondary)' }}>
            실제 로또 데이터를 불러오는 중...
          </p>
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card variant="glass" padding="lg">
        <div className="space-y-6 text-center py-12">
          <div className="text-red-500 text-4xl">!</div>
          <h2 className="text-xl font-bold text-red-500 dark:text-red-400">
            데이터 로드 실패
          </h2>
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            로또 당첨번호는 반드시 공식 데이터여야 하므로
            <br />
            연결 실패 시 표시하지 않습니다.
          </p>
          <button
            onClick={handleBackToLatest}
            className="px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium"
          >
            다시 시도
          </button>
        </div>
      </Card>
    );
  }

  // No data
  if (!result) {
    return (
      <Card variant="glass" padding="lg">
        <div className="space-y-6 text-center py-12">
          <p style={{ color: 'var(--text-secondary)' }}>로또 데이터가 없습니다.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="glass" padding="lg" hover="glow">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-sm text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-slow" />
            최신 당첨 결과
          </div>
          <h1
            className="text-2xl md:text-3xl font-bold"
            style={{ color: 'var(--text)' }}
          >
            {result.round}회 당첨번호
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {formatDate(result.drawDate)} 추첨
          </p>
        </div>

        {/* Winning numbers */}
        <div className="flex justify-center py-4">
          <LottoNumbers
            numbers={result.numbers}
            bonusNumber={result.bonusNumber}
            size="lg"
            animated={false}
          />
        </div>

        {/* Prize and countdown info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First prize */}
          <div
            className="glass-sm rounded-xl p-5"
          >
            <h3
              className="text-sm font-medium mb-1"
              style={{ color: 'var(--text-secondary)' }}
            >
              1등 당첨금
            </h3>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(result.prizeMoney.first)}
            </p>
            <p
              className="text-sm mt-1"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {result.prizeMoney.firstWinners}명 당첨
            </p>
          </div>

          {/* Countdown to next draw */}
          <div
            className="glass-sm rounded-xl p-5"
          >
            <h3
              className="text-sm font-medium mb-1"
              style={{ color: 'var(--text-secondary)' }}
            >
              다음 추첨까지
            </h3>
            <p className="text-2xl font-bold" style={{ color: 'var(--secondary)' }}>
              {countdown}
            </p>
            <p
              className="text-sm mt-1"
              style={{ color: 'var(--text-tertiary)' }}
            >
              매주 토요일 20:45
            </p>
          </div>
        </div>

        {/* Round search */}
        <div className="glass-sm rounded-xl p-5">
          <h3
            className="text-base font-semibold mb-3"
            style={{ color: 'var(--text)' }}
          >
            회차별 검색
          </h3>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="회차 입력 (예: 1209)"
              value={searchRound}
              onChange={(e) => setSearchRound(e.target.value)}
              onKeyPress={handleKeyPress}
              className={cn(
                'flex-1 px-4 py-2.5 rounded-xl',
                'text-sm font-medium',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary/50'
              )}
              style={{
                backgroundColor: 'var(--surface)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
              min="1"
              max="9999"
              disabled={isSearching}
            />
            <button
              onClick={() => handleSearch(searchRound)}
              disabled={isSearching || !searchRound}
              className={cn(
                'px-5 py-2.5 rounded-xl font-medium text-sm text-white',
                'bg-primary hover:bg-primary/90',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-all duration-200'
              )}
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                '검색'
              )}
            </button>
            {result.round && (
              <button
                onClick={handleBackToLatest}
                className={cn(
                  'px-4 py-2.5 rounded-xl font-medium text-sm',
                  'transition-all duration-200',
                  'hover:bg-[var(--surface-hover)]'
                )}
                style={{
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                최신
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default LatestResult;
