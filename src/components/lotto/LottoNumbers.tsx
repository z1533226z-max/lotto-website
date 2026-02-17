'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { LottoNumbersProps } from '@/types/lotto';

/**
 * Get the primary color for a lotto ball based on number range
 */
const getBallHexColor = (num: number): string => {
  if (num <= 10) return '#FFC107'; // yellow
  if (num <= 20) return '#2196F3'; // blue
  if (num <= 30) return '#FF5722'; // red/orange
  if (num <= 40) return '#757575'; // gray (WCAG AA: 4.98:1 with white text)
  return '#4CAF50'; // green
};

/**
 * Get text color (white or dark) for readability on ball background
 */
const getBallTextHexColor = (num: number): string => {
  if (num <= 10) return '#333333'; // dark text on yellow
  return '#FFFFFF'; // white text on all others
};

/**
 * Size configuration for lotto balls
 */
const BALL_SIZES = {
  xs: { container: 'w-7 h-7', text: 'text-[10px]', shadow: '2px', highlight: '6px' },
  sm: { container: 'w-9 h-9', text: 'text-xs', shadow: '3px', highlight: '8px' },
  md: { container: 'w-12 h-12', text: 'text-base', shadow: '4px', highlight: '10px' },
  lg: { container: 'w-16 h-16', text: 'text-xl', shadow: '6px', highlight: '14px' },
};

/**
 * Divider size between main numbers and bonus
 */
const DIVIDER_SIZES = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
};

interface BallProps {
  number: number;
  size: 'xs' | 'sm' | 'md' | 'lg';
  animated: boolean;
  animationIndex: number;
  isBonus?: boolean;
}

const LottoBall: React.FC<BallProps> = ({ number, size, animated, animationIndex, isBonus = false }) => {
  const baseColor = getBallHexColor(number);
  const textColor = getBallTextHexColor(number);
  const sizeConfig = BALL_SIZES[size];

  // Create a lighter version of the color for radial gradient
  const lighterColor = baseColor + 'CC'; // slightly transparent

  return (
    <div
      className={cn(
        sizeConfig.container,
        sizeConfig.text,
        'rounded-full flex items-center justify-center font-bold',
        'relative select-none',
        'transition-all duration-300 hover:scale-110',
        animated && 'animate-fade-in-up',
        isBonus && 'ring-2 ring-offset-1 dark:ring-offset-[#0F1117]'
      )}
      style={{
        // 3D ball gradient: lighter at top-left, darker at bottom-right
        background: `radial-gradient(circle at 35% 30%, ${lighterColor}, ${baseColor} 50%, ${baseColor}99 100%)`,
        color: textColor,
        boxShadow: `
          0 ${sizeConfig.shadow} ${parseInt(sizeConfig.shadow) * 3}px ${baseColor}66,
          inset 0 -${parseInt(sizeConfig.shadow) / 2}px ${parseInt(sizeConfig.shadow)}px ${baseColor}44
        `,
        ...(isBonus ? { ringColor: '#FFD23F' } : {}),
        ...(animated ? {
          animationDelay: `${animationIndex * 120}ms`,
          animationFillMode: 'both',
        } : {}),
      }}
    >
      {/* Inner highlight (white shine at top-left) */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          top: '10%',
          left: '15%',
          width: sizeConfig.highlight,
          height: sizeConfig.highlight,
          background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)',
        }}
      />
      {/* Number */}
      <span className="relative z-10 font-bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
        {number}
      </span>
    </div>
  );
};

const LottoNumbers: React.FC<LottoNumbersProps> = ({
  numbers,
  bonusNumber,
  size = 'md',
  animated = false,
  className,
}) => {
  return (
    <div className={cn('flex items-center justify-center gap-2 flex-wrap', className)}>
      {/* Main numbers */}
      {numbers.map((num, index) => (
        <LottoBall
          key={`main-${index}`}
          number={num}
          size={size}
          animated={animated}
          animationIndex={index}
        />
      ))}

      {/* Bonus number */}
      {bonusNumber != null && (
        <>
          <span
            className={cn(
              DIVIDER_SIZES[size],
              'font-bold mx-1',
              'transition-opacity duration-500',
              animated && 'animate-fade-in'
            )}
            style={{
              color: 'var(--text-tertiary)',
              ...(animated ? {
                animationDelay: `${numbers.length * 120}ms`,
                animationFillMode: 'both',
              } : {}),
            }}
          >
            +
          </span>
          <LottoBall
            number={bonusNumber}
            size={size}
            animated={animated}
            animationIndex={numbers.length + 1}
            isBonus
          />
        </>
      )}
    </div>
  );
};

export default LottoNumbers;
