'use client';

import React, { useEffect } from 'react';
import { useUserProgress } from '@/hooks/useUserProgress';
import type { ActionType } from '@/hooks/useUserProgress';
import AchievementBadges from '@/components/gamification/AchievementBadges';

export default function GamificationProvider() {
  const { badges, newlyUnlocked, clearNewlyUnlocked, trackAction } = useUserProgress();

  // trackAction을 window에 노출하여 다른 컴포넌트에서 호출 가능하게 함
  useEffect(() => {
    window.__trackAction = (action: string) => trackAction(action as ActionType);
    return () => { delete window.__trackAction; };
  }, [trackAction]);

  return (
    <AchievementBadges
      badges={badges}
      newlyUnlocked={newlyUnlocked}
      onDismissNewlyUnlocked={clearNewlyUnlocked}
    />
  );
}
