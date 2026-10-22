'use client';

import React, { useEffect, useState } from 'react';
import { isJustAnnounced } from '@/lib/drawSchedule';

/**
 * 추첨 후 6시간 동안 '방금 발표' 표시. ISR 로 캐시된 HTML 이 오래 남아도
 * 표시 여부는 브라우저 시각으로 판단한다 (서버 HTML 에는 넣지 않음).
 */
const JustAnnouncedBadge: React.FC<{ round: number; className?: string }> = ({ round, className = '' }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const check = () => setShow(isJustAnnounced(round));
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [round]);

  if (!show) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-white bg-red-500 ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      방금 발표
    </span>
  );
};

export default JustAnnouncedBadge;
