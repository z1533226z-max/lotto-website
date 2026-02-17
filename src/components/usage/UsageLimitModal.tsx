'use client';

import React, { useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Lock, TrendingUp, BarChart3, Target } from 'lucide-react';
import { useUsageLimit, type LimitedFeature } from '@/hooks/useUsageLimit';
import { useAuthSafe } from '@/components/providers/AuthProvider';

// --- Props --------------------------------------------------------

interface UsageLimitModalProps {
  feature: LimitedFeature;
  isOpen: boolean;
  onClose: () => void;
}

// --- Benefits -----------------------------------------------------

const BENEFITS_GUEST = [
  { icon: <TrendingUp className="w-4 h-4" />, text: '주 10회로 이용 확대 (비회원 3회)' },
  { icon: <BarChart3 className="w-4 h-4" />, text: '번호 히스토리 & 당첨 확인' },
  { icon: <Target className="w-4 h-4" />, text: '5세트 동시 생성' },
];

// --- Component ----------------------------------------------------

const UsageLimitModal: React.FC<UsageLimitModalProps> = ({
  feature,
  isOpen,
  onClose,
}) => {
  const { featureName, isMember } = useUsageLimit();
  const auth = useAuthSafe();

  const handleSignUp = useCallback(() => {
    auth?.openAuthModal();
    onClose();
  }, [auth, onClose]);

  const name = featureName(feature);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
          <div style={{ padding: '28px 24px 24px' }}>
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <Lock className="w-12 h-12 text-[var(--text-secondary)]" />
            </div>

            {/* Title */}
            <Dialog.Title
              className="text-center text-base font-extrabold leading-snug mb-2"
              style={{ color: 'var(--text, #1f2937)' }}
            >
              이번 주 이용 횟수를
              <br />
              모두 사용했어요!
            </Dialog.Title>

            {/* Description */}
            <Dialog.Description
              className="text-center text-xs mb-5 leading-relaxed"
              style={{ color: 'var(--text-secondary, #6b7280)' }}
            >
              {isMember ? (
                <>
                  <strong style={{ color: '#D36135' }}>{name}</strong> 주간 이용 횟수가 초기화됩니다.
                  <br />
                  <span className="text-[11px]">매주 월요일 자동 초기화</span>
                </>
              ) : (
                <>
                  회원가입하면 <strong style={{ color: '#D36135' }}>{name}</strong>을
                  주 10회까지 이용할 수 있습니다.
                </>
              )}
            </Dialog.Description>

            {/* Benefits list (non-member only) */}
            {!isMember && (
              <div className="flex flex-col gap-2 mb-5">
                {BENEFITS_GUEST.map(({ icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium"
                    style={{
                      background: 'var(--bg, #f9fafb)',
                      color: 'var(--text, #1f2937)',
                    }}
                  >
                    <span className="flex-shrink-0">{icon}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-2.5">
              {!isMember && (
                <button
                  onClick={handleSignUp}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #D36135, #C05430)' }}
                >
                  무료 회원가입
                </button>
              )}

              <Dialog.Close asChild>
                <button
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={{
                    color: isMember ? '#fff' : 'var(--text-secondary, #6b7280)',
                    background: isMember ? 'linear-gradient(135deg, #D36135, #C05430)' : 'transparent',
                    border: isMember ? 'none' : '1px solid var(--border, #e5e7eb)',
                  }}
                >
                  {isMember ? '확인' : '닫기'}
                </button>
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default UsageLimitModal;
