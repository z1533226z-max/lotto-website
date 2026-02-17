'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Dices } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';

const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nicknameRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isAuthModalOpen) {
      setNickname('');
      setPassword('');
      setConfirmPassword('');
      setError('');
      setTab('login');
      setTimeout(() => nicknameRef.current?.focus(), 100);
    }
  }, [isAuthModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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

  return (
    <Dialog.Root open={isAuthModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-[100]"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            animation: 'dialogFadeIn 0.15s ease-out',
          }}
        />
        <Dialog.Content
          className="fixed z-[101] top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl shadow-2xl overflow-hidden outline-none"
          style={{
            background: 'var(--surface, #ffffff)',
            border: '1px solid var(--border, #e5e7eb)',
            color: 'var(--text, #1f2937)',
            animation: 'dialogContentIn 0.2s ease-out',
          }}
        >
          {/* Close button */}
          <Dialog.Close
            className="absolute top-3 right-3 w-11 h-11 rounded-full flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/10 outline-none"
            aria-label="닫기"
          >
            <span className="text-lg" style={{ opacity: 0.4 }}>✕</span>
          </Dialog.Close>

          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <div className="text-center mb-5">
              <Dices className="w-8 h-8 text-[#D36135] mx-auto" />
              <Dialog.Title className="text-lg font-bold mt-2">
                로또킹
              </Dialog.Title>
              <Dialog.Description className="text-xs mt-1" style={{ opacity: 0.5 }}>
                가입하면 진행상황이 저장됩니다
              </Dialog.Description>
            </div>

            {/* Tab Switcher */}
            <div
              className="flex rounded-lg overflow-hidden"
              style={{ border: '1px solid var(--border, #e5e7eb)' }}
            >
              {(['login', 'register'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(''); }}
                  className="flex-1 py-2.5 text-sm font-semibold transition-all duration-200"
                  style={{
                    background: tab === t
                      ? 'linear-gradient(135deg, #D36135, #E88A6A)'
                      : 'transparent',
                    color: tab === t ? '#fff' : 'var(--text, #1f2937)',
                    opacity: tab === t ? 1 : 0.5,
                  }}
                >
                  {t === 'login' ? '로그인' : '회원가입'}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 pb-6">
            {/* Error */}
            {error && (
              <div
                className="mb-4 px-3 py-2.5 rounded-lg text-sm font-medium"
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                }}
              >
                {error}
              </div>
            )}

            {/* Nickname */}
            <div className="mb-3">
              <label
                htmlFor="auth-nickname"
                className="block text-xs font-semibold mb-1.5"
                style={{ color: 'var(--text-secondary)' }}
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
                  'focus:ring-2 focus:ring-primary/30 focus:border-primary',
                )}
                style={{
                  background: 'var(--bg, #f9fafb)',
                  borderColor: 'var(--border, #e5e7eb)',
                  color: 'var(--text, #1f2937)',
                }}
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="mb-3">
              <label
                htmlFor="auth-password"
                className="block text-xs font-semibold mb-1.5"
                style={{ color: 'var(--text-secondary)' }}
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
                  'focus:ring-2 focus:ring-primary/30 focus:border-primary',
                )}
                style={{
                  background: 'var(--bg, #f9fafb)',
                  borderColor: 'var(--border, #e5e7eb)',
                  color: 'var(--text, #1f2937)',
                }}
                disabled={loading}
              />
            </div>

            {/* Confirm Password */}
            {tab === 'register' && (
              <div className="mb-3">
                <label
                  htmlFor="auth-confirm-password"
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: 'var(--text-secondary)' }}
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
                    'focus:ring-2 focus:ring-primary/30 focus:border-primary',
                  )}
                  style={{
                    background: 'var(--bg, #f9fafb)',
                    borderColor: 'var(--border, #e5e7eb)',
                    color: 'var(--text, #1f2937)',
                  }}
                  disabled={loading}
                />
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #D36135, #C05430)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  처리 중...
                </span>
              ) : (
                tab === 'login' ? '로그인' : '회원가입'
              )}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AuthModal;
