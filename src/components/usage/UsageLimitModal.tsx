'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useUsageLimit, type LimitedFeature } from '@/hooks/useUsageLimit';
import { useAuthSafe } from '@/components/providers/AuthProvider';

// --- Props --------------------------------------------------------

interface UsageLimitModalProps {
  feature: LimitedFeature;
  isOpen: boolean;
  onClose: () => void;
}

// --- Benefits -----------------------------------------------------

const BENEFITS = [
  { icon: '♾️', text: '모든 도구 무제한 이용' },
  { icon: '📊', text: '번호 히스토리 & 당첨 확인' },
  { icon: '🎯', text: '5세트 동시 생성' },
] as const;

// --- Component ----------------------------------------------------

const UsageLimitModal: React.FC<UsageLimitModalProps> = ({
  feature,
  isOpen,
  onClose,
}) => {
  const { featureName } = useUsageLimit();
  const auth = useAuthSafe();
  const modalRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Enter / Exit animation
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimating(true);
        });
      });
    } else {
      setAnimating(false);
      const timeout = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose],
  );

  // Sign up handler
  const handleSignUp = useCallback(() => {
    auth?.openAuthModal();
    onClose();
  }, [auth, onClose]);

  if (!visible) return null;

  const name = featureName(feature);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="이용 제한 안내"
      style={{
        opacity: animating ? 1 : 0,
        transition: 'opacity 0.2s ease-out',
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-sm overflow-hidden"
        style={{
          background: 'var(--surface, #ffffff)',
          borderRadius: '16px',
          border: '1px solid var(--border, #e5e7eb)',
          color: 'var(--text, #1f2937)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          transform: animating ? 'scale(1)' : 'scale(0.92)',
          opacity: animating ? 1 : 0,
          transition: 'transform 0.2s ease-out, opacity 0.2s ease-out',
        }}
      >
        {/* Content */}
        <div style={{ padding: '28px 24px 24px' }}>
          {/* Icon */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <span
              style={{
                display: 'inline-block',
                fontSize: '48px',
                lineHeight: 1,
              }}
            >
              {'🔒'}
            </span>
          </div>

          {/* Title */}
          <h2
            style={{
              textAlign: 'center',
              fontSize: '17px',
              fontWeight: 800,
              lineHeight: 1.4,
              marginBottom: '8px',
              color: 'var(--text, #1f2937)',
            }}
          >
            오늘 무료 이용 횟수를
            <br />
            모두 사용했어요!
          </h2>

          {/* Subtitle */}
          <p
            style={{
              textAlign: 'center',
              fontSize: '13px',
              color: 'var(--text-secondary, #6b7280)',
              lineHeight: 1.5,
              marginBottom: '20px',
            }}
          >
            회원가입하면 <strong style={{ color: '#FF6B35' }}>{name}</strong>을
            무제한으로 이용할 수 있습니다.
          </p>

          {/* Benefits list */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column' as const,
              gap: '8px',
              marginBottom: '24px',
            }}
          >
            {BENEFITS.map(({ icon, text }) => (
              <div
                key={text}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'var(--bg, #f9fafb)',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text, #1f2937)',
                }}
              >
                <span style={{ fontSize: '16px', flexShrink: 0 }}>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
            {/* Primary: sign up */}
            <button
              onClick={handleSignUp}
              style={{
                width: '100%',
                padding: '12px 0',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 700,
                color: '#ffffff',
                background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
                border: 'none',
                cursor: 'pointer',
                transition: 'opacity 0.15s, transform 0.1s',
              }}
              onMouseEnter={(e) => {
                const btn = e.currentTarget;
                btn.style.opacity = '0.9';
                btn.style.transform = 'scale(0.98)';
              }}
              onMouseLeave={(e) => {
                const btn = e.currentTarget;
                btn.style.opacity = '1';
                btn.style.transform = 'scale(1)';
              }}
            >
              무료 회원가입
            </button>

            {/* Secondary: close */}
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '11px 0',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-secondary, #6b7280)',
                background: 'transparent',
                border: '1px solid var(--border, #e5e7eb)',
                cursor: 'pointer',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e) => {
                const btn = e.currentTarget;
                btn.style.background = 'var(--surface-hover, #f3f4f6)';
                btn.style.borderColor = 'var(--text-secondary, #9ca3af)';
              }}
              onMouseLeave={(e) => {
                const btn = e.currentTarget;
                btn.style.background = 'transparent';
                btn.style.borderColor = 'var(--border, #e5e7eb)';
              }}
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageLimitModal;
