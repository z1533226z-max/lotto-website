'use client';

import React from 'react';
import { useUsageLimit, type LimitedFeature } from '@/hooks/useUsageLimit';
import { useAuthSafe } from '@/components/providers/AuthProvider';

// ─── Props ──────────────────────────────────────────────────

interface UsageLimitBannerProps {
  feature: LimitedFeature;
}

// ─── Component ──────────────────────────────────────────────

const UsageLimitBanner: React.FC<UsageLimitBannerProps> = ({ feature }) => {
  const { remaining, limit, isMember } = useUsageLimit();
  const auth = useAuthSafe();

  const remainingCount = remaining(feature);
  const limitCount = limit(feature);
  const isAtLimit = remainingCount === 0;

  // ── Member: weekly remaining badge ──
  if (isMember) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          borderRadius: '10px',
          fontSize: '13px',
          background: 'rgba(211, 97, 53, 0.06)',
          border: '1px solid rgba(211, 97, 53, 0.15)',
          color: 'var(--text-secondary, #6b7280)',
          fontWeight: 500,
        }}
      >
        <span style={{ fontSize: '14px' }}>🎫</span>
        <span>이번 주 남은 이용:</span>
        <span
          style={{
            color: remainingCount > 0 ? '#D36135' : '#EF4444',
            fontWeight: 700,
            fontSize: '14px',
          }}
        >
          {remainingCount}/{limitCount}회
        </span>
      </div>
    );
  }

  // ── Non-member at limit: warning with CTA ──
  if (isAtLimit) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '10px 14px',
          borderRadius: '12px',
          fontSize: '13px',
          background: 'rgba(239, 68, 68, 0.06)',
          border: '1px solid rgba(239, 68, 68, 0.15)',
          color: 'var(--text, #1f2937)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              fontSize: '11px',
              flexShrink: 0,
            }}
          >
            ⚠️
          </span>
          <span style={{ fontWeight: 500 }}>
            이번 주 무료 이용을 모두 사용했어요
          </span>
        </div>
        <button
          onClick={() => auth?.openAuthModal()}
          style={{
            flexShrink: 0,
            padding: '5px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 700,
            color: '#fff',
            background: 'linear-gradient(135deg, #D36135, #E88A6A)',
            border: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.opacity = '0.85'; }}
          onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.opacity = '1'; }}
        >
          회원가입하면 주 10회!
        </button>
      </div>
    );
  }

  // ── Non-member with remaining uses: info bar ──
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        borderRadius: '10px',
        fontSize: '13px',
        background: 'var(--surface, #ffffff)',
        border: '1px solid var(--border, #e5e7eb)',
        color: 'var(--text-secondary, #6b7280)',
        fontWeight: 500,
      }}
    >
      <span style={{ fontSize: '14px' }}>🎟️</span>
      <span>이번 주 남은 무료 이용:</span>
      <span
        style={{
          color: '#D36135',
          fontWeight: 700,
          fontSize: '14px',
        }}
      >
        {remainingCount}/{limitCount}회
      </span>
    </div>
  );
};

export default UsageLimitBanner;
