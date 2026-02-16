'use client';

import React from 'react';
import { useUserProgress } from '@/hooks/useUserProgress';
import DailyChallenge from '@/components/gamification/DailyChallenge';

interface DailyChallengeWidgetProps {
  className?: string;
}

export default function DailyChallengeWidget({ className }: DailyChallengeWidgetProps) {
  const { dailyChallenge, streak } = useUserProgress();

  return (
    <DailyChallenge
      challenge={dailyChallenge}
      streak={streak}
      className={className}
    />
  );
}
