'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { CardProps } from '@/types/lotto';

const Card: React.FC<CardProps> = ({ children, className, title }) => {
  return (
    <div className={cn(
      'bg-white rounded-xl shadow-card border border-gray-100',
      'p-6 transition-shadow duration-300 hover:shadow-lg',
      className
    )}>
      {title && (
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default Card;