'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import BadgeUI from '@/components/ui/Badge';
import type { Badge } from '@/hooks/useUserProgress';

// ─── Props ─────────────────────────────────────────────────

interface AchievementBadgesProps {
  badges: Badge[];
  newlyUnlocked: Badge | null;
  onDismissNewlyUnlocked: () => void;
}

// ─── Component ─────────────────────────────────────────────

const AchievementBadges: React.FC<AchievementBadgesProps> = ({
  badges,
  newlyUnlocked,
  onDismissNewlyUnlocked,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastBadge, setToastBadge] = useState<Badge | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  // Show toast when a new badge is unlocked
  useEffect(() => {
    if (newlyUnlocked) {
      setToastBadge(newlyUnlocked);
      setShowToast(true);

      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }

      toastTimeoutRef.current = setTimeout(() => {
        setShowToast(false);
        onDismissNewlyUnlocked();
        toastTimeoutRef.current = null;
      }, 4000);
    }

    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [newlyUnlocked, onDismissNewlyUnlocked]);

  // Close panel on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  return (
    <>
      {/* ── Toast Notification ─────────────────────────── */}
      {showToast && toastBadge && (
        <div
          className={cn(
            'fixed bottom-24 right-4 z-[60]',
            'animate-slide-in-right'
          )}
          style={{
            animation: 'slideInRight 0.4s ease-out, fadeOut 0.4s ease-in 3.5s forwards',
          }}
        >
          <div
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg',
              'border'
            )}
            style={{
              background: 'var(--surface, #ffffff)',
              borderColor: 'var(--border, #e5e7eb)',
              color: 'var(--text, #1f2937)',
            }}
          >
            <div
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              }}
            >
              {toastBadge.icon}
            </div>
            <div>
              <p className="text-xs font-medium" style={{ opacity: 0.6 }}>
                배지 획득!
              </p>
              <p className="text-sm font-bold">{toastBadge.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Trigger Button ────────────────────── */}
      <div className="fixed bottom-4 right-4 z-50" ref={panelRef}>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            'w-12 h-12 rounded-full shadow-lg flex items-center justify-center',
            'transition-all duration-300 hover:scale-110',
            'border relative'
          )}
          style={{
            background: 'var(--surface, #ffffff)',
            borderColor: 'var(--border, #e5e7eb)',
            color: 'var(--text, #1f2937)',
          }}
          aria-label="업적 배지 보기"
          title="업적 배지"
        >
          <span className="text-xl">{'\uD83C\uDFC5'}</span>
          {unlockedCount > 0 && (
            <span
              className={cn(
                'absolute -top-1 -right-1 w-5 h-5 rounded-full',
                'flex items-center justify-center text-[10px] font-bold text-white',
                'bg-gradient-to-r from-amber-500 to-orange-500'
              )}
            >
              {unlockedCount}
            </span>
          )}
        </button>

        {/* ── Badge Panel ────────────────────────────────── */}
        {isOpen && (
          <div
            className={cn(
              'absolute bottom-16 right-0 w-80 max-h-[70vh] overflow-y-auto',
              'rounded-xl shadow-2xl border',
            )}
            style={{
              background: 'var(--surface, #ffffff)',
              borderColor: 'var(--border, #e5e7eb)',
              color: 'var(--text, #1f2937)',
              animation: 'scaleIn 0.2s ease-out',
            }}
          >
            {/* Header */}
            <div
              className="sticky top-0 px-4 py-3 border-b backdrop-blur-sm"
              style={{
                borderColor: 'var(--border, #e5e7eb)',
                background: 'var(--surface, #ffffff)',
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base">
                  {'\uD83C\uDFC5'} 업적 배지
                </h3>
                <BadgeUI variant="primary" size="sm">
                  {unlockedCount}/{badges.length}
                </BadgeUI>
              </div>
              {/* Overall progress bar */}
              <div className="mt-2 w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border, #e5e7eb)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(unlockedCount / badges.length) * 100}%`,
                    background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
                  }}
                />
              </div>
            </div>

            {/* Badge List */}
            <div className="p-3 space-y-2">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg transition-all duration-200',
                    badge.unlocked
                      ? 'hover:scale-[1.02]'
                      : 'opacity-50'
                  )}
                  style={{
                    background: badge.unlocked
                      ? 'var(--surface, #ffffff)'
                      : 'transparent',
                    border: badge.unlocked
                      ? '1px solid var(--border, #e5e7eb)'
                      : '1px solid transparent',
                  }}
                >
                  {/* Badge Icon */}
                  <div
                    className={cn(
                      'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg',
                      badge.unlocked ? '' : 'grayscale'
                    )}
                    style={{
                      background: badge.unlocked
                        ? 'linear-gradient(135deg, #fbbf24, #f97316)'
                        : 'var(--border, #e5e7eb)',
                    }}
                  >
                    {badge.unlocked ? badge.icon : '\uD83D\uDD12'}
                  </div>

                  {/* Badge Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {badge.name}
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ opacity: 0.6 }}
                    >
                      {badge.description}
                    </p>

                    {/* Progress bar for incomplete badges */}
                    {!badge.unlocked && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div
                          className="flex-1 h-1 rounded-full overflow-hidden"
                          style={{ background: 'var(--border, #e5e7eb)' }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${badge.progress * 100}%`,
                              background: 'linear-gradient(90deg, #60a5fa, #818cf8)',
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-medium tabular-nums" style={{ opacity: 0.5 }}>
                          {badge.current}/{badge.requirement}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Unlocked indicator */}
                  {badge.unlocked && (
                    <span className="text-green-500 text-sm flex-shrink-0">{'\u2713'}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Keyframe Styles ────────────────────────────── */}
      <style jsx global>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
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
    </>
  );
};

export default AchievementBadges;
