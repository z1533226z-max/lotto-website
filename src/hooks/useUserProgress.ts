'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { safeLocalStorage } from '@/lib/utils';
import { useAuthSafe } from '@/components/providers/AuthProvider';

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
  savedNumbersCount: number;
  matchChecksCount: number;
  multiSetGenerations: number;
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
const SYNC_DEBOUNCE_MS = 3000; // 3 seconds debounce for server sync

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
    savedNumbersCount: 0,
    matchChecksCount: 0,
    multiSetGenerations: 0,
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

/**
 * Merge local and server progress data.
 * Strategy: take the max of each numeric field, merge arrays uniquely,
 * use the most recent valid date for lastVisitDate/dailyChallengeCompleted,
 * and the earliest date for firstVisitDate.
 */
function mergeProgress(local: UserProgress, server: UserProgress): UserProgress {
  const merged: UserProgress = {
    visitStreak: Math.max(local.visitStreak, server.visitStreak),
    longestStreak: Math.max(local.longestStreak, server.longestStreak),
    lastVisitDate: local.lastVisitDate >= server.lastVisitDate ? local.lastVisitDate : server.lastVisitDate,
    firstVisitDate: (local.firstVisitDate && server.firstVisitDate)
      ? (local.firstVisitDate <= server.firstVisitDate ? local.firstVisitDate : server.firstVisitDate)
      : (local.firstVisitDate || server.firstVisitDate),
    actions: {
      aiGenerations: Math.max(local.actions.aiGenerations, server.actions.aiGenerations),
      simulatorRuns: Math.max(local.actions.simulatorRuns, server.actions.simulatorRuns),
      dreamGenerations: Math.max(local.actions.dreamGenerations, server.actions.dreamGenerations),
      fortuneGenerations: Math.max(local.actions.fortuneGenerations, server.actions.fortuneGenerations),
      pageViews: Math.max(local.actions.pageViews, server.actions.pageViews),
    },
    unlockedBadges: Array.from(new Set([...local.unlockedBadges, ...server.unlockedBadges])),
    dailyChallengeCompleted: local.dailyChallengeCompleted >= server.dailyChallengeCompleted
      ? local.dailyChallengeCompleted
      : server.dailyChallengeCompleted,
    savedNumbersCount: Math.max(local.savedNumbersCount || 0, server.savedNumbersCount || 0),
    matchChecksCount: Math.max(local.matchChecksCount || 0, server.matchChecksCount || 0),
    multiSetGenerations: Math.max(local.multiSetGenerations || 0, server.multiSetGenerations || 0),
  };
  return merged;
}

/**
 * Convert server progress row to UserProgress format
 */
function serverToLocal(serverData: any): UserProgress {
  return {
    visitStreak: serverData.visit_streak || 0,
    longestStreak: serverData.longest_streak || 0,
    lastVisitDate: serverData.last_visit_date || '',
    firstVisitDate: serverData.first_visit_date || getToday(),
    actions: {
      aiGenerations: serverData.ai_generations || 0,
      simulatorRuns: serverData.simulator_runs || 0,
      dreamGenerations: serverData.dream_generations || 0,
      fortuneGenerations: serverData.fortune_generations || 0,
      pageViews: serverData.page_views || 0,
    },
    unlockedBadges: serverData.unlocked_badges || [],
    dailyChallengeCompleted: serverData.daily_challenge_completed || '',
    savedNumbersCount: serverData.saved_numbers_count || 0,
    matchChecksCount: serverData.match_checks_count || 0,
    multiSetGenerations: serverData.multi_set_generations || 0,
  };
}

// ─── Badge Definitions ─────────────────────────────────────

