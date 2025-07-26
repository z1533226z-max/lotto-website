'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { AdBannerProps } from '@/types/lotto';

// 전역 AdSense 타입 선언
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdBanner: React.FC<AdBannerProps> = ({ slot, size, className }) => {
  const adRef = useRef<HTMLDivElement>(null);
  
  const sizeConfig = {
    leaderboard: { width: 728, height: 90 },
    rectangle: { width: 300, height: 250 },
    skyscraper: { width: 160, height: 600 },
    mobile: { width: 320, height: 50 }
  };

  // 광고 가시성 추적 함수
  const trackAdView = (adSlot: string, adSize: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'ad_view', {
        ad_slot: adSlot,
        ad_size: adSize,
        page_title: document.title,
        page_url: window.location.href
      });
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && adRef.current) {
      try {
        // AdSense 스크립트 로드 확인
        if (!window.adsbygoogle) {
          window.adsbygoogle = [];
        }

        // 광고 로드
        window.adsbygoogle.push({});
        
        // 광고 가시성 추적
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              trackAdView(slot, size);
              // 한 번 추적했으면 관찰 중단
              observer.unobserve(entry.target);
            }
          });
        }, {
          threshold: 0.5 // 50% 이상 보일 때 추적
        });
        
        if (adRef.current) {
          observer.observe(adRef.current);
        }
        
        return () => observer.disconnect();
      } catch (error) {
        console.error('AdSense 로드 실패:', error);
      }
    }
  }, [slot, size]);

  // 개발 환경에서는 플레이스홀더 표시
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    return (
      <div className={cn('ad-banner-container', className)}>
        <div className="text-xs text-gray-400 text-center mb-1">광고</div>
        <div 
          className="flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded"
          style={{ 
            width: sizeConfig[size].width, 
            height: sizeConfig[size].height,
            maxWidth: '100%'
          }}
        >
          <div className="text-center text-gray-500">
            <div className="text-sm font-medium">AdSense</div>
            <div className="text-xs">{sizeConfig[size].width}×{sizeConfig[size].height}</div>
            <div className="text-xs mt-1">{slot}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('ad-banner-container', className)}>
      <div className="text-xs text-gray-400 text-center mb-1">광고</div>
      <div 
        ref={adRef}
        className="flex justify-center"
        style={{ minHeight: sizeConfig[size].height }}
      >
        <ins
          className="adsbygoogle"
          style={{
            display: 'inline-block',
            width: sizeConfig[size].width,
            height: sizeConfig[size].height
          }}
          data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};

export default AdBanner;