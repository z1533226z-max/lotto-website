'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { LottoStatisticsAnalyzer } from '@/lib/statisticsAnalyzer';
import type { LottoResult } from '@/types/lotto';

interface TrendChartProps {
  data: LottoResult[];
  selectedNumbers?: number[];
  className?: string;
}

const WINDOW_OPTIONS = [
  { label: '최근 10회', value: 10 },
  { label: '최근 20회', value: 20 },
  { label: '최근 50회', value: 50 },
  { label: '최근 100회', value: 100 },
];

const LINE_COLORS = [
  '#FF6B35', // orange
  '#004E98', // blue
  '#10B981', // emerald
  '#8B5CF6', // purple
  '#EC4899', // pink
];

/** Get ball background color for the number picker */
const getPickerBg = (num: number): string => {
  if (num <= 10) return 'bg-yellow-400 text-gray-900';
  if (num <= 20) return 'bg-blue-500 text-white';
  if (num <= 30) return 'bg-red-500 text-white';
  if (num <= 40) return 'bg-gray-500 text-white';
  return 'bg-green-500 text-white';
};

const TrendChart: React.FC<TrendChartProps> = ({
  data,
  selectedNumbers: initialSelected,
  className,
}) => {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>(
    initialSelected && initialSelected.length > 0 ? initialSelected.slice(0, 5) : [1, 7, 14, 28, 42]
  );
  const [windowSize, setWindowSize] = useState(10);
  const [showPicker, setShowPicker] = useState(false);

  const STEPS = 10; // Number of time windows to show

  const toggleNumber = useCallback((num: number) => {
    setSelectedNumbers((prev) => {
      if (prev.includes(num)) {
        return prev.filter((n) => n !== num);
      }
      if (prev.length >= 5) return prev; // Max 5
      return [...prev, num];
    });
  }, []);

  // Build chart data from time series
  const chartData = useMemo(() => {
    if (!data || data.length === 0 || selectedNumbers.length === 0) return [];

    // Get time series for each selected number
    const allSeries = selectedNumbers.map((num) => {
      return {
        number: num,
        series: LottoStatisticsAnalyzer.getTrendTimeSeries(num, data, windowSize, STEPS),
      };
    });

    // Use the first series' labels as the base
    const baseLabels = allSeries[0]?.series.labels || [];
    if (baseLabels.length === 0) return [];

    return baseLabels.map((label, index) => {
      const point: Record<string, string | number> = { name: label };
      for (const s of allSeries) {
        point[`num_${s.number}`] = s.series.values[index] ?? 0;
      }
      return point;
    });
  }, [data, selectedNumbers, windowSize]);

  return (
    <Card variant="glass" className={className}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">📈</span>
          <h3 className="text-lg font-bold text-gray-800 dark:text-dark-text">
            번호 트렌드 분석
          </h3>
        </div>

        {/* Window Size Selector */}
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

      {/* Selected Numbers Display */}
      <div className="mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 dark:text-dark-text-tertiary">선택 번호:</span>
          {selectedNumbers.map((num, idx) => (
            <button
              key={num}
              onClick={() => toggleNumber(num)}
              className={cn(
                'w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center',
                'transition-all duration-200 hover:scale-110',
                getPickerBg(num)
              )}
              style={{ boxShadow: `0 2px 6px ${LINE_COLORS[idx]}40` }}
              title={`${num}번 제거`}
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => setShowPicker(!showPicker)}
            className={cn(
              'w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center',
              'border-2 border-dashed transition-all duration-200',
              selectedNumbers.length >= 5
                ? 'border-gray-300 dark:border-dark-border text-gray-400 cursor-not-allowed'
                : 'border-primary text-primary hover:bg-primary/10'
            )}
            disabled={selectedNumbers.length >= 5 && !showPicker}
          >
            {showPicker ? '-' : '+'}
          </button>
          {selectedNumbers.length < 5 && (
            <span className="text-[10px] text-gray-400 dark:text-dark-text-tertiary">
              최대 5개
            </span>
          )}
        </div>
      </div>

      {/* Number Picker Grid */}
      {showPicker && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-dark-surface rounded-lg">
          <div className="grid grid-cols-9 gap-1">
            {Array.from({ length: 45 }, (_, i) => i + 1).map((num) => {
              const isSelected = selectedNumbers.includes(num);
              return (
                <button
                  key={num}
                  onClick={() => toggleNumber(num)}
                  disabled={!isSelected && selectedNumbers.length >= 5}
                  className={cn(
                    'w-8 h-8 rounded-full text-[10px] font-bold flex items-center justify-center',
                    'transition-all duration-150',
                    isSelected
                      ? cn(getPickerBg(num), 'ring-2 ring-offset-1 ring-primary scale-110')
                      : selectedNumbers.length >= 5
                        ? 'bg-gray-200 dark:bg-dark-surface-hover text-gray-400 dark:text-dark-text-tertiary cursor-not-allowed'
                        : 'bg-gray-200 dark:bg-dark-surface-hover text-gray-600 dark:text-dark-text-secondary hover:bg-gray-300 dark:hover:bg-dark-surface-active'
                  )}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 ? (
        <div className="w-full h-[300px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--chart-grid, #e5e7eb)"
                opacity={0.5}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: 'var(--chart-text, #6b7280)' }}
                tickLine={false}
                axisLine={{ stroke: 'var(--chart-grid, #e5e7eb)' }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--chart-text, #6b7280)' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, #ffffff)',
                  border: '1px solid var(--tooltip-border, #e5e7eb)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                labelStyle={{ fontWeight: 'bold', marginBottom: 4 }}
              />
              <Legend
                formatter={(value: string) => {
                  const num = value.replace('num_', '');
                  return `${num}번`;
                }}
                wrapperStyle={{ fontSize: '12px' }}
              />
              {selectedNumbers.map((num, idx) => (
                <Line
                  key={num}
                  type="monotone"
                  dataKey={`num_${num}`}
                  name={`num_${num}`}
                  stroke={LINE_COLORS[idx]}
                  strokeWidth={2}
                  dot={{ r: 3, fill: LINE_COLORS[idx] }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-dark-text-secondary">
          번호를 선택하면 트렌드 차트가 표시됩니다
        </div>
      )}

      {/* Legend explanation */}
      <div className="mt-3 text-[11px] text-gray-400 dark:text-dark-text-tertiary text-center">
        각 구간({windowSize}회차)별 선택 번호의 출현 횟수 추이
      </div>
    </Card>
  );
};

export default TrendChart;
