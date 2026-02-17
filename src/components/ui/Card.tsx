'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { CardProps } from '@/types/lotto';

const variantStyles: Record<string, string> = {
  default: 'border shadow-sm',
  glass: cn(
    'backdrop-blur-xl border',
    'shadow-sm'
  ),
  elevated: 'border shadow-lg',
  gradient: cn(
    'bg-gradient-to-br from-primary/5 via-transparent to-secondary/5',
    'border border-primary/10'
  ),
  outlined: 'bg-transparent border-2 shadow-none',
};

const hoverStyles: Record<string, string> = {
  none: '',
  lift: 'transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg',
  glow: 'transition-all duration-300 ease-out hover:shadow-glow',
  scale: 'transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg',
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
        variantStyles[variant],
        hoverStyles[hover],
        paddingStyles[padding],
        className
      )}
      style={{
        backgroundColor: variant === 'outlined' ? 'transparent' : 'var(--surface)',
        borderColor: 'var(--border)',
        color: 'var(--text)',
      }}
    >
      {title && (
        <h3
          className="text-lg font-bold mb-4 pb-2"
          style={{
            color: 'var(--text)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default Card;
