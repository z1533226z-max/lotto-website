'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import LottoNumbers from './LottoNumbers';
import { formatDate, formatCurrency, getNextDrawTime, formatCountdown } from '@/lib/utils';
import type { LottoResult } from '@/types/lotto';

const LatestResult: React.FC = () => {
  const [result, setResult] = useState<LottoResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string>('');
  const [searchRound, setSearchRound] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);

  // 실제 최신 로또 데이터 로드
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

  // 카운트다운 업데이트
  useEffect(() => {
    const updateCountdown = () => {
      const nextDraw = getNextDrawTime();
      setCountdown(formatCountdown(nextDraw));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // 1분마다 업데이트

    return () => clearInterval(interval);
  }, []);

  // 회차 검색 함수
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
      
      // 목업 데이터 경고 표시
      if (data.source === 'mock_data') {
        alert('⚠️ 해당 회차의 실제 데이터가 없어 임시 데이터를 표시합니다.');
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

  // 최신 결과로 돌아가기
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

  // 로딩 상태
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="space-y-6 text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">실제 로또 데이터를 불러오는 중...</p>
        </div>
      </Card>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
        <div className="space-y-6 text-center py-12">
          <div className="text-red-500 text-4xl">⚠️</div>
          <h2 className="text-xl font-bold text-red-700">데이터 로드 실패</h2>
          <p className="text-red-600">{error}</p>
          <p className="text-sm text-red-500">
            로또 당첨번호는 반드시 공식 데이터여야 하므로<br/>
            연결 실패 시 표시하지 않습니다.
          </p>
          <button
            onClick={handleBackToLatest}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </Card>
    );
  }

  // 데이터가 없는 경우
  if (!result) {
    return (
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="space-y-6 text-center py-12">
          <p className="text-gray-600">로또 데이터가 없습니다.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            🏆 {result.round}회 당첨번호
          </h1>
          <p className="text-gray-600">
            {formatDate(result.drawDate)} 추첨
          </p>
        </div>

        {/* 당첨번호 - 애니메이션 없이 정적 표시 */}
        <div className="flex justify-center">
          <LottoNumbers 
            numbers={result.numbers} 
            bonusNumber={result.bonusNumber}
            size="lg"
            animated={false}
          />
        </div>

        {/* 당첨 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">1등 당첨금</h3>
            <p className="text-xl font-bold text-primary">
              {formatCurrency(result.prizeMoney.first)}
            </p>
            <p className="text-sm text-gray-500">
              {result.prizeMoney.firstWinners}명 당첨
            </p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">다음 추첨까지</h3>
            <p className="text-xl font-bold text-secondary">
              {countdown}
            </p>
            <p className="text-sm text-gray-500">
              매주 토요일 20:45
            </p>
          </div>
        </div>

        {/* 회차 검색 */}
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">회차별 검색</h3>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="회차 입력 (예: 1209)"
              value={searchRound}
              onChange={(e) => setSearchRound(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              min="1"
              max="9999"
              disabled={isSearching}
            />
            <button
              onClick={() => handleSearch(searchRound)}
              disabled={isSearching || !searchRound}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                '검색'
              )}
            </button>
            {result.round && (
              <button
                onClick={handleBackToLatest}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
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