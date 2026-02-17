'use client';

import React from 'react';
import { useAuthSafe } from '@/components/providers/AuthProvider';

interface MemberGateProps {
  children: React.ReactNode;
  /** 도구 이름 (예: "시뮬레이터", "꿈번호 해몽", "행운번호") */
  featureName: string;
  /** 도구 이모지 */
  featureIcon?: string;
  /** 도구 설명 */
  featureDesc?: string;
}

/**
 * 비회원일 때 콘텐츠를 블러 처리하고 회원가입 유도 오버레이를 표시
 * 회원이면 children을 그대로 렌더링
 */
export default function MemberGate({
  children,
  featureName,
  featureIcon = '🔒',
  featureDesc,
}: MemberGateProps) {
  const auth = useAuthSafe();

  // 로딩 중이면 스켈레톤 표시
  if (auth?.isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
      }}>
        <div style={{
          width: 48,
          height: 48,
          border: '3px solid var(--border)',
          borderTop: '3px solid #D36135',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  // 회원이면 그대로 렌더링
  if (auth?.user) {
    return <>{children}</>;
  }

  // 비회원: 블러 + 오버레이
  return (
    <div style={{ position: 'relative', minHeight: '80vh' }}>
      {/* 블러 처리된 실제 콘텐츠 (미리보기 효과) */}
      <div
        aria-hidden="true"
        style={{
          filter: 'blur(8px)',
          pointerEvents: 'none',
          userSelect: 'none',
          opacity: 0.5,
        }}
      >
        {children}
      </div>

      {/* 오버레이 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20,
          background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.8) 100%)',
        }}
      >
        <div
          style={{
            maxWidth: 420,
            width: '90%',
            padding: '2.5rem 2rem',
            borderRadius: 20,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
            textAlign: 'center',
          }}
        >
          {/* 아이콘 */}
          <div style={{ fontSize: 56, marginBottom: 16, lineHeight: 1 }}>
            {featureIcon}
          </div>

          {/* 제목 */}
          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: 'var(--text)',
              marginBottom: 8,
              lineHeight: 1.3,
            }}
          >
            회원 전용 기능입니다
          </h2>

          {/* 기능 이름 */}
          <p
            style={{
              fontSize: 15,
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

          {/* 혜택 목록 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              marginBottom: 24,
              padding: '16px',
              borderRadius: 12,
              background: 'var(--surface-hover)',
              textAlign: 'left',
            }}
          >
            {[
              { icon: '🎰', text: '시뮬레이터 / 꿈번호 / 행운번호 이용' },
              { icon: '🎯', text: 'AI 번호 생성 주 10회 (비회원 3회)' },
              { icon: '💾', text: '번호 저장 & 히스토리 관리' },
              { icon: '💬', text: '커뮤니티 글쓰기 & 댓글' },
            ].map((item) => (
              <div
                key={item.text}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 14,
                  color: 'var(--text-secondary)',
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          {/* CTA 버튼 */}
          <button
            onClick={() => auth?.openAuthModal()}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: 12,
              border: 'none',
              fontSize: 16,
              fontWeight: 700,
              color: '#fff',
              background: 'linear-gradient(135deg, #D36135, #E88A6A)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(211, 97, 53, 0.4)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(211, 97, 53, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(211, 97, 53, 0.4)';
            }}
          >
            무료 회원가입하기
          </button>

          <p
            style={{
              fontSize: 12,
              color: 'var(--text-tertiary)',
              marginTop: 12,
            }}
          >
            가입은 10초면 끝! 닉네임과 비밀번호만 있으면 돼요
          </p>
        </div>
      </div>
    </div>
  );
}
