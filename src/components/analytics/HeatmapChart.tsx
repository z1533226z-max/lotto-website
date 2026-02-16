'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import { LottoStatisticsAnalyzer } from '@/lib/statisticsAnalyzer';
import type { LottoResult } from '@/types/lotto';

interface HeatmapChartProps {
  data: LottoResult[];
  windowSize?: number;
  className?: string;
}

const WINDOW_OPTIONS = [
  { label: '최근 20회', value: 20 },
  { label: '최근 50회', value: 50 },
  { label: '최근 100회', value: 100 },
  { label: '전체', value: 0 },
];

/** Interpolate between colors based on a 0-1 value */
const getHeatColor = (ratio: number): string => {
  // cold (blue) -> warm (yellow) -> hot (red)
  if (ratio <= 0.5) {
    // blue to yellow
    const t = ratio * 2;
    const r = Math.round(59 + (250 - 59) * t);
    const g = Math.round(130 + (204 - 130) * t);
    const b = Math.round(246 + (21 - 246) * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // yellow to red
    const t = (ratio - 0.5) * 2;
    const r = Math.round(250 + (239 - 250) * t);
    const g = Math.round(204 + (68 - 204) * t);
    const b = Math.round(21 + (68 - 21) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
};

/** Get text color for contrast on heatmap cells */
const getHeatTextColor = (ratio: number): string => {
  // Dark text for lighter middle range, white for extremes
  if (ratio > 0.3 && ratio < 0.7) return '#1a1a1a';
  return '#ffffff';
};

interface HeatmapCell {
  number: number;
  frequency: number;
  lastAppeared: number;
  percentage: number;
  ratio: number; // 0-1 normalized
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({
  data,
  windowSize: initialWindowSize,
  className,
}) => {
  const [windowSize, setWindowSize] = useState(initialWindowSize || 50);
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const cells = useMemo((): HeatmapCell[] => {
    if (!data || data.length === 0) return [];

    const effectiveWindow = windowSize === 0 ? data.length : windowSize;
    const stats = LottoStatisticsAnalyzer.generateTimeWindowedStats(data, effectiveWindow);
    const sortedData = [...data].sort((a, b) => b.round - a.round);
    const latestRound = sortedData[0]?.round || 0;

    // Find min/max frequency for normalization
    const frequencies = stats.map((s) => s.frequency);
    const minFreq = Math.min(...frequencies);
    const maxFreq = Math.max(...frequencies);
    const range = maxFreq - minFreq || 1;

    return stats.map((stat) => {
      const windowData = sortedData.slice(0, Math.min(effectiveWindow, sortedData.length));
      const totalNumbers = windowData.length * 7; // 6 main + 1 bonus per round
      const percentage = totalNumbers > 0 ? (stat.frequency / totalNumbers) * 100 : 0;

      return {
        number: stat.number,
        frequency: stat.frequency,
        lastAppeared: stat.lastAppeared,
        percentage,
        ratio: (stat.frequency - minFreq) / range,
      };
    });
  }, [data, windowSize]);

  const latestRound = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return Math.max(...data.map((d) => d.round));
  }, [data]);

  const handleMouseEnter = (cell: HeatmapCell, e: React.MouseEvent) => {
    setHoveredCell(cell);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const containerRect = (e.currentTarget as HTMLElement).closest('[data-heatmap-container]')?.getBoundingClientRect();
    if (containerRect) {
      setTooltipPos({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top - 10,
      });
    }
  };

  // 9 columns x 5 rows grid
  const COLS = 9;

  return (
    <Card variant="glass" className={className}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🗺️</span>
          <h3 className="text-lg font-bold text-gray-800 dark:text-dark-text">
            번호 히트맵
          </h3>
        </div>

        {/* Window Selector */}
        <div className="flex gap-1">
          {WINDOW_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setWindowSize(opt.value)}
              className={cn(
                'px-3 py-1 text-xs rounded-full font-medium transition-all duration-200',
                windowSize === opt.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-surface-hover'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mb-4">
        색상이 진할수록 해당 구간에서 자주 출현한 번호입니다
      </p>

      {/* Heatmap Grid */}
      <div className="relative" data-heatmap-container>
        <div
          className="grid gap-1.5 sm:gap-2"
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        >
          {cells.map((cell) => {
            const bgColor = getHeatColor(cell.ratio);
            const textColor = getHeatTextColor(cell.ratio);
            const roundsAbsent = latestRound - cell.lastAppeared;

            return (
              <button
                key={cell.number}
                className={cn(
                  'aspect-square rounded-lg flex flex-col items-center justify-center',
                  'text-xs sm:text-sm font-bold',
                  'transition-all duration-200',
                  'hover:scale-110 hover:z-10 hover:shadow-lg',
                  'cursor-default',
                  hoveredCell?.number === cell.number && 'ring-2 ring-white ring-offset-2 ring-offset-gray-100 dark:ring-offset-dark-bg scale-110 z-10'
                )}
                style={{
                  backgroundColor: bgColor,
                  color: textColor,
                }}
                onMouseEnter={(e) => handleMouseEnter(cell, e)}
                onMouseLeave={() => setHoveredCell(null)}
              >
                <span className="font-bold leading-none">{cell.number}</span>
                <span className="text-[8px] sm:text-[9px] opacity-80 leading-none mt-0.5">
                  {cell.frequency}회
                </span>
              </button>
            );
          })}
        </div>

        {/* Tooltip */}
        {hoveredCell && (
          <div
            className={cn(
              'absolute z-50 pointer-events-none',
              'bg-white dark:bg-dark-surface',
              'border border-gray-200 dark:border-dark-border',
              'rounded-lg shadow-xl p-3',
              'text-xs min-w-[160px]',
              'transform -translate-x-1/2 -translate-y-full'
            )}
            style={{ left: tooltipPos.x, top: tooltipPos.y }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm"
                style={{
                  backgroundColor: getHeatColor(hoveredCell.ratio),
                  color: getHeatTextColor(hoveredCell.ratio),
                }}
              >
                {hoveredCell.number}
              </div>
              <span className="font-bold text-gray-800 dark:text-dark-text">
                {hoveredCell.number}번
              </span>
            </div>
            <div className="space-y-1 text-gray-600 dark:text-dark-text-secondary">
              <div className="flex justify-between">
                <span>출현 횟수</span>
                <span className="font-semibold text-gray-800 dark:text-dark-text">{hoveredCell.frequency}회</span>
              </div>
              <div className="flex justify-between">
                <span>출현율</span>
                <span className="font-semibold text-gray-800 dark:text-dark-text">{hoveredCell.percentage.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>마지막 출현</span>
                <span className="font-semibold text-gray-800 dark:text-dark-text">{hoveredCell.lastAppeared}회차</span>
              </div>
              <div className="flex justify-between">
                <span>미출현 기간</span>
                <span className="font-semibold text-gray-800 dark:text-dark-text">
                  {latestRound - hoveredCell.lastAppeared}회
                </span>
              </div>
            </div>
            {/* Tooltip arrow */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 rotate-45 bg-white dark:bg-dark-surface border-r border-b border-gray-200 dark:border-dark-border" />
          </div>
        )}
      </div>

      {/* Color Scale Legend */}
      <div className="mt-4 flex items-center justify-center gap-3 text-[10px] text-gray-500 dark:text-dark-text-tertiary">
        <span>저빈도</span>
        <div className="flex h-3 rounded-full overflow-hidden w-32">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="flex-1"
              style={{ backgroundColor: getHeatColor(i / 19) }}
            />
          ))}
        </div>
        <span>고빈도</span>
      </div>

      <div className="mt-2 text-[10px] text-center text-gray-400 dark:text-dark-text-tertiary">
        {windowSize === 0 ? '전체 회차' : `최근 ${windowSize}회차`} 기준 | 번호 위에 마우스를 올려 상세 정보 확인
      </div>
    </Card>
  );
};

export default HeatmapChart;
