'use client';

import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type TabVariant = 'default' | 'pills' | 'underline';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: TabVariant;
  className?: string;
  fullWidth?: boolean;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
  className,
  fullWidth = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});

  // Calculate underline indicator position
  useEffect(() => {
    if (variant === 'underline' && activeRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeEl = activeRef.current;
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();

      setIndicatorStyle({
        left: activeRect.left - containerRect.left + container.scrollLeft,
        width: activeRect.width,
      });
    }
  }, [activeTab, variant]);

  // Scroll active tab into view on mobile
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeTab]);

  const containerStyles: Record<TabVariant, string> = {
    default: cn(
      'bg-gray-100 dark:bg-dark-surface p-1 rounded-xl',
      'border border-gray-200 dark:border-dark-border'
    ),
    pills: 'gap-2',
    underline: cn(
      'border-b-2 border-gray-200 dark:border-dark-border',
      'relative'
    ),
  };

  const tabBaseStyles: Record<TabVariant, string> = {
    default: cn(
      'rounded-lg px-4 py-2 text-sm font-medium',
      'transition-all duration-200'
    ),
    pills: cn(
      'rounded-full px-4 py-2 text-sm font-medium',
      'transition-all duration-200',
      'border border-transparent'
    ),
    underline: cn(
      'px-4 py-2.5 text-sm font-medium relative',
      'transition-all duration-200'
    ),
  };

  const tabInactiveStyles: Record<TabVariant, string> = {
    default: cn(
      'text-gray-600 dark:text-dark-text-secondary',
      'hover:text-gray-900 dark:hover:text-dark-text',
      'hover:bg-gray-50 dark:hover:bg-dark-surface-hover'
    ),
    pills: cn(
      'text-gray-600 dark:text-dark-text-secondary',
      'hover:text-gray-900 dark:hover:text-dark-text',
      'hover:bg-gray-100 dark:hover:bg-dark-surface',
      'hover:border-gray-200 dark:hover:border-dark-border'
    ),
    underline: cn(
      'text-gray-500 dark:text-dark-text-tertiary',
      'hover:text-gray-700 dark:hover:text-dark-text-secondary',
      'hover:border-b-2 hover:border-gray-300 dark:hover:border-dark-surface-active',
      '-mb-[2px]'
    ),
  };

  const tabActiveStyles: Record<TabVariant, string> = {
    default: cn(
      'bg-white dark:bg-dark-surface-hover',
      'text-gray-900 dark:text-dark-text',
      'shadow-sm'
    ),
    pills: cn(
      'bg-primary text-white',
      'shadow-lg shadow-primary/20',
      'border-primary'
    ),
    underline: cn(
      'text-primary dark:text-primary-400',
      '-mb-[2px]'
    ),
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex overflow-x-auto scrollbar-none',
        '-mx-4 px-4 sm:mx-0 sm:px-0', // Mobile horizontal scroll with padding
        containerStyles[variant],
        fullWidth && 'w-full',
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            ref={isActive ? activeRef : undefined}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            className={cn(
              tabBaseStyles[variant],
              isActive ? tabActiveStyles[variant] : tabInactiveStyles[variant],
              fullWidth && 'flex-1',
              'whitespace-nowrap',
              'flex items-center justify-center gap-2'
            )}
            onClick={() => onChange(tab.id)}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            {tab.label}
          </button>
        );
      })}

      {/* Animated underline indicator */}
      {variant === 'underline' && (
        <div
          className={cn(
            'absolute bottom-0 h-0.5 rounded-full',
            'bg-primary dark:bg-primary-400',
            'transition-all duration-300 ease-out'
          )}
          style={indicatorStyle}
        />
      )}
    </div>
  );
};

export default Tabs;
