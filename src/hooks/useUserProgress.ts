'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { safeLocalStorage } from '@/lib/utils';

// ─── Interfaces ────────────────────────────────────────────

export interface UserProgress {
  visitStreak: number;
  longestStreak: number;
  lastVisitDate: string; // YYYY-MM-DD
  firstVisitDate: string; // YYYY-MM-DD
  actions: {
    aiGenerations: number;
    simulatorRuns: number;
    dreamGenerations: number;
    fortuneGenerations: number;
    pageViews: number;
  };
  unlockedBadges: string[]; // badge ids
  dailyChallengeCompleted: string; // YYYY-MM-DD of last completed challenge
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number; // 0-1
  requirement: number;
  current: number;
}

export interface DailyChallenge {
  id: string;
  name: string;
  description: string;
  actionType: ActionType;
  completed: boolean;
  date: string; // YYYY-MM-DD
}

export type ActionType =
  | 'aiGeneration'
  | 'simulatorRun'
  | 'dreamGeneration'
  | 'fortuneGeneration'
  | 'pageView';

// ─── Constants ─────────────────────────────────────────────

const STORAGE_KEY = 'lotto-user-progress';

const DAILY_CHALLENGES = [
  {
    id: 'daily_ai',
    name: '오늘의 AI 번호 받기',
    description: 'AI 번호 생성기를 사용하여 오늘의 번호를 받아보세요',
    actionType: 'aiGeneration' as ActionType,
  },
  {
    id: 'daily_simulator',
    name: '시뮬레이터 돌려보기',
    description: '로또 시뮬레이터를 1회 실행해보세요',
    actionType: 'simulatorRun' as ActionType,
  },
  {
    id: 'daily_dream',
    name: '꿈번호 뽑기',
    description: '꿈해몽 번호 생성기를 사용해보세요',
    actionType: 'dreamGeneration' as ActionType,
  },
  {
    id: 'daily_fortune',
    name: '행운번호 확인하기',
    description: '오늘의 행운번호를 확인해보세요',
    actionType: 'fortuneGeneration' as ActionType,
  },
  {
    id: 'daily_stats',
    name: '통계 페이지 방문하기',
    description: '통계 분석 페이지를 방문해보세요',
    actionType: 'pageView' as ActionType,
  },
];

// ─── Helpers ───────────────────────────────────────────────

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Simple seeded hash for deterministic daily challenge selection */
function dateHash(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit int
  }
  return Math.abs(hash);
}

function getDefaultProgress(): UserProgress {
  const today = getToday();
  return {
    visitStreak: 0,
    longestStreak: 0,
    lastVisitDate: '',
    firstVisitDate: today,
    actions: {
      aiGenerations: 0,
      simulatorRuns: 0,
      dreamGenerations: 0,
      fortuneGenerations: 0,
      pageViews: 0,
    },
    unlockedBadges: [],
    dailyChallengeCompleted: '',
  };
}

function loadProgress(): UserProgress {
  try {
    const raw = safeLocalStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultProgress();
    const parsed = JSON.parse(raw);
    // Merge with defaults to handle schema evolution
    return { ...getDefaultProgress(), ...parsed, actions: { ...getDefaultProgress().actions, ...parsed.actions } };
  } catch {
    return getDefaultProgress();
  }
}

