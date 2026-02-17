'use client';

import React from 'react';
import { useAuthSafe } from '@/components/providers/AuthProvider';

interface MemberGateProps {
  children: React.ReactNode;
  featureName: string;
  featureIcon?: string;
  featureDesc?: string;
}

export default function MemberGate({
  children,
  featureName,
  featureIcon = '🔒',
  featureDesc,
}: MemberGateProps) {
  const auth = useAuthSafe();

  if (auth?.isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div
          className="w-10 h-10 rounded-full"
          style={{
            border: '3px solid var(--border)',
            borderTopColor: '#D36135',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      </div>
    );
  }

  if (auth?.user) {
    return <>{children}</>;
  }

  return (
    <div style={{ position: 'relative', minHeight: '70vh' }}>
      <div
        aria-hidden="true"
        style={{
          filter: 'blur(8px)',
          pointerEvents: 'none',
          userSelect: 'none',
          opacity: 0.4,
        }}
      >
        {children}
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20,
          background: 'linear-gradient(180deg, transparent 0%, var(--bg) 50%)',
        }}
      >
        <div
          style={{
            maxWidth: 380,
            width: '90%',
            padding: '2rem 1.5rem',
            borderRadius: 16,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12, lineHeight: 1 }}>
            {featureIcon}
          </div>

          <h2
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: 'var(--text)',
              marginBottom: 6,
            }}
          >
            회원 전용 기능
          </h2>

          <p
            style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              marginBottom: 20,
              lineHeight: 1.5,
            }}
          >
            <strong style={{ color: '#D36135' }}>{featureName}</strong>
            {featureDesc
              ? ` - ${featureDesc}`
              : '은(는) 회원만 이용할 수 있어요'}
          </p>

          <button
            onClick={() => auth?.openAuthModal()}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #D36135, #C05430)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            무료 회원가입하기
          </button>

          <p
            style={{
              fontSize: 11,
              color: 'var(--text-tertiary)',
              marginTop: 10,
            }}
          >
            닉네임과 비밀번호만 있으면 10초 가입!
          </p>
        </div>
      </div>
    </div>
  );
}
