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
import type { NumberStatistics } from '@/types/lotto';

const NumberGenerator: React.FC = () => {
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [marketingText, setMarketingText] = useState('');
  const [virtualUsers, setVirtualUsers] = useState(generateVirtualUserCount());
  const [showSuccess, setShowSuccess] = useState(false);
  
  // 통계 데이터 관련 상태
  const [statistics, setStatistics] = useState<NumberStatistics[] | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const [totalRounds, setTotalRounds] = useState<number>(0);

  // 통계 데이터 로딩
  useEffect(() => {
    const loadStatistics = async () => {
      const loadStartTime = Date.now();
      console.time('Client Statistics Loading');
      
      try {
        setIsLoadingStats(true);
        setStatsError(null);
        
        console.log('통계 데이터 로딩 시작...');
        
        // 타임아웃과 함께 fetch 실행
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃
        
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
        
        // 데이터 유효성 확인
        if (!Array.isArray(statsData) || statsData.length !== 45) {
          throw new Error('통계 데이터가 유효하지 않습니다');
        }
        
        const loadEndTime = Date.now();
        const loadTime = loadEndTime - loadStartTime;
        
        setStatistics(statsData);
        setTotalRounds(result.data?.maxRound || statsData.length > 0 ? result.data?.maxRound || 0 : 0);
        setAiStatus('ready');
        
        console.log(`통계 데이터 로딩 완료: ${statsData.length}개 번호, 로딩시간: ${loadTime}ms`);
        console.log(`캐시 상태: ${result.stats?.cacheHit ? 'HIT' : 'MISS'}`);
        console.log(`API 응답시간: ${result.stats?.responseTime || 'N/A'}`);
        
        // 성능 점수 계산
        const performanceScore = loadTime < 1000 ? 'EXCELLENT' : 
                                loadTime < 3000 ? 'GOOD' : 
                                loadTime < 5000 ? 'FAIR' : 'POOR';
        
        console.log(`클라이언트 성능 점수: ${performanceScore}`);
        
      } catch (error) {
        const loadEndTime = Date.now();
        const loadTime = loadEndTime - loadStartTime;
        
        if (error instanceof Error && error.name === 'AbortError') {
          console.error(`통계 데이터 로딩 타임아웃: ${loadTime}ms`);
          setStatsError('요청 시간이 초과되었습니다 (10초)');
        } else {
          console.error(`통계 데이터 로딩 실패 (${loadTime}ms):`, error);
          setStatsError(error instanceof Error ? error.message : '알 수 없는 오류');
        }
        
        setAiStatus('fallback');
        setStatistics(null);
        
      } finally {
        setIsLoadingStats(false);
        console.timeEnd('Client Statistics Loading');
      }
    };
    
    loadStatistics();
  }, []);

  const generateNumbers = async () => {
    const generateStartTime = Date.now();
    console.time('Number Generation Performance');
    
    setIsGenerating(true);
    setShowSuccess(false);
    
    // 마케팅 문구 설정
    setMarketingText(getRandomMarketingText());
    
    // 가상 사용자 수 업데이트
    setVirtualUsers(generateVirtualUserCount());
    
    try {
      // 로딩 애니메이션 (3초)
      await delay(ANIMATION_DELAYS.GENERATION_TIME);
      
      // 번호 생성 성능 측정
      const numberGenStartTime = Date.now();
      const numbers = NumberGen.generateAINumbers(statistics || undefined);
      const numberGenEndTime = Date.now();
      
      // 번호 품질 검증
      const isValidNumbers = numbers.length === 6 && 
                           numbers.every(n => n >= 1 && n <= 45) && 
                           new Set(numbers).size === 6;
      
      if (!isValidNumbers) {
        throw new Error('생성된 번호가 유효하지 않습니다');
      }
      
      setGeneratedNumbers(numbers);
      
      // 사용자 활동 기록 (게임화 시스템)
      if (typeof window !== 'undefined' && (window as any).recordUserActivity) {
        (window as any).recordUserActivity('prediction');
      }
      
      const generateEndTime = Date.now();
      const totalGenerationTime = generateEndTime - generateStartTime;
      const algorithmTime = numberGenEndTime - numberGenStartTime;
      
      console.log(`번호 생성 완료: [${numbers.join(', ')}]`);
      console.log(`총 생성 시간: ${totalGenerationTime}ms, 알고리즘 시간: ${algorithmTime}ms`);
      console.log(`AI 모드: ${aiStatus}, 통계 데이터: ${statistics ? '사용' : '미사용'}`);
      
      // 생성 완료 애니메이션
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      
      // 이벤트 추적 (GA4) - 성능 정보 포함
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'ai_numbers_generated', {
          numbers: numbers.join(','),
          timestamp: new Date().toISOString(),
          ai_mode: aiStatus === 'ready' ? 'statistical' : 'fallback',
          generation_time_ms: totalGenerationTime,
          algorithm_time_ms: algorithmTime,
          statistics_available: statistics !== null
        });
      }
      
    } catch (error) {
      console.error('번호 생성 중 오류:', error);
      
      // 에러 발생 시 fallback으로 랜덤 번호 생성
      const fallbackNumbers = NumberGen.generateRandomNumbers();
      setGeneratedNumbers(fallbackNumbers);
      
      console.log(`Fallback 번호 생성: [${fallbackNumbers.join(', ')}]`);
      
    } finally {
      setIsGenerating(false);
      console.timeEnd('Number Generation Performance');
    }
  };

  const handleCopyNumbers = async () => {
    if (generatedNumbers.length === 0) return;
    
    const numbersText = generatedNumbers.join(', ');
    const success = await copyToClipboard(numbersText);
    
    if (success && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'numbers_copied', {
        numbers: numbersText
      });
    }
    
    // 사용자에게 복사 완료 알림 (간단한 방법)
    alert(success ? '번호가 클립보드에 복사되었습니다!' : '복사에 실패했습니다.');
  };

  const handleSaveNumbers = () => {
    if (generatedNumbers.length === 0) return;
    
    const savedNumbers = JSON.parse(localStorage.getItem('savedLottoNumbers') || '[]');
    const newSave = {
      id: Date.now().toString(),
      numbers: generatedNumbers,
      createdAt: new Date().toISOString(),
      isAI: true
    };
    
    savedNumbers.push(newSave);
    localStorage.setItem('savedLottoNumbers', JSON.stringify(savedNumbers));
    
    alert('번호가 저장되었습니다!');
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'numbers_saved', {
        numbers: generatedNumbers.join(',')
      });
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="text-center space-y-6">
        {/* 헤더 */}
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            🤖 AI 추천번호
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            {marketingText || getRandomMarketingText()}
          </p>
          
          {/* AI 상태 표시 */}
          <div className="flex justify-center">
            {isLoadingStats ? (
              <div className="flex items-center gap-2 text-xs text-gray-500">
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
                <p className="text-lg font-medium text-gray-700">
                  {aiStatus === 'ready' 
                    ? `AI가 ${totalRounds.toLocaleString()}회 통계 데이터를 분석 중...`
                    : 'AI가 고급 패턴을 분석 중...'
                  }
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
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
              {generatedNumbers.length > 0 ? (
                <div className="space-y-6">
                  {/* 성공 메시지 */}
                  <AnimatePresence>
                    {showSuccess && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="bg-green-50 border border-green-200 rounded-lg p-3"
                      >
                        <p className="text-green-800 font-medium">
                          {aiStatus === 'ready' 
                            ? '✨ AI 통계 분석이 완료되었습니다!' 
                            : '✨ AI 패턴 분석이 완료되었습니다!'
                          }
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 생성된 번호 */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                      {aiStatus === 'ready' 
                        ? '📊 AI 통계 분석 결과' 
                        : '🧠 AI 패턴 분석 결과'
                      }
                    </h3>
                    <LottoNumbers 
                      numbers={generatedNumbers} 
                      size="lg" 
                      animated={true}
                      className="justify-center"
                    />
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="flex justify-center gap-3 flex-wrap">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={handleCopyNumbers}
                      className="min-w-[100px]"
                    >
                      📋 복사
                    </Button>
                    <Button
                      variant="outline"
                      size="md"
                      onClick={handleSaveNumbers}
                      className="min-w-[100px]"
                    >
                      💾 저장
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 빈 번호 슬롯 */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                      🎯 AI가 선택할 번호
                    </h3>
                    <div className="flex justify-center gap-2 flex-wrap">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300"
                        >
                          <span className="text-gray-400 text-lg md:text-xl font-bold">?</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500">
                      💡 Tip: {aiStatus === 'ready' 
                        ? `${totalRounds.toLocaleString()}회차 실제 데이터를 기반으로 AI가 분석합니다`
                        : '고급 수학적 패턴을 통해 번호를 추천합니다'
                      }
                    </p>
                    {statsError && (
                      <p className="text-xs text-orange-500">
                        ⚠️ 통계 데이터 로딩 실패: {statsError}
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
                🎯 AI 번호 생성하기
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 가상 활동 통계 */}
        <motion.div
          className="border-t border-gray-100 pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-xs text-gray-400">
            ⚡ 지금 <span className="font-bold text-primary">{virtualUsers}명</span>이 AI 분석번호를 확인했습니다!
          </p>
        </motion.div>
      </div>
    </Card>
  );
};

export default NumberGenerator;