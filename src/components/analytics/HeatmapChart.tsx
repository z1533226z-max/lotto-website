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

// ─── Treemap Color Scale (Stock market style) ────────────
// Green = high frequency ("gaining"), Red = low frequency ("losing")
const getTreemapColor = (ratio: number): string => {
  if (ratio >= 0.75) {
    // Hot: deep green
    const t = (ratio - 0.75) / 0.25;
    return `rgb(${Math.round(38 - 8 * t)}, ${Math.round(135 + 30 * t)}, ${Math.round(80 - 15 * t)})`;
  } else if (ratio >= 0.5) {
    // Warm: muted green
    const t = (ratio - 0.5) / 0.25;
    return `rgb(${Math.round(90 - 52 * t)}, ${Math.round(115 + 20 * t)}, ${Math.round(90 - 10 * t)})`;
  } else if (ratio >= 0.25) {
    // Cool: muted / neutral
    const t = (ratio - 0.25) / 0.25;
    return `rgb(${Math.round(170 - 80 * t)}, ${Math.round(95 + 20 * t)}, ${Math.round(80 + 10 * t)})`;
  } else {
    // Cold: red
    const t = ratio / 0.25;
    return `rgb(${Math.round(190 - 20 * t)}, ${Math.round(55 + 40 * t)}, ${Math.round(55 + 25 * t)})`;
  }
};

interface TreemapCell {
  number: number;
  frequency: number;
  lastAppeared: number;
  percentage: number;
  ratio: number;
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({
  data,
  windowSize: initialWindowSize,
  className,
}) => {
  const [windowSize, setWindowSize] = useState(initialWindowSize || 50);
  const [hoveredCell, setHoveredCell] = useState<TreemapCell | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const cells = useMemo((): TreemapCell[] => {
    if (!data || data.length === 0) return [];

    const effectiveWindow = windowSize === 0 ? data.length : windowSize;
    const stats = LottoStatisticsAnalyzer.generateTimeWindowedStats(data, effectiveWindow);
    const sortedData = [...data].sort((a, b) => b.round - a.round);

    const frequencies = stats.map((s) => s.frequency);
    const minFreq = Math.min(...frequencies);
    const maxFreq = Math.max(...frequencies);
    const range = maxFreq - minFreq || 1;

    return stats.map((stat) => {
      const windowData = sortedData.slice(0, Math.min(effectiveWindow, sortedData.length));
      const totalNumbers = windowData.length * 7;
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

  // Sort by frequency descending for treemap (biggest = most frequent)
  const sortedCells = useMemo(() => {
    return [...cells].sort((a, b) => b.frequency - a.frequency);
  }, [cells]);

  const handleMouseEnter = (cell: TreemapCell, e: React.MouseEvent) => {
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

  // Treemap sizing: frequency determines relative area
  const getFlexBasis = (cell: TreemapCell): string => {
    const minBasis = 6;
    const maxBasis = 13;
    const basis = minBasis + (cell.ratio * (maxBasis - minBasis));
    return `${basis}%`;
  };

  const getHeight = (cell: TreemapCell): string => {
    const minH = 60;
    const maxH = 100;
    const h = minH + (cell.ratio * (maxH - minH));
    return `${h}px`;
  };

  return (
    <Card variant="default" className={className}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>
            번호 트리맵
          </h3>
        </div>

        <div className="flex gap-1">
          {WINDOW_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setWindowSize(opt.value)}
              className="px-3 py-1 text-xs rounded-full font-medium transition-all duration-200"
              style={{
                backgroundColor: windowSize === opt.value ? 'var(--primary)' : 'var(--surface-hover)',
                color: windowSize === opt.value ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>
        크기가 클수록 자주 출현 · 초록=고빈도(HOT), 빨강=저빈도(COLD)
      </p>

      {/* Treemap */}
      <div className="relative" data-heatmap-container>
        <div className="flex flex-wrap gap-1">
          {sortedCells.map((cell) => {
            const bgColor = getTreemapColor(cell.ratio);
            const isHovered = hoveredCell?.number === cell.number;

            return (
              <button
                key={cell.number}
                className={cn(
                  'rounded-lg flex flex-col items-center justify-center',
                  'font-bold transition-all duration-200',
                  'cursor-default relative overflow-hidden',
                  isHovered && 'ring-2 ring-white shadow-lg z-10',
                )}
                style={{
                  backgroundColor: bgColor,
                  color: '#fff',
                  flexBasis: getFlexBasis(cell),
                  flexGrow: 1,
                  height: getHeight(cell),
                  minWidth: '38px',
                  textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  transform: isHovered ? 'scale(1.06)' : undefined,
                }}
                onMouseEnter={(e) => handleMouseEnter(cell, e)}
                onMouseLeave={() => setHoveredCell(null)}
              >
                <span className="text-sm sm:text-base font-extrabold leading-none">
                  {cell.number}
                </span>
                <span className="text-[9px] sm:text-[10px] opacity-80 leading-none mt-1">
                  {cell.frequency}회
                </span>
                {cell.ratio >= 0.85 && (
                  <span className="text-[7px] opacity-60 leading-none mt-0.5 tracking-wider">
                    ▲ HOT
                  </span>
                )}
                {cell.ratio <= 0.15 && (
                  <span className="text-[7px] opacity-60 leading-none mt-0.5 tracking-wider">
                    ▼ COLD
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tooltip */}
        {hoveredCell && (
          <div
            className="absolute z-50 pointer-events-none rounded-lg shadow-xl p-3 text-xs min-w-[160px] transform -translate-x-1/2 -translate-y-full"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y,
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm text-white"
                style={{
                  backgroundColor: getTreemapColor(hoveredCell.ratio),
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}
              >
                {hoveredCell.number}
              </div>
              <span className="font-bold" style={{ color: 'var(--text)' }}>
                {hoveredCell.number}번
              </span>
            </div>
            <div className="space-y-1" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex justify-between gap-4">
                <span>출현 횟수</span>
                <span className="font-semibold" style={{ color: 'var(--text)' }}>{hoveredCell.frequency}회</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>출현율</span>
                <span className="font-semibold" style={{ color: 'var(--text)' }}>{hoveredCell.percentage.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>마지막 출현</span>
                <span className="font-semibold" style={{ color: 'var(--text)' }}>{hoveredCell.lastAppeared}회차</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>미출현</span>
                <span className="font-semibold" style={{ color: 'var(--text)' }}>
                  {latestRound - hoveredCell.lastAppeared}회
                </span>
              </div>
            </div>
            <div
              className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 rotate-45"
              style={{
                backgroundColor: 'var(--surface)',
                borderRight: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
              }}
            />
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getTreemapColor(0.1) }} />
          <span>저빈도 (COLD)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getTreemapColor(0.5) }} />
          <span>보통</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getTreemapColor(0.9) }} />
          <span>고빈도 (HOT)</span>
        </div>
      </div>

      <div className="mt-2 text-[10px] text-center" style={{ color: 'var(--text-tertiary)' }}>
        {windowSize === 0 ? '전체 회차' : `최근 ${windowSize}회차`} 기준 · 크기=빈도순 · 마우스 올려서 상세 확인
      </div>
    </Card>
  );
};

export default HeatmapChart;
