'use client';

import { useCallback } from 'react';
import { safeLocalStorage } from '@/lib/utils';
import { useAuthSafe } from '@/components/providers/AuthProvider';

// ─── Types ──────────────────────────────────────────
export type LimitedFeature = 'ai' | 'dream' | 'fortune' | 'simulator';

interface DailyUsage {
  date: string; // YYYY-MM-DD
  ai: number;
  dream: number;
  fortune: number;
  simulator: number;
}

// ─── Constants ──────────────────────────────────────
const STORAGE_KEY = 'lotto-daily-usage';

const DAILY_LIMITS: Record<LimitedFeature, number> = {
  ai: 3,
  dream: 1,
  fortune: 1,
  simulator: 1,
};

// ─── Helpers ────────────────────────────────────────
function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function loadUsage(): DailyUsage {
  try {
    const raw = safeLocalStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: getToday(), ai: 0, dream: 0, fortune: 0, simulator: 0 };
    const parsed = JSON.parse(raw) as DailyUsage;
    // 날짜가 바뀌면 리셋
    if (parsed.date !== getToday()) {
      return { date: getToday(), ai: 0, dream: 0, fortune: 0, simulator: 0 };
    }
    return parsed;
  } catch {
    return { date: getToday(), ai: 0, dream: 0, fortune: 0, simulator: 0 };
  }
}

function saveUsage(usage: DailyUsage): void {
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

  const canUse = useCallback((feature: LimitedFeature): boolean => {
    if (isMember) return true;
    const usage = loadUsage();
    return usage[feature] < DAILY_LIMITS[feature];
  }, [isMember]);

  const remaining = useCallback((feature: LimitedFeature): number => {
    if (isMember) return Infinity;
    const usage = loadUsage();
    return Math.max(0, DAILY_LIMITS[feature] - usage[feature]);
  }, [isMember]);

  const limit = useCallback((feature: LimitedFeature): number => {
    return DAILY_LIMITS[feature];
  }, []);

  const recordUsage = useCallback((feature: LimitedFeature): boolean => {
    if (isMember) return true;
    const usage = loadUsage();
    if (usage[feature] >= DAILY_LIMITS[feature]) return false;
    usage[feature] += 1;
    saveUsage(usage);
    return true;
  }, [isMember]);

  const featureName = useCallback((feature: LimitedFeature): string => {
    return FEATURE_NAMES[feature];
  }, []);

  return { canUse, remaining, limit, recordUsage, isMember, featureName };
}
