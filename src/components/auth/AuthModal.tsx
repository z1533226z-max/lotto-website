'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';
import Button from '@/components/ui/Button';

// ─── Component ──────────────────────────────────────────────

const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const nicknameRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isAuthModalOpen) {
      setNickname('');
      setPassword('');
      setConfirmPassword('');
      setError('');
      setTab('login');
      // Focus nickname input after animation
      setTimeout(() => nicknameRef.current?.focus(), 100);
    }
  }, [isAuthModalOpen]);

  // Close on escape
  useEffect(() => {
    if (!isAuthModalOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isAuthModalOpen, closeAuthModal]);

  // Close on outside click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeAuthModal();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    if (nickname.trim().length < 2 || nickname.trim().length > 15) {
      setError('닉네임은 2~15자로 입력해주세요.');
      return;
    }

    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    if (password.length < 4 || password.length > 30) {
      setError('비밀번호는 4~30자로 입력해주세요.');
      return;
    }

    if (tab === 'register' && password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      const result = tab === 'login'
        ? await login(nickname.trim(), password)
        : await register(nickname.trim(), password);

      if (result.success) {
        closeAuthModal();
      } else {
        setError(result.error || '오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={tab === 'login' ? '로그인' : '회원가입'}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          'relative w-full max-w-sm rounded-2xl shadow-2xl border overflow-hidden',
        )}
        style={{
          background: 'var(--surface, #ffffff)',
          borderColor: 'var(--border, #e5e7eb)',
          color: 'var(--text, #1f2937)',
          animation: 'scaleIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="닫기"
          >
            <span className="text-lg" style={{ opacity: 0.5 }}>{'✕'}</span>
          </button>

          <div className="text-center mb-4">
            <span className="text-3xl">{'🎰'}</span>
            <h2 className="text-lg font-bold mt-2">로또킹</h2>
            <p className="text-xs mt-1" style={{ opacity: 0.5 }}>
              가입하면 진행상황이 저장됩니다
            </p>
          </div>

          {/* Tab Switcher */}
          <div
            className="flex rounded-lg overflow-hidden border"
            style={{ borderColor: 'var(--border, #e5e7eb)' }}
          >
            <button
              onClick={() => { setTab('login'); setError(''); }}
              className={cn(
                'flex-1 py-2 text-sm font-semibold transition-all duration-200',
              )}
              style={{
                background: tab === 'login'
                  ? 'linear-gradient(135deg, #FF6B35, #FF8C42)'
                  : 'transparent',
                color: tab === 'login' ? '#fff' : 'var(--text, #1f2937)',
                opacity: tab === 'login' ? 1 : 0.6,
              }}
            >
              로그인
            </button>
            <button
              onClick={() => { setTab('register'); setError(''); }}
              className={cn(
                'flex-1 py-2 text-sm font-semibold transition-all duration-200',
              )}
              style={{
                background: tab === 'register'
                  ? 'linear-gradient(135deg, #FF6B35, #FF8C42)'
                  : 'transparent',
                color: tab === 'register' ? '#fff' : 'var(--text, #1f2937)',
                opacity: tab === 'register' ? 1 : 0.6,
              }}
            >
              회원가입
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          {/* Error Message */}
          {error && (
            <div
              className="mb-4 px-3 py-2 rounded-lg text-sm font-medium"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              {error}
            </div>
          )}

          {/* Nickname Input */}
          <div className="mb-3">
            <label
              htmlFor="auth-nickname"
              className="block text-xs font-semibold mb-1.5"
              style={{ opacity: 0.7 }}
            >
              닉네임
            </label>
            <input
              ref={nicknameRef}
              id="auth-nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="2~15자 닉네임"
              maxLength={15}
              className={cn(
                'w-full px-3 py-2.5 rounded-lg text-sm border outline-none',
                'transition-all duration-200',
                'focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400',
              )}
              style={{
                background: 'var(--background, #f9fafb)',
                borderColor: 'var(--border, #e5e7eb)',
                color: 'var(--text, #1f2937)',
              }}
              disabled={loading}
            />
          </div>

          {/* Password Input */}
          <div className="mb-3">
            <label
              htmlFor="auth-password"
              className="block text-xs font-semibold mb-1.5"
              style={{ opacity: 0.7 }}
            >
              비밀번호
            </label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="4~30자 비밀번호"
              maxLength={30}
              className={cn(
                'w-full px-3 py-2.5 rounded-lg text-sm border outline-none',
                'transition-all duration-200',
                'focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400',
              )}
              style={{
                background: 'var(--background, #f9fafb)',
                borderColor: 'var(--border, #e5e7eb)',
                color: 'var(--text, #1f2937)',
              }}
              disabled={loading}
            />
          </div>

          {/* Confirm Password (register only) */}
          {tab === 'register' && (
            <div className="mb-3">
              <label
                htmlFor="auth-confirm-password"
                className="block text-xs font-semibold mb-1.5"
                style={{ opacity: 0.7 }}
              >
                비밀번호 확인
              </label>
              <input
                id="auth-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호를 다시 입력해주세요"
                maxLength={30}
                className={cn(
                  'w-full px-3 py-2.5 rounded-lg text-sm border outline-none',
                  'transition-all duration-200',
                  'focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400',
                )}
                style={{
                  background: 'var(--background, #f9fafb)',
                  borderColor: 'var(--border, #e5e7eb)',
                  color: 'var(--text, #1f2937)',
                }}
                disabled={loading}
              />
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            className="mt-4"
          >
            {tab === 'login' ? '로그인' : '회원가입'}
          </Button>

          {/* Benefits hint */}
          {tab === 'register' && (
            <div className="mt-4 space-y-1.5">
              <p className="text-xs font-semibold text-center" style={{ opacity: 0.5 }}>
                회원가입 혜택
              </p>
              <div className="flex flex-col gap-1">
                {[
                  ['♾️', '모든 도구 무제한 이용'],
                  ['📊', '번호 히스토리 & 당첨 확인'],
                  ['🎯', '5세트 동시 생성'],
                  ['💾', '진행상황 서버 저장'],
                  ['🏆', '리더보드 참여'],
                ].map(([icon, text]) => (
                  <div
                    key={text}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                    style={{
                      background: 'var(--background, #f9fafb)',
                      opacity: 0.7,
                    }}
                  >
                    <span>{icon}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Keyframe styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default AuthModal;