function computeBadges(progress: UserProgress, isLoggedIn: boolean = false): Badge[] {
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

  // 회원 전용 배지
  if (isLoggedIn) {
    defs.push(
      {
        id: 'member_badge',
        name: '정식 회원',
        description: '회원가입을 완료했습니다',
        icon: '\u2B50', // ⭐
        requirement: 1,
        current: 1, // 로그인 상태면 항상 달성
      },
      {
        id: 'sync_master',
        name: '동기화 마스터',
        description: '데이터 동기화를 완료했습니다',
        icon: '\u2601\uFE0F', // ☁️
        requirement: 1,
        current: unlockedBadges.includes('sync_master') ? 1 : 0,
      },
      {
        id: 'number_collector',
        name: '번호 수집가',
        description: '50개 이상 번호를 저장했습니다',
        icon: '\uD83D\uDCDA', // 📚
        requirement: 50,
        current: progress.savedNumbersCount || 0,
      },
      {
        id: 'lucky_checker',
        name: '당첨 확인왕',
        description: '당첨 확인을 10회 이상 했습니다',
        icon: '\uD83D\uDD0D', // 🔍
        requirement: 10,
        current: progress.matchChecksCount || 0,
      },
      {
        id: 'multi_set_user',
        name: '다중 분석가',
        description: '5세트 생성을 10회 이상 했습니다',
        icon: '\uD83C\uDFAF', // 🎯
        requirement: 10,
        current: progress.multiSetGenerations || 0,
      },
    );
  }

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
  const auth = useAuthSafe();
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSyncedRef = useRef(false);

  // Debounced server sync
  const syncToServer = useCallback((data: UserProgress) => {
    if (!auth?.user) return;

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        await fetch('/api/user/progress', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        });
      } catch {
        // Silently fail, localStorage is the source of truth locally
      }
    }, SYNC_DEBOUNCE_MS);
  }, [auth?.user]);

  // Load from localStorage on mount + handle visit streak
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

  // Sync with server when user logs in
  useEffect(() => {
    if (!initialized || !auth?.user || hasSyncedRef.current) return;
    hasSyncedRef.current = true;

    (async () => {
      try {
        const res = await fetch('/api/user/progress', { credentials: 'include' });
        if (!res.ok) return;

        const data = await res.json();
        if (!data.success || !data.progress) {
          // No server data yet, push local data to server
          syncToServer(progress);
          // Grant sync_master badge
          if (!progress.unlockedBadges.includes('sync_master')) {
            setProgress((prev) => {
              const next = {
                ...prev,
                unlockedBadges: [...prev.unlockedBadges, 'sync_master'],
              };
              saveProgress(next);
              syncToServer(next);
              return next;
            });
          }
          return;
        }

        // Merge server + local data
        const serverProgress = serverToLocal(data.progress);
        const merged = mergeProgress(progress, serverProgress);

        // Add member_badge and sync_master if not already present
        if (!merged.unlockedBadges.includes('member_badge')) {
          merged.unlockedBadges.push('member_badge');
        }
        if (!merged.unlockedBadges.includes('sync_master')) {
          merged.unlockedBadges.push('sync_master');
        }

        saveProgress(merged);
        setProgress(merged);

        // Push merged data back to server
        syncToServer(merged);
      } catch {
        // Server sync failed, continue with local data
      }
    })();
  }, [initialized, auth?.user, syncToServer]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset sync flag when user logs out
  useEffect(() => {
    if (!auth?.user) {
      hasSyncedRef.current = false;
    }
  }, [auth?.user]);

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
      const isLoggedIn = !!auth?.user;
      const badgesBefore = computeBadges(prev, isLoggedIn);
      const badgesAfter = computeBadges(next, isLoggedIn);

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

      // Sync to server if logged in (debounced)
      if (auth?.user) {
        syncToServer(next);
      }

      return next;
    });
  }, [auth?.user, syncToServer]);

  // Compute badges from current progress
  const badges = useMemo(() => {
    if (!initialized) return computeBadges(getDefaultProgress(), false);
    return computeBadges(progress, !!auth?.user);
  }, [progress, initialized, auth?.user]);

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

  // Cleanup sync timeout on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
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
