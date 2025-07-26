'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import { safeLocalStorage } from '@/lib/utils';

interface UserStats {
  predictionsGenerated: number;
  totalScore: number;
  weeklyScore: number;
  longestStreak: number;
  currentStreak: number;
  joinDate: string;
  lastActive: string;
}

interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: number;
  completed: boolean;
}

const UserEngagementPanel: React.FC = () => {
  // 사용자 통계 상태
  const [userStats, setUserStats] = useState<UserStats>({
    predictionsGenerated: 0,
    totalScore: 0,
    weeklyScore: 0,
    longestStreak: 0,
    currentStreak: 0,
    joinDate: new Date().toISOString(),
    lastActive: new Date().toISOString()
  });

  const [weeklyRanking, setWeeklyRanking] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // 이번 주 도전과제 생성
  const weeklyChallenge = useMemo<WeeklyChallenge>(() => {
    const challenges = [
      {
        id: 'weekly_generations',
        title: '🎯 주간 번호 생성',
        description: '이번 주에 AI 번호를 10번 생성하세요',
        target: 10,
        reward: 100
      },
      {
        id: 'pattern_explorer',
        title: '📊 패턴 탐험가',
        description: '다양한 분석 차트를 5번 확인하세요',
        target: 5,
        reward: 75
      },
      {
        id: 'daily_visitor',
        title: '🗓️ 매일 방문',
        description: '연속 3일 방문하여 AI 분석을 확인하세요',
        target: 3,
        reward: 150
      }
    ];

    const currentChallenge = challenges[Math.floor(Date.now() / 86400000) % challenges.length];
    
    return {
      ...currentChallenge,
      progress: Math.min(userStats.predictionsGenerated % currentChallenge.target, currentChallenge.target),
      completed: userStats.predictionsGenerated >= currentChallenge.target
    };
  }, [userStats.predictionsGenerated]);

  // 레벨 계산
  const userLevel = useMemo(() => {
    const baseXP = userStats.totalScore;
    const level = Math.floor(baseXP / 100) + 1;
    const currentLevelXP = baseXP % 100;
    const nextLevelXP = 100;
    
    return {
      level,
      currentLevelXP,
      nextLevelXP,
      progress: (currentLevelXP / nextLevelXP) * 100
    };
  }, [userStats.totalScore]);

  // 사용자 데이터 로드
  useEffect(() => {
    const loadUserData = () => {
      try {
        const savedStats = safeLocalStorage.getItem('lotto-user-stats');
        if (savedStats) {
          const parsedStats = JSON.parse(savedStats);
          setUserStats(prev => ({ ...prev, ...parsedStats }));
        }

        // 주간 랭킹 시뮬레이션 (실제로는 서버에서 계산)
        const weeklyRank = Math.floor(Math.random() * 2000) + 500;
        setWeeklyRanking(weeklyRank);
        
      } catch (error) {
        console.error('사용자 데이터 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // 사용자 활동 기록
  const recordActivity = (activityType: 'prediction' | 'analysis' | 'visit') => {
    const now = new Date().toISOString();
    const today = new Date().toDateString();
    const lastActiveDate = new Date(userStats.lastActive).toDateString();
    
    let scoreIncrease = 0;
    let newStats = { ...userStats };

    switch (activityType) {
      case 'prediction':
        newStats.predictionsGenerated += 1;
        scoreIncrease = 10;
        break;
      case 'analysis':
        scoreIncrease = 5;
        break;
      case 'visit':
        if (lastActiveDate !== today) {
          // 새로운 날짜 방문
          if (new Date(userStats.lastActive).getTime() === new Date(today).getTime() - 86400000) {
            // 연속 방문
            newStats.currentStreak += 1;
            newStats.longestStreak = Math.max(newStats.longestStreak, newStats.currentStreak);
            scoreIncrease = newStats.currentStreak * 5; // 연속 방문 보너스
          } else {
            // 연속성 끊어짐
            newStats.currentStreak = 1;
            scoreIncrease = 5;
          }
        }
        break;
    }

    newStats.totalScore += scoreIncrease;
    newStats.weeklyScore += scoreIncrease;
    newStats.lastActive = now;

    setUserStats(newStats);
    
    // localStorage에 저장
    try {
      safeLocalStorage.setItem('lotto-user-stats', JSON.stringify(newStats));
    } catch (error) {
      console.error('사용자 데이터 저장 실패:', error);
    }
  };

  // 전역에서 사용할 수 있도록 window 객체에 함수 추가
  useEffect(() => {
    (window as any).recordUserActivity = recordActivity;
    
    // 방문 기록 (처음 로드시만)
    const hasRecordedVisit = sessionStorage.getItem('visit-recorded');
    if (!hasRecordedVisit) {
      recordActivity('visit');
      sessionStorage.setItem('visit-recorded', 'true');
    }
    
    return () => {
      delete (window as any).recordUserActivity;
    };
  }, []); // 빈 의존성 배열로 변경

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded"></div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 사용자 레벨 및 점수 */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {userLevel.level}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">레벨 {userLevel.level} 예측 마스터</h3>
                <p className="text-sm text-gray-600">총 {userStats.totalScore.toLocaleString()}점</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-600">주간 랭킹</div>
              <div className="text-xl font-bold text-purple-600">#{weeklyRanking.toLocaleString()}</div>
            </div>
          </div>
          
          {/* 레벨 진행도 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>레벨 {userLevel.level} 진행도</span>
              <span>{userLevel.currentLevelXP}/{userLevel.nextLevelXP} XP</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${userLevel.progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* 주간 도전과제 */}
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <span className="mr-2">🏆</span>
              주간 도전과제
            </h3>
            {weeklyChallenge.completed && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                완료!
              </span>
            )}
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-800">{weeklyChallenge.title}</h4>
              <p className="text-sm text-gray-600">{weeklyChallenge.description}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">진행도</span>
                <span className="font-medium">{weeklyChallenge.progress}/{weeklyChallenge.target}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(weeklyChallenge.progress / weeklyChallenge.target) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">보상</span>
              <span className="font-medium text-orange-600">+{weeklyChallenge.reward} XP</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 활동 통계 */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">📊</span>
            활동 통계
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{userStats.predictionsGenerated}</div>
              <div className="text-sm text-gray-600">번호 생성</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{userStats.currentStreak}</div>
              <div className="text-sm text-gray-600">연속 방문</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{userStats.weeklyScore}</div>
              <div className="text-sm text-gray-600">주간 점수</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{userStats.longestStreak}</div>
              <div className="text-sm text-gray-600">최고 연속</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserEngagementPanel;