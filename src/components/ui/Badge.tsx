'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: cn(
    'bg-gray-100 text-gray-700',
    'dark:bg-dark-surface-hover dark:text-dark-text-secondary',
    'border border-gray-200 dark:border-dark-border'
  ),
  primary: cn(
    'bg-primary-50 text-primary-700',
    'dark:bg-primary/15 dark:text-primary-300',
    'border border-primary-200 dark:border-primary/30'
  ),
  secondary: cn(
    'bg-secondary-50 text-secondary-700',
    'dark:bg-secondary/15 dark:text-secondary-300',
    'border border-secondary-200 dark:border-secondary/30'
  ),
  success: cn(
    'bg-emerald-50 text-emerald-700',
    'dark:bg-emerald-500/15 dark:text-emerald-300',
    'border border-emerald-200 dark:border-emerald-500/30'
  ),
  warning: cn(
    'bg-amber-50 text-amber-700',
    'dark:bg-amber-500/15 dark:text-amber-300',
    'border border-amber-200 dark:border-amber-500/30'
  ),
  danger: cn(
    'bg-red-50 text-red-700',
    'dark:bg-red-500/15 dark:text-red-300',
    'border border-red-200 dark:border-red-500/30'
  ),
  info: cn(
    'bg-blue-50 text-blue-700',
    'dark:bg-blue-500/15 dark:text-blue-300',
    'border border-blue-200 dark:border-blue-500/30'
  ),
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-gray-400 dark:bg-gray-500',
  primary: 'bg-primary dark:bg-primary-400',
  secondary: 'bg-secondary dark:bg-secondary-400',
  success: 'bg-emerald-500 dark:bg-emerald-400',
  warning: 'bg-amber-500 dark:bg-amber-400',
  danger: 'bg-red-500 dark:bg-red-400',
  info: 'bg-blue-500 dark:bg-blue-400',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

const dotSizes: Record<BadgeSize, string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
};

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        'transition-colors duration-200',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'rounded-full flex-shrink-0',
            dotSizes[size],
            dotColors[variant]
          )}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