function saveProgress(progress: UserProgress): void {
  safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function getTotalActions(actions: UserProgress['actions']): number {
  return (
    actions.aiGenerations +
    actions.simulatorRuns +
    actions.dreamGenerations +
    actions.fortuneGenerations +
    actions.pageViews
  );
}

// ─── Badge Definitions ─────────────────────────────────────

function computeBadges(progress: UserProgress): Badge[] {
  const { actions, visitStreak, unlockedBadges } = progress;
  const total = getTotalActions(actions);
  const isFirstVisit = progress.firstVisitDate !== '';

  const defs: Omit<Badge, 'unlocked' | 'progress'>[] = [
    {
      id: 'first_visit',
      name: '첫 방문',
      description: '사이트에 처음 방문했습니다',
      icon: '\uD83D\uDC4B',
      requirement: 1,
      current: isFirstVisit ? 1 : 0,
    },
    {
      id: 'ai_analyst',
      name: 'AI 분석가',
      description: 'AI 번호를 5번 생성했습니다',
      icon: '\uD83E\uDD16',
      requirement: 5,
      current: actions.aiGenerations,
    },
    {
      id: 'simulator_master',
      name: '시뮬레이션 마스터',
      description: '시뮬레이터를 10번 실행했습니다',
      icon: '\uD83C\uDFB0',
      requirement: 10,
      current: actions.simulatorRuns,
    },
    {
      id: 'dream_reader',
      name: '꿈해몽가',
      description: '꿈번호 생성기를 5번 사용했습니다',
      icon: '\uD83C\uDF19',
      requirement: 5,
      current: actions.dreamGenerations,
    },
    {
      id: 'fortune_seeker',
      name: '행운의 주인공',
      description: '행운번호 생성기를 5번 사용했습니다',
      icon: '\uD83C\uDF40',
      requirement: 5,
      current: actions.fortuneGenerations,
    },
    {
      id: 'weekly_visitor',
      name: '7일 연속 방문',
      description: '7일 연속으로 사이트를 방문했습니다',
      icon: '\uD83D\uDD25',
      requirement: 7,
      current: visitStreak,
    },
    {
      id: 'monthly_visitor',
      name: '30일 연속 방문',
      description: '30일 연속으로 사이트를 방문했습니다',
      icon: '\uD83D\uDC8E',
      requirement: 30,
      current: visitStreak,
    },
    {
      id: 'explorer',
      name: '탐험가',
      description: '50개의 페이지를 방문했습니다',
      icon: '\uD83E\uDDED',
      requirement: 50,
      current: actions.pageViews,
    },
    {
      id: 'lotto_expert',
      name: '로또 전문가',
      description: '총 100번의 활동을 기록했습니다',
      icon: '\uD83C\uDFC6',
      requirement: 100,
      current: total,
    },
  ];

  return defs.map((def) => ({
    ...def,
    unlocked: unlockedBadges.includes(def.id) || def.current >= def.requirement,
    progress: Math.min(def.current / def.requirement, 1),
  }));
}

// ─── Hook ──────────────────────────────────────────────────

export interface UseUserProgressReturn {
  progress: UserProgress;
  trackAction: (action: ActionType) => void;
  badges: Badge[];
  dailyChallenge: DailyChallenge;
  streak: number;
  newlyUnlocked: Badge | null;
  clearNewlyUnlocked: () => void;
}

export function useUserProgress(): UseUserProgressReturn {
  const [progress, setProgress] = useState<UserProgress>(getDefaultProgress);
  const [initialized, setInitialized] = useState(false);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Badge | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadProgress();
    const today = getToday();
    const yesterday = getYesterday();

    // Handle visit streak on load
    if (loaded.lastVisitDate === today) {
      // Already visited today, no streak change
    } else if (loaded.lastVisitDate === yesterday) {
      // Consecutive day visit
      loaded.visitStreak += 1;
      loaded.longestStreak = Math.max(loaded.longestStreak, loaded.visitStreak);
      loaded.lastVisitDate = today;
    } else if (loaded.lastVisitDate === '') {
      // First ever visit
      loaded.visitStreak = 1;
      loaded.longestStreak = 1;
      loaded.lastVisitDate = today;
      loaded.firstVisitDate = today;
      if (!loaded.unlockedBadges.includes('first_visit')) {
        loaded.unlockedBadges.push('first_visit');
      }
    } else {
      // Streak broken
      loaded.visitStreak = 1;
      loaded.lastVisitDate = today;
    }

    saveProgress(loaded);
    setProgress(loaded);
    setInitialized(true);
  }, []);

  // Track an action and update progress
  const trackAction = useCallback((action: ActionType) => {
    setProgress((prev) => {
      const next = {
        ...prev,
        actions: { ...prev.actions },
        unlockedBadges: [...prev.unlockedBadges],
      };

      switch (action) {
        case 'aiGeneration':
          next.actions.aiGenerations += 1;
          break;
        case 'simulatorRun':
          next.actions.simulatorRuns += 1;
          break;
        case 'dreamGeneration':
          next.actions.dreamGenerations += 1;
          break;
        case 'fortuneGeneration':
          next.actions.fortuneGenerations += 1;
          break;
        case 'pageView':
          next.actions.pageViews += 1;
          break;
      }

      // Check for newly unlocked badges
      const badgesBefore = computeBadges(prev);
      const badgesAfter = computeBadges(next);

      for (const badge of badgesAfter) {
        if (badge.unlocked && !next.unlockedBadges.includes(badge.id)) {
          next.unlockedBadges.push(badge.id);
          // Find corresponding before-badge
          const beforeBadge = badgesBefore.find((b) => b.id === badge.id);
          if (!beforeBadge?.unlocked) {
            setNewlyUnlocked(badge);
          }
        }
      }

      // Check daily challenge completion
      const today = getToday();
      const challengeIndex = dateHash(today) % DAILY_CHALLENGES.length;
      const todaysChallenge = DAILY_CHALLENGES[challengeIndex];
      if (todaysChallenge.actionType === action && next.dailyChallengeCompleted !== today) {
        next.dailyChallengeCompleted = today;
      }

      saveProgress(next);
      return next;
    });
  }, []);

  // Compute badges from current progress
  const badges = useMemo(() => {
    if (!initialized) return computeBadges(getDefaultProgress());
    return computeBadges(progress);
  }, [progress, initialized]);

  // Compute today's daily challenge
  const dailyChallenge = useMemo((): DailyChallenge => {
    const today = getToday();
    const challengeIndex = dateHash(today) % DAILY_CHALLENGES.length;
    const challenge = DAILY_CHALLENGES[challengeIndex];

    return {
      ...challenge,
      completed: progress.dailyChallengeCompleted === today,
      date: today,
    };
  }, [progress.dailyChallengeCompleted]);

  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked(null);
  }, []);

  return {
    progress,
    trackAction,
    badges,
    dailyChallenge,
    streak: progress.visitStreak,
    newlyUnlocked,
    clearNewlyUnlocked,
  };
}
