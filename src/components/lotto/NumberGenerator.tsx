'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import LottoNumbers from './LottoNumbers';
import { NumberGenerator as NumberGen } from '@/lib/numberGenerator';
import { getRandomMarketingText, copyToClipboard, generateVirtualUserCount, delay } from '@/lib/utils';
import { ANIMATION_DELAYS } from '@/lib/constants';
import { getNextDrawRound } from '@/lib/lottoUtils';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { useAuthSafe } from '@/components/providers/AuthProvider';
import UsageLimitBanner from '@/components/usage/UsageLimitBanner';
import UsageLimitModal from '@/components/usage/UsageLimitModal';
import { Bot, Target, Lock, Sparkles, Cloud, BarChart3, Brain, Copy, Save, Lightbulb, AlertTriangle, Zap } from 'lucide-react';
import type { NumberStatistics } from '@/types/lotto';

const NumberGenerator: React.FC = () => {
  const [generatedSets, setGeneratedSets] = useState<number[][]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [marketingText, setMarketingText] = useState('');
  const [virtualUsers, setVirtualUsers] = useState(generateVirtualUserCount());
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [multiSetMode, setMultiSetMode] = useState(false);
  const [savedToServer, setSavedToServer] = useState(false);

  // 통계 데이터 관련 상태
  const [statistics, setStatistics] = useState<NumberStatistics[] | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const [totalRounds, setTotalRounds] = useState<number>(0);

  // 사용량 제한 & 인증
  const { canUse, recordUsage, isMember } = useUsageLimit();
  const auth = useAuthSafe();

  // 통계 데이터 로딩
  useEffect(() => {
    const loadStatistics = async () => {
      const loadStartTime = Date.now();

      try {
        setIsLoadingStats(true);
        setStatsError(null);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch('/api/lotto/statistics', {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: API 호출 실패`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'API 응답 오류');
        }

        const { statistics: statsData } = result.data;

        if (!Array.isArray(statsData) || statsData.length !== 45) {
          throw new Error('통계 데이터가 유효하지 않습니다');
        }

        const loadTime = Date.now() - loadStartTime;

        setStatistics(statsData);
        setTotalRounds(result.data?.maxRound || 0);
        setAiStatus('ready');
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          setStatsError('요청 시간이 초과되었습니다 (10초)');
        } else {
          setStatsError(error instanceof Error ? error.message : '알 수 없는 오류');
        }
        setAiStatus('fallback');
        setStatistics(null);
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadStatistics();
  }, []);

  // 서버에 번호 저장 (회원만)
  const saveToServer = async (sets: number[][]) => {
    if (!auth?.user) return;
    try {
      const roundTarget = getNextDrawRound();
      const response = await fetch('/api/user/numbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numbers: sets,
          source: 'ai',
          roundTarget,
        }),
      });
      if (response.ok) {
        setSavedToServer(true);
        setTimeout(() => setSavedToServer(false), 3000);
      }
    } catch {
      // 서버 저장 실패 시 무시 (로컬에는 이미 저장됨)
    }
  };

  const generateNumbers = async () => {
    // 사용량 제한 체크
    if (!canUse('ai')) {
      setShowLimitModal(true);
      return;
    }

    const generateStartTime = Date.now();
    setIsGenerating(true);
    setShowSuccess(false);
    setSavedToServer(false);
    setMarketingText(getRandomMarketingText());
    setVirtualUsers(generateVirtualUserCount());

    try {
      await delay(ANIMATION_DELAYS.GENERATION_TIME);

      const setCount = (isMember && multiSetMode) ? 5 : 1;
      const sets: number[][] = [];

      for (let i = 0; i < setCount; i++) {
        const numbers = NumberGen.generateAINumbers(statistics || undefined);
        const isValid = numbers.length === 6 &&
                       numbers.every(n => n >= 1 && n <= 45) &&
                       new Set(numbers).size === 6;

        if (!isValid) {
          sets.push(NumberGen.generateRandomNumbers());
        } else {
          sets.push(numbers);
        }
      }

      setGeneratedSets(sets);

      // 사용량 기록
      recordUsage('ai');

      // 사용자 활동 기록 (게임화 배지 카운터)
      if (typeof window !== 'undefined' && window.__trackAction) {
        window.__trackAction('aiGeneration');
      }

      // 회원이면 서버에 자동 저장
      if (auth?.user) {
        saveToServer(sets);
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      // GA4 이벤트
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'ai_numbers_generated', {
          numbers: sets.map(s => s.join(',')).join(' | '),
          ai_mode: aiStatus === 'ready' ? 'statistical' : 'fallback',
          set_count: setCount,
          is_member: isMember,
        });
      }

    } catch {
      const fallbackNumbers = NumberGen.generateRandomNumbers();
      setGeneratedSets([fallbackNumbers]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyNumbers = async (numbers: number[]) => {
    const numbersText = numbers.join(', ');
    const success = await copyToClipboard(numbersText);
    if (success && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'numbers_copied', { numbers: numbersText });
    }
    alert(success ? '번호가 클립보드에 복사되었습니다!' : '복사에 실패했습니다.');
  };

  const handleSaveNumbers = () => {
    if (generatedSets.length === 0) return;

    // 비회원은 localStorage에 저장
    if (!auth?.user) {
      const savedNumbers = JSON.parse(localStorage.getItem('savedLottoNumbers') || '[]');
      for (const numbers of generatedSets) {
        savedNumbers.push({
          id: Date.now().toString() + Math.random().toString(36).slice(2),
          numbers,
          createdAt: new Date().toISOString(),
          isAI: true
        });
      }
      localStorage.setItem('savedLottoNumbers', JSON.stringify(savedNumbers));
      alert('번호가 저장되었습니다!');
    } else {
      // 회원은 이미 자동 저장됨
      alert('번호가 서버에 자동 저장되었습니다! 마이페이지에서 확인하세요.');
    }
  };

  // 첫 번째 세트 (하위 호환)
  const generatedNumbers = generatedSets[0] || [];

  return (
    <Card className="relative overflow-hidden">
      <div className="text-center space-y-6">
        {/* 헤더 */}
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            <Bot className="w-6 h-6 inline-block mr-1 align-text-bottom" /> AI 추천번호
          </h2>
          <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
            {marketingText || getRandomMarketingText()}
          </p>

          {/* AI 상태 표시 */}
          <div className="flex justify-center">
            {isLoadingStats ? (
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                <div className="w-4 h-4">
                  <LoadingSpinner size="sm" />
                </div>
                <span>AI 분석 엔진 준비 중...</span>
              </div>
            ) : aiStatus === 'ready' ? (
              <div className="flex items-center gap-2 text-xs text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>AI 분석 준비 완료 ({totalRounds.toLocaleString()}회차 데이터)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-orange-600">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span>고급 패턴 분석 모드</span>
              </div>
            )}
          </div>
        </div>

        {/* 사용량 배너 */}
        <UsageLimitBanner feature="ai" />

        {/* 5세트 토글 (회원만) */}
        {isMember ? (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setMultiSetMode(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: !multiSetMode ? 'linear-gradient(135deg, #D36135, #E88A6A)' : 'var(--surface)',
                color: !multiSetMode ? '#fff' : 'var(--text-secondary)',
                border: !multiSetMode ? 'none' : '1px solid var(--border)',
              }}
            >
              1세트
            </button>
            <button
              onClick={() => setMultiSetMode(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: multiSetMode ? 'linear-gradient(135deg, #D36135, #E88A6A)' : 'var(--surface)',
                color: multiSetMode ? '#fff' : 'var(--text-secondary)',
                border: multiSetMode ? 'none' : '1px solid var(--border)',
              }}
            >
              <Target className="w-4 h-4 inline-block mr-1" /> 5세트 한번에
            </button>
          </div>
        ) : (
          <button
            onClick={() => auth?.openAuthModal()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-80"
            style={{
              background: 'var(--surface)',
              color: 'var(--text-secondary)',
              border: '1px dashed var(--border)',
            }}
          >
            <Lock className="w-3.5 h-3.5 inline-block mr-1" /> 회원가입하면 5세트 한번에 생성 가능
          </button>
        )}

        {/* 메인 콘텐츠 */}
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 py-8"
            >
              <LoadingSpinner size="lg" />
              <div className="space-y-2">
                <p className="text-lg font-medium" style={{ color: 'var(--text)' }}>
                  {aiStatus === 'ready'
                    ? `AI가 ${totalRounds.toLocaleString()}회 통계 데이터를 분석 중...`
                    : 'AI가 고급 패턴을 분석 중...'
                  }
                </p>
                <div className="w-full rounded-full h-2" style={{ background: 'var(--surface-hover)' }}>
                  <div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full animate-pulse" style={{ width: '100%' }} />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {generatedSets.length > 0 ? (
                <div className="space-y-6">
                  {/* 성공 메시지 */}
                  <AnimatePresence>
                    {showSuccess && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="rounded-lg p-3"
                        style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}
                      >
                        <p className="font-medium text-green-600">
                          {aiStatus === 'ready'
                            ? <><Sparkles className="w-4 h-4 inline-block mr-1" /> AI 통계 분석이 완료되었습니다!</>
                            : <><Sparkles className="w-4 h-4 inline-block mr-1" /> AI 패턴 분석이 완료되었습니다!</>
                          }
                          {savedToServer && <> (서버에 자동 저장됨 <Cloud className="w-4 h-4 inline-block" />)</>}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 생성된 번호들 */}
                  {generatedSets.map((numbers, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl p-5"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                          {generatedSets.length > 1 ? `세트 ${idx + 1}` : (
                            aiStatus === 'ready' ? <><BarChart3 className="w-4 h-4 inline-block mr-1" /> AI 통계 분석 결과</> : <><Brain className="w-4 h-4 inline-block mr-1" /> AI 패턴 분석 결과</>
                          )}
                        </h3>
                        <button
                          onClick={() => handleCopyNumbers(numbers)}
                          className="text-xs px-2 py-1 rounded transition-colors hover:opacity-70"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          <Copy className="w-3.5 h-3.5 inline-block mr-0.5" /> 복사
                        </button>
                      </div>
                      <LottoNumbers
                        numbers={numbers}
                        size={generatedSets.length > 1 ? 'md' : 'lg'}
                        animated={true}
                        className="justify-center"
                      />
                    </div>
                  ))}

                  {/* 액션 버튼들 */}
                  <div className="flex justify-center gap-3 flex-wrap">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={handleSaveNumbers}
                      className="min-w-[100px]"
                    >
                      <Save className="w-4 h-4 inline-block mr-1" /> {auth?.user ? '서버에 저장됨' : '저장'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 빈 번호 슬롯 */}
                  <div className="rounded-xl p-6" style={{ background: 'var(--surface)' }}>
                    <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>
                      <Target className="w-5 h-5 inline-block mr-1" /> AI가 선택할 번호
                    </h3>
                    <div className="flex justify-center gap-2 flex-wrap">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center border-2 border-dashed"
                          style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)' }}
                        >
                          <span className="text-lg md:text-xl font-bold" style={{ color: 'var(--text-tertiary)' }}>?</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                      <Lightbulb className="w-3.5 h-3.5 inline-block mr-1" /> Tip: {aiStatus === 'ready'
                        ? `${totalRounds.toLocaleString()}회차 실제 데이터를 기반으로 AI가 분석합니다`
                        : '고급 수학적 패턴을 통해 번호를 추천합니다'
                      }
                    </p>
                    {statsError && (
                      <p className="text-xs text-orange-500">
                        <AlertTriangle className="w-3.5 h-3.5 inline-block mr-1" /> 통계 데이터 로딩 실패: {statsError}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 생성 버튼 */}
              <Button
                onClick={generateNumbers}
                size="lg"
                className="w-full md:w-auto min-w-[200px] text-lg py-4"
                disabled={isGenerating}
              >
                <Target className="w-5 h-5 inline-block mr-1" /> AI 번호 {isMember && multiSetMode ? '5세트 ' : ''}생성하기
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 가상 활동 통계 */}
        <motion.div
          className="border-t pt-4"
          style={{ borderColor: 'var(--border)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            <Zap className="w-3.5 h-3.5 inline-block mr-1" /> 지금 <span className="font-bold text-primary">{virtualUsers}명</span>이 AI 분석번호를 확인했습니다!
          </p>
        </motion.div>
      </div>

      {/* 사용량 제한 모달 */}
      <UsageLimitModal
        feature="ai"
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
      />
    </Card>
  );
};

export default NumberGenerator;
