'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SolarIconProps {
  /** Solar icon name, e.g. 'arrow-right-linear', 'home-bold' */
  name: string;
  /** Icon size in pixels */
  size?: number;
  /** Additional CSS classes */
  className?: string;
  /** Inline color override */
  color?: string;
}

/**
 * Supanova Solar Icon Wrapper
 * Wraps Iconify Solar icon set for consistent usage.
 * Requires Iconify script loaded in layout.
 *
 * Usage: <SolarIcon name="arrow-right-linear" size={24} />
 */
const SolarIcon: React.FC<SolarIconProps> = ({
  name,
  size = 20,
  className,
  color,
}) => {
  return (
    // @ts-expect-error — iconify-icon is a web component, not a React intrinsic
    <iconify-icon
      icon={`solar:${name}`}
      width={size}
      height={size}
      class={cn('inline-flex shrink-0', className)}
      style={color ? { color } : undefined}
    />
  );
};

export default SolarIcon;
