'use client';

import React from 'react';
import { cn, getBallColor, getBallTextColor, getBonusBallColor, getBonusBallTextColor } from '@/lib/utils';
import { SIZE_CLASSES } from '@/lib/constants';
import type { LottoNumbersProps } from '@/types/lotto';

const LottoNumbers: React.FC<LottoNumbersProps> = ({
  numbers,
  bonusNumber,
  size = 'md',
  animated = false,
  className
}) => {
  return (
    <div className={cn('flex items-center justify-center gap-2 flex-wrap', className)}>
      {/* 메인 번호들 */}
      {numbers.map((num, index) => (
        <div
          key={`main-${index}`}
          className={cn(
            getBallColor(num),
            getBallTextColor(num),
            SIZE_CLASSES.BALL[size],
            'rounded-full flex items-center justify-center font-bold shadow-lotto',
            'transition-all duration-500 hover:scale-110 hover:shadow-xl',
            animated ? 'animate-fade-in-up' : 'transform-none'
          )}
          style={animated ? { 
            animationDelay: `${index * 150}ms`,
            animationFillMode: 'both'
          } : {}}
        >
          {num}
        </div>
      ))}
      
      {/* 보너스 번호 */}
      {bonusNumber && (
        <>
          <span className={cn(
            "text-gray-400 mx-1 text-lg font-bold transition-opacity duration-500",
            animated ? 'animate-fade-in' : 'opacity-100'
          )}
          style={animated ? { 
            animationDelay: `${numbers.length * 150}ms`,
            animationFillMode: 'both'
          } : {}}
          >
            +
          </span>
          <div
            className={cn(
              getBonusBallColor(),
              getBonusBallTextColor(),
              SIZE_CLASSES.BALL[size],
              'rounded-full flex items-center justify-center font-bold shadow-lotto',
              'transition-all duration-500 hover:scale-110 hover:shadow-xl',
              'ring-2 ring-accent ring-opacity-50',
              animated ? 'animate-fade-in-up' : 'transform-none'
            )}
            style={animated ? { 
              animationDelay: `${(numbers.length + 1) * 150}ms`,
              animationFillMode: 'both'
            } : {}}
          >
            {bonusNumber}
          </div>
        </>
      )}
    </div>
  );
};

export default LottoNumbers;