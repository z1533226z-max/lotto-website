'use client';

import { useCallback } from 'react';
import { safeLocalStorage } from '@/lib/utils';
import { useAuthSafe } from '@/components/providers/AuthProvider';

// ─── Types ──────────────────────────────────────────
export type LimitedFeature = 'ai' | 'dream' | 'fortune' | 'simulator';

interface WeeklyUsage {
  weekStart: string; // YYYY-MM-DD (월요일)
  ai: number;
  dream: number;
  fortune: number;
  simulator: number;
}

// ─── Constants ──────────────────────────────────────
const STORAGE_KEY = 'lotto-weekly-usage';

const WEEKLY_LIMITS_GUEST: Record<LimitedFeature, number> = {
  ai: 3,
  dream: 3,
  fortune: 3,
  simulator: 3,
};

const WEEKLY_LIMITS_MEMBER: Record<LimitedFeature, number> = {
  ai: 10,
  dream: 10,
  fortune: 10,
  simulator: 10,
};

// ─── Helpers ────────────────────────────────────────

/** 이번 주 월요일 날짜 (KST 기준) */
function getWeekStart(): string {
  const now = new Date();
  // KST (UTC+9) 기준
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const day = kst.getUTCDay(); // 0=일 ~ 6=토
  const diff = day === 0 ? 6 : day - 1; // 월요일까지 차이
  const monday = new Date(kst);
  monday.setUTCDate(monday.getUTCDate() - diff);
  return `${monday.getUTCFullYear()}-${String(monday.getUTCMonth() + 1).padStart(2, '0')}-${String(monday.getUTCDate()).padStart(2, '0')}`;
}

function loadUsage(): WeeklyUsage {
  const empty: WeeklyUsage = { weekStart: getWeekStart(), ai: 0, dream: 0, fortune: 0, simulator: 0 };
  try {
    const raw = safeLocalStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as WeeklyUsage;
    // 주가 바뀌면 리셋
    if (parsed.weekStart !== getWeekStart()) {
      return empty;
    }
    return parsed;
  } catch {
    return empty;
  }
}

function saveUsage(usage: WeeklyUsage): void {
  safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
}

// ─── Feature 한글 이름 ──────────────────────────────
const FEATURE_NAMES: Record<LimitedFeature, string> = {
  ai: 'AI 번호 생성',
  dream: '꿈번호 생성',
  fortune: '행운번호 생성',
  simulator: '시뮬레이터',
};

// ─── Hook ───────────────────────────────────────────
export interface UseUsageLimitReturn {
  canUse: (feature: LimitedFeature) => boolean;
  remaining: (feature: LimitedFeature) => number;
  limit: (feature: LimitedFeature) => number;
  recordUsage: (feature: LimitedFeature) => boolean;
  isMember: boolean;
  featureName: (feature: LimitedFeature) => string;
}

export function useUsageLimit(): UseUsageLimitReturn {
  const auth = useAuthSafe();
  const isMember = !!auth?.user;

  const getLimits = useCallback((): Record<LimitedFeature, number> => {
    return isMember ? WEEKLY_LIMITS_MEMBER : WEEKLY_LIMITS_GUEST;
  }, [isMember]);

  const canUse = useCallback((feature: LimitedFeature): boolean => {
    const limits = getLimits();
    const usage = loadUsage();
    return usage[feature] < limits[feature];
  }, [getLimits]);

  const remaining = useCallback((feature: LimitedFeature): number => {
    const limits = getLimits();
    const usage = loadUsage();
    return Math.max(0, limits[feature] - usage[feature]);
  }, [getLimits]);

  const limit = useCallback((feature: LimitedFeature): number => {
    const limits = getLimits();
    return limits[feature];
  }, [getLimits]);

  const recordUsage = useCallback((feature: LimitedFeature): boolean => {
    const limits = getLimits();
    const usage = loadUsage();
    if (usage[feature] >= limits[feature]) return false;
    usage[feature] += 1;
    saveUsage(usage);
    return true;
  }, [getLimits]);

  const featureName = useCallback((feature: LimitedFeature): string => {
    return FEATURE_NAMES[feature];
  }, []);

  return { canUse, remaining, limit, recordUsage, isMember, featureName };
}
