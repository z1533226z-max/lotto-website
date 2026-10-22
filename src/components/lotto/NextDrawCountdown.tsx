'use client';

import React, { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';
import { getNextDraw } from '@/lib/drawSchedule';
import { formatKstDrawTime, formatRemaining } from '@/lib/kstFormat';

interface Props {
  /** 서버 렌더 시점의 다음 회차·추첨 시각 (HTML 에 그대로 남는 값) */
  initialRound: number;
  initialDrawTimeMs: number;
}

/** 다음 추첨까지 남은 시간. 서버 HTML 에는 회차·추첨 시각, 브라우저에서 1초마다 남은 시간을 채운다. */
const NextDrawCountdown: React.FC<Props> = ({ initialRound, initialDrawTimeMs }) => {
  const [next, setNext] = useState({ round: initialRound, drawTimeMs: initialDrawTimeMs });
  const [remaining, setRemaining] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const n = getNextDraw(now);
      setNext(n);
      setRemaining(formatRemaining(n.drawTimeMs - now.getTime()));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 rounded-lg px-4 py-3 bg-white/70"
      aria-live="off"
    >
      <p className="text-sm text-gray-700">
        <Timer className="w-4 h-4 inline-block mr-1 text-primary align-text-bottom" />
        다음 추첨: <strong>{next.round}회</strong> · {formatKstDrawTime(next.drawTimeMs)}
      </p>
      <p className="text-sm font-bold text-primary tabular-nums">
        {remaining ? `남은 시간 ${remaining}` : '매주 토요일 오후 8시 35분 추첨'}
      </p>
    </div>
  );
};

export default NextDrawCountdown;
