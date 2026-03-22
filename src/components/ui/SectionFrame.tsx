'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface SectionFrameProps {
  children: React.ReactNode;
  className?: string;
  /** Section padding size */
  size?: 'sm' | 'md' | 'lg';
  /** Eyebrow tag text above the section heading */
  eyebrow?: string;
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** Enable scroll-triggered fade-in animation */
  animate?: boolean;
  /** Stagger index for cascade animations */
  index?: number;
  /** Max width constraint */
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  /** Heading level — use 1 for page headers, 2 for section headers */
  headingLevel?: 1 | 2 | 3;
}

const sizeStyles: Record<string, string> = {
  sm: 'py-12 md:py-16',
  md: 'py-16 md:py-24',
  lg: 'py-24 md:py-32 lg:py-40',
};

const maxWidthStyles: Record<string, string> = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

/**
 * Supanova Section Frame
 * Provides consistent section rhythm with optional scroll animation,
 * eyebrow tags, and proper Korean typography.
 */
const SectionFrame: React.FC<SectionFrameProps> = ({
  children,
  className,
  size = 'md',
  eyebrow,
  title,
  subtitle,
  animate = true,
  index = 0,
  maxWidth = '7xl',
  headingLevel = 2,
}) => {
  const HeadingTag = `h${headingLevel}` as const;
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(!animate);

  useEffect(() => {
    if (!animate || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [animate]);

  return (
    <section
      ref={ref}
      className={cn(
        sizeStyles[size],
        'px-4 sm:px-6 lg:px-8',
        className
      )}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(2rem)',
        filter: isVisible ? 'blur(0)' : 'blur(4px)',
        transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1)`,
        transitionDelay: `${index * 80}ms`,
      }}
    >
      <div className={cn(maxWidthStyles[maxWidth], 'mx-auto')}>
        {/* Section header */}
        {(eyebrow || title || subtitle) && (
          <div className="mb-8 md:mb-12">
            {eyebrow && (
              <span className={cn(
                'inline-block rounded-full px-3 py-1 mb-4',
                'text-[11px] uppercase tracking-[0.15em] font-medium',
                'bg-primary/10 text-primary'
              )}>
                {eyebrow}
              </span>
            )}
            {title && (
              <HeadingTag className={cn(
                'text-2xl md:text-3xl lg:text-4xl',
                'font-bold tracking-tight leading-tight',
                'break-keep-all'
              )}
              style={{ color: 'var(--text)' }}
              >
                {title}
              </HeadingTag>
            )}
            {subtitle && (
              <p className={cn(
                'mt-3 text-base md:text-lg leading-relaxed',
                'max-w-[65ch] break-keep-all'
              )}
              style={{ color: 'var(--text-secondary)' }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}

        {children}
      </div>
    </section>
  );
};

export default SectionFrame;
