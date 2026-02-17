'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { CardProps } from '@/types/lotto';

const variantStyles: Record<string, string> = {
  default: cn(
    'bg-white dark:bg-[var(--surface)]',
    'border border-gray-100 dark:border-[var(--border)]',
    'shadow-card dark:shadow-none'
  ),
  glass: cn(
    'backdrop-blur-xl',
    'bg-white/60 dark:bg-[var(--surface)]/60',
    'border border-white/20 dark:border-white/[0.08]',
    'shadow-glass dark:shadow-glass-dark'
  ),
  elevated: cn(
    'bg-white dark:bg-[var(--surface)]',
    'border border-gray-100 dark:border-[var(--border)]',
    'shadow-elevated dark:shadow-elevated-dark'
  ),
  gradient: cn(
    'bg-gradient-to-br from-primary/5 via-white to-secondary/5',
    'dark:from-primary/10 dark:via-[var(--surface)] dark:to-secondary/10',
    'border border-primary/10 dark:border-primary/20'
  ),
  outlined: cn(
    'bg-transparent',
    'border-2 border-gray-200 dark:border-[var(--border)]',
    'shadow-none'
  ),
};

const hoverStyles: Record<string, string> = {
  none: '',
  lift: cn(
    'transition-all duration-300 ease-out',
    'hover:-translate-y-1.5',
    'hover:shadow-xl dark:hover:shadow-2xl'
  ),
  glow: cn(
    'transition-all duration-300 ease-out',
    'hover:shadow-glow dark:hover:shadow-glow'
  ),
  scale: cn(
    'transition-all duration-300 ease-out',
    'hover:scale-[1.02]',
    'hover:shadow-lg dark:hover:shadow-xl'
  ),
};

const paddingStyles: Record<string, string> = {
  none: 'p-0',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
};

const Card: React.FC<CardProps> = ({
  children,
  className,
  title,
  variant = 'default',
  hover = 'none',
  padding = 'md',
}) => {
  return (
    <div
      className={cn(
        'rounded-xl',
        'transition-colors duration-200',
        variantStyles[variant],
        hoverStyles[hover],
        paddingStyles[padding],
        className
      )}
    >
      {title && (
        <h3 className={cn(
          'text-lg font-bold mb-4 pb-2',
          'text-gray-800 dark:text-[var(--text)]',
          'border-b border-gray-100 dark:border-[var(--border)]'
        )}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default Card;
