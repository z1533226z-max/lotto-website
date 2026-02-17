'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { ButtonProps } from '@/types/lotto';

const sizeStyles: Record<string, string> = {
  xs: 'px-2.5 py-1 text-xs gap-1 rounded-md',
  sm: 'px-3 py-1.5 text-sm gap-1.5 rounded-lg',
  md: 'px-4 py-2 text-sm gap-2 rounded-lg',
  lg: 'px-6 py-3 text-base gap-2.5 rounded-xl',
};

const variantStyles: Record<string, string> = {
  primary: cn(
    'bg-primary text-white',
    'hover:bg-primary-500',
    'focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
    'shadow-md hover:shadow-lg',
    'transform hover:-translate-y-0.5 active:translate-y-0'
  ),
  secondary: cn(
    'bg-secondary text-white',
    'hover:bg-secondary-700',
    'focus-visible:ring-2 focus-visible:ring-secondary/50 focus-visible:ring-offset-2',
    'shadow-md hover:shadow-lg',
    'transform hover:-translate-y-0.5 active:translate-y-0'
  ),
  outline: cn(
    'border-2 border-primary text-primary bg-transparent',
    'hover:bg-primary hover:text-white',
    'focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2'
  ),
  ghost: cn(
    'text-gray-700 bg-transparent',
    'hover:bg-gray-100',
    'focus-visible:ring-2 focus-visible:ring-gray-400/50',
    'dark:text-gray-300 dark:hover:bg-gray-800'
  ),
  glass: cn(
    'backdrop-blur-lg',
    'bg-white/20 dark:bg-white/10',
    'border border-white/30 dark:border-white/10',
    'text-gray-800 dark:text-white',
    'hover:bg-white/30 dark:hover:bg-white/20',
    'shadow-glass dark:shadow-glass-dark',
    'focus-visible:ring-2 focus-visible:ring-white/50'
  ),
  gradient: cn(
    'bg-gradient-to-r from-primary to-secondary text-white',
    'hover:brightness-110',
    'shadow-md hover:shadow-lg',
    'transform hover:-translate-y-0.5 active:translate-y-0',
    'focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2'
  ),
};

const Spinner: React.FC<{ size: string }> = ({ size }) => {
  const spinnerSize = size === 'xs' || size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <svg
      className={cn('animate-spin', spinnerSize)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  className,
  type = 'button',
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center font-medium cursor-pointer',
        'transition-all duration-200 ease-out',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none',
        'active:scale-[0.98]',
        sizeStyles[size],
        variantStyles[variant],
        fullWidth && 'w-full',
        loading && 'cursor-wait',
        className
      )}
      onClick={onClick}
      disabled={isDisabled}
      {...props}
    >
      {loading && <Spinner size={size} />}
      {!loading && icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {!loading && iconRight && <span className="flex-shrink-0">{iconRight}</span>}
    </button>
  );
};

export default Button;
