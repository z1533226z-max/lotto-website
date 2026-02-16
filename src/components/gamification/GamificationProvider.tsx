'use client';

import React from 'react';
import { useUserProgress } from '@/hooks/useUserProgress';
import AchievementBadges from '@/components/gamification/AchievementBadges';

export default function GamificationProvider() {
  const { badges, newlyUnlocked, clearNewlyUnlocked } = useUserProgress();

  return (
    <AchievementBadges
      badges={badges}
      newlyUnlocked={newlyUnlocked}
      onDismissNewlyUnlocked={clearNewlyUnlocked}
    />
  );
}
