'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface DoubleBezelCardProps {
  children: React.ReactNode;
  className?: string;
  outerClassName?: string;
  /** 'dark' uses glass-on-dark, 'light' uses subtle shadow-on-light */
  mode?: 'auto' | 'dark' | 'light';
  /** Click handler — adds interactive hover states when provided */
  onClick?: () => void;
}

/**
 * Supanova Double-Bezel Card
 * Premium card with machined-hardware aesthetic:
 * outer shell (aluminum tray) + inner core (glass plate)
 */
const DoubleBezelCard: React.FC<DoubleBezelCardProps> = ({
  children,
  className,
  outerClassName,
  mode = 'auto',
  onClick,
}) => {
  const isInteractive = !!onClick;

  return (
    <div
      className={cn(
        // Outer shell
        'p-1.5 rounded-[2rem]',
        'ring-1',
        // Auto mode: light/dark adaptive
        mode === 'auto' && 'bg-black/[0.03] ring-black/5 dark:bg-white/5 dark:ring-white/10',
        mode === 'dark' && 'bg-white/5 ring-white/10',
        mode === 'light' && 'bg-black/[0.03] ring-black/5',
        // Interactive states
        isInteractive && [
          'cursor-pointer',
          'transition-all duration-500',
          'hover:scale-[1.02] active:scale-[0.98]',
        ].join(' '),
        outerClassName
      )}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={isInteractive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
      style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      {/* Inner core */}
      <div
        className={cn(
          'rounded-[calc(2rem-0.375rem)]',
          'p-5 sm:p-6',
          // Inner highlight for depth
          'shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]',
          // Background
          'bg-[var(--surface)]',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default DoubleBezelCard;
