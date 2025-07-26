'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import { safeLocalStorage } from '@/lib/utils';
import type { NumberStatistics } from '@/types/lotto';

interface UserPreferences {
  favoriteNumbers: number[];
  avoidedNumbers: number[];
  preferredSections: string[];
  playStyle: 'conservative' | 'balanced' | 'aggressive';
  riskTolerance: 'low' | 'medium' | 'high';
  analysisHistory: Array<{
    date: string;
    generatedNumbers: number[];
    selectedStrategy: string;
  }>;
}

interface PersonalizedStrategy {
  id: string;
  name: string;
  description: string;
  recommendedNumbers: number[];
  confidence: number;
  reasoning: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

interface PersonalizedInsightsProps {
  statistics?: NumberStatistics[];
  className?: string;
}

const PersonalizedInsights: React.FC<PersonalizedInsightsProps> = ({ 
  statistics = [], 
  className 
}) => {
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    favoriteNumbers: [],
    avoidedNumbers: [],
    preferredSections: [],
    playStyle: 'balanced',
    riskTolerance: 'medium',
    analysisHistory: []
  });

  const [isEditingPreferences, setIsEditingPreferences] = useState(false);

  // 사용자 선호도 로드
  useEffect(() => {
    try {
      const savedPrefs = safeLocalStorage.getItem('lotto-user-preferences');
      if (savedPrefs) {
        const parsedPrefs = JSON.parse(savedPrefs);
        setUserPreferences(prev => ({ ...prev, ...parsedPrefs }));
      }
    } catch (error) {
      console.error('사용자 선호도 로드 실패:', error);
    }
  }, []);

  // 개인화된 전략 생성
  const personalizedStrategy = useMemo<PersonalizedStrategy>(() => {
    if (!statistics || statistics.length === 0) {
      return {
        id: 'loading',
        name: '데이터 로딩 중',
        description: '통계 데이터를 분석하여 맞춤형 전략을 생성하고 있습니다.',
        recommendedNumbers: [],
        confidence: 0,
        reasoning: [],
        riskLevel: 'medium'
      };
    }

    const { playStyle, riskTolerance, favoriteNumbers, avoidedNumbers } = userPreferences;
    
    // 통계 기반 분석
    const avgFrequency = statistics.reduce((sum, stat) => sum + stat.frequency, 0) / statistics.length;
    const maxRound = Math.max(...statistics.map(s => s.lastAppeared));
    
    let candidateNumbers: number[] = [];
    let reasoning: string[] = [];
    let confidence = 70; // 기본 신뢰도
    
    // 플레이 스타일에 따른 번호 선택
    switch (playStyle) {
      case 'conservative':
        // 안정적인 중간 빈도 번호 선호
        candidateNumbers = statistics
          .filter(stat => 
            stat.frequency >= avgFrequency * 0.8 && 
            stat.frequency <= avgFrequency * 1.2 &&
            !avoidedNumbers.includes(stat.number)
          )
          .sort((a, b) => Math.abs(a.frequency - avgFrequency) - Math.abs(b.frequency - avgFrequency))
          .slice(0, 12)
          .map(stat => stat.number);
        
        reasoning.push('안정적인 중간 빈도 번호들을 중심으로 선택');
        reasoning.push('극단적인 핫/콜드 번호를 배제하여 리스크 최소화');
        confidence += 10;
        break;
        
      case 'aggressive':
        // 극단적인 핫/콜드 번호 조합
        const hotNumbers = statistics
          .filter(stat => stat.frequency > avgFrequency * 1.3)
          .sort((a, b) => b.frequency - a.frequency)
          .slice(0, 6);
          
        const coldNumbers = statistics
          .filter(stat => stat.frequency < avgFrequency * 0.7)
          .sort((a, b) => a.frequency - b.frequency)
          .slice(0, 6);
          
        candidateNumbers = [
          ...hotNumbers.map(stat => stat.number),
          ...coldNumbers.map(stat => stat.number)
        ].filter(num => !avoidedNumbers.includes(num));
        
        reasoning.push('고빈도 핫넘버와 저빈도 콜드넘버의 극단적 조합');
        reasoning.push('높은 변동성으로 큰 수익 가능성과 높은 리스크');
        confidence -= 15;
        break;
        
      default: // balanced
        // 균형잡힌 접근
        const hotBalance = statistics
          .filter(stat => stat.frequency > avgFrequency * 1.1)
          .slice(0, 4);
        const mediumBalance = statistics
          .filter(stat => 
            stat.frequency >= avgFrequency * 0.9 && 
            stat.frequency <= avgFrequency * 1.1
          )
          .slice(0, 4);
        const coldBalance = statistics
          .filter(stat => stat.frequency < avgFrequency * 0.9)
          .slice(0, 4);
          
        candidateNumbers = [
          ...hotBalance.map(stat => stat.number),
          ...mediumBalance.map(stat => stat.number),
          ...coldBalance.map(stat => stat.number)
        ].filter(num => !avoidedNumbers.includes(num));
        
        reasoning.push('핫, 미디엄, 콜드 번호의 균형잡힌 조합');
        reasoning.push('안정성과 수익성의 최적 밸런스 추구');
        break;
    }
    
    // 사용자 선호 번호 추가
    if (favoriteNumbers.length > 0) {
      const validFavorites = favoriteNumbers.filter(num => 
        num >= 1 && num <= 45 && !candidateNumbers.includes(num)
      );
      candidateNumbers = [...candidateNumbers, ...validFavorites];
      
      if (validFavorites.length > 0) {
        reasoning.push(`사용자 선호 번호 ${validFavorites.join(', ')}번 포함`);
        confidence += 5;
      }
    }
    
    // 최근성 고려
    if (riskTolerance === 'high') {
      const recentNumbers = statistics
        .filter(stat => maxRound - stat.lastAppeared <= 3)
        .map(stat => stat.number);
      
      candidateNumbers = candidateNumbers.filter(num => 
        recentNumbers.includes(num) || Math.random() > 0.5
      );
      reasoning.push('최근 출현 번호에 더 높은 가중치 적용');
    } else if (riskTolerance === 'low') {
      const stableNumbers = statistics
        .filter(stat => maxRound - stat.lastAppeared > 5 && maxRound - stat.lastAppeared < 15)
        .map(stat => stat.number);
      
      candidateNumbers = candidateNumbers.filter(num => 
        stableNumbers.includes(num) || Math.random() > 0.3
      );
      reasoning.push('안정적인 출현 패턴을 보이는 번호 우선 선택');
      confidence += 5;
    }
    
    // 최종 번호 6개 선택
    const finalNumbers = candidateNumbers
      .sort(() => Math.random() - 0.5) // 셔플
      .slice(0, 6)
      .sort((a, b) => a - b);
    
    // 신뢰도 조정
    if (finalNumbers.length < 6) {
      confidence -= 20;
    }
    
    return {
      id: `${playStyle}-${riskTolerance}-${Date.now()}`,
      name: `${playStyle === 'conservative' ? '안정형' : playStyle === 'aggressive' ? '공격형' : '균형형'} 맞춤 전략`,
      description: `당신의 ${playStyle} 플레이 스타일과 ${riskTolerance} 리스크 성향에 최적화된 전략`,
      recommendedNumbers: finalNumbers,
      confidence: Math.max(30, Math.min(95, confidence)),
      reasoning,
      riskLevel: riskTolerance
    };
  }, [statistics, userPreferences]);

  // 선호도 저장
  const savePreferences = (newPrefs: Partial<UserPreferences>) => {
    const updatedPrefs = { ...userPreferences, ...newPrefs };
    setUserPreferences(updatedPrefs);
    
    try {
      safeLocalStorage.setItem('lotto-user-preferences', JSON.stringify(updatedPrefs));
    } catch (error) {
      console.error('사용자 선호도 저장 실패:', error);
    }
  };

  // 번호 추가/제거 핸들러
  const toggleFavoriteNumber = (number: number) => {
    const newFavorites = userPreferences.favoriteNumbers.includes(number)
      ? userPreferences.favoriteNumbers.filter(n => n !== number)
      : [...userPreferences.favoriteNumbers, number].slice(0, 10); // 최대 10개
    
    savePreferences({ favoriteNumbers: newFavorites });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 맞춤형 전략 카드 */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <span className="mr-2">🎯</span>
              {personalizedStrategy.name}
            </h3>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">신뢰도</span>
              <div className="flex items-center space-x-1">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${personalizedStrategy.confidence}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <span className="text-sm font-medium text-green-600">
                  {personalizedStrategy.confidence}%
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-gray-700 mb-4">{personalizedStrategy.description}</p>
          
          {/* 추천 번호 */}
          {personalizedStrategy.recommendedNumbers.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">추천 번호</h4>
              <div className="flex flex-wrap gap-2">
                {personalizedStrategy.recommendedNumbers.map(number => (
                  <motion.span
                    key={number}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-full font-bold shadow-lg cursor-pointer"
                    onClick={() => toggleFavoriteNumber(number)}
                  >
                    {number}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
          
          {/* 전략 근거 */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">전략 근거</h4>
            <ul className="space-y-1">
              {personalizedStrategy.reasoning.map((reason, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="mr-2 text-green-500">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* 사용자 선호도 설정 */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <span className="mr-2">⚙️</span>
              개인 설정
            </h3>
            <button
              onClick={() => setIsEditingPreferences(!isEditingPreferences)}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {isEditingPreferences ? '완료' : '편집'}
            </button>
          </div>
          
          {isEditingPreferences ? (
            <div className="space-y-4">
              {/* 플레이 스타일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  플레이 스타일
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['conservative', 'balanced', 'aggressive'] as const).map(style => (
                    <button
                      key={style}
                      onClick={() => savePreferences({ playStyle: style })}
                      className={`p-2 text-sm rounded-lg border transition-colors ${
                        userPreferences.playStyle === style
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      {style === 'conservative' ? '안정형' : 
                       style === 'balanced' ? '균형형' : '공격형'}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 리스크 성향 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  리스크 성향
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map(risk => (
                    <button
                      key={risk}
                      onClick={() => savePreferences({ riskTolerance: risk })}
                      className={`p-2 text-sm rounded-lg border transition-colors ${
                        userPreferences.riskTolerance === risk
                          ? 'bg-green-500 text-white border-green-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-green-300'
                      }`}
                    >
                      {risk === 'low' ? '낮음' : risk === 'medium' ? '보통' : '높음'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600">플레이 스타일</div>
                <div className="font-medium text-blue-600">
                  {userPreferences.playStyle === 'conservative' ? '안정형' : 
                   userPreferences.playStyle === 'balanced' ? '균형형' : '공격형'}
                </div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600">리스크 성향</div>
                <div className="font-medium text-green-600">
                  {userPreferences.riskTolerance === 'low' ? '낮음' : 
                   userPreferences.riskTolerance === 'medium' ? '보통' : '높음'}
                </div>
              </div>
            </div>
          )}
          
          {/* 선호 번호 */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              선호 번호 ({userPreferences.favoriteNumbers.length}/10)
            </h4>
            {userPreferences.favoriteNumbers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {userPreferences.favoriteNumbers.map(number => (
                  <span
                    key={number}
                    className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-medium cursor-pointer hover:bg-blue-200"
                    onClick={() => toggleFavoriteNumber(number)}
                  >
                    {number}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                추천 번호를 클릭하여 선호 번호로 추가하세요.
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PersonalizedInsights;