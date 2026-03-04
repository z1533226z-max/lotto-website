'use client';

import React, { useEffect, useRef } from 'react';
import type { AdBannerProps } from '@/types/lotto';

declare global {
  interface Window {
    adsbygoogle: Array<Record<string, unknown>>;
  }
}

const AdBanner: React.FC<AdBannerProps> = ({ slot, size, className }) => {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current || !slot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded
    }
  }, [slot]);

  // slot이 없으면 자동 광고에 위임
  if (!slot) return null;

  return (
    <div
      className={`flex justify-center overflow-hidden ${className ?? ''}`}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: 'auto' }}
        data-ad-client="ca-pub-7479840445702290"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBanner;
