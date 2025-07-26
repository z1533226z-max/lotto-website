'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn('flex justify-center items-center', className)}>
      <div className={cn(
        'animate-spin rounded-full border-4 border-gray-200',
        'border-t-primary border-r-primary',
        sizeClasses[size]
      )} />
    </div>
  );
};

export default LoadingSpinner;