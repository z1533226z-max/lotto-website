'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'card';

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string;
  height?: string;
  lines?: number;
  className?: string;
}

const shimmerBase = cn(
  'relative overflow-hidden',
  'bg-gray-200 dark:bg-dark-surface-hover',
  'before:absolute before:inset-0',
  'before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
  'dark:before:via-white/5',
  'before:animate-shimmer before:bg-shimmer'
);

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  lines = 1,
  className,
}) => {
  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2.5', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              shimmerBase,
              'h-4 rounded-md',
              // Last line is shorter for a natural look
              i === lines - 1 && 'w-3/4'
            )}
            style={{
              width: i === lines - 1 ? '75%' : width || '100%',
              height: height || undefined,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'circular') {
    return (
      <div
        className={cn(
          shimmerBase,
          'rounded-full',
          className
        )}
        style={{
          width: width || '3rem',
          height: height || width || '3rem',
        }}
      />
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={cn(
          'rounded-xl overflow-hidden',
          'border border-gray-100 dark:border-dark-border',
          className
        )}
        style={{ width: width || '100%' }}
      >
        {/* Image placeholder */}
        <div
          className={cn(shimmerBase)}
          style={{ height: height || '12rem' }}
        />
        {/* Content placeholder */}
        <div className="p-4 space-y-3">
          <div className={cn(shimmerBase, 'h-5 rounded-md w-3/4')} />
          <div className={cn(shimmerBase, 'h-4 rounded-md w-full')} />
          <div className={cn(shimmerBase, 'h-4 rounded-md w-2/3')} />
          <div className="flex gap-2 pt-2">
            <div className={cn(shimmerBase, 'h-8 rounded-lg w-20')} />
            <div className={cn(shimmerBase, 'h-8 rounded-lg w-20')} />
          </div>
        </div>
      </div>
    );
  }

  // Default: text (single line) or rectangular
  const borderRadiusClass = variant === 'rectangular' ? 'rounded-lg' : 'rounded-md';

  return (
    <div
      className={cn(
        shimmerBase,
        borderRadiusClass,
        className
      )}
      style={{
        width: width || '100%',
        height: height || (variant === 'text' ? '1rem' : '6rem'),
      }}
    />
  );
};

export default Skeleton;
