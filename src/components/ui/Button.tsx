'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { SIZE_CLASSES } from '@/lib/constants';
import type { ButtonProps } from '@/types/lotto';

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
  ...props
}) => {
  const baseClasses = cn(
    'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    SIZE_CLASSES.BUTTON[size]
  );

  const variantClasses = {
    primary: cn(
      'bg-gradient-to-r from-primary to-primary/90 text-white',
      'hover:from-primary/90 hover:to-primary/80 focus:ring-primary/50',
      'shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
    ),
    secondary: cn(
      'bg-gradient-to-r from-secondary to-secondary/90 text-white',
      'hover:from-secondary/90 hover:to-secondary/80 focus:ring-secondary/50',
      'shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
    ),
    outline: cn(
      'border-2 border-primary text-primary bg-transparent',
      'hover:bg-primary hover:text-white focus:ring-primary/50',
      'transition-colors duration-200'
    )
  };

  return (
    <button
      type="button"
      className={cn(baseClasses, variantClasses[variant], className)}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;