'use client';

import React, { useState } from 'react';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { Calculator, Trophy, Coins, Banknote, CreditCard, Target, DollarSign } from 'lucide-react';

// 로또 세금 계산
function calculateTax(amount: number) {
  if (amount <= 0) return { gross: 0, tax: 0, net: 0, taxRate: 0, breakdown: [] };

  const breakdown: { label: string; amount: number; rate: number; tax: number }[] = [];

  let totalTax = 0;

  if (amount <= 300_000_000) {
    // 3억 이하: 22% (소득세 20% + 지방소득세 2%)
    totalTax = Math.floor(amount * 0.22);
    breakdown.push({
      label: '3억 이하 구간',
      amount: amount,
      rate: 22,
      tax: totalTax,
    });
  } else {
    // 3억 이하 부분: 22%
    const under300m = 300_000_000;
    const taxUnder = Math.floor(under300m * 0.22);
    breakdown.push({
      label: '3억 이하 구간',
      amount: under300m,
      rate: 22,
      tax: taxUnder,
    });

    // 3억 초과 부분: 33% (소득세 30% + 지방소득세 3%)
    const over300m = amount - 300_000_000;
    const taxOver = Math.floor(over300m * 0.33);
    breakdown.push({
      label: '3억 초과 구간',
      amount: over300m,
      rate: 33,
      tax: taxOver,
    });

    totalTax = taxUnder + taxOver;
  }

  const effectiveRate = amount > 0 ? (totalTax / amount) * 100 : 0;

  return {
    gross: amount,
    tax: totalTax,
    net: amount - totalTax,
    taxRate: effectiveRate,
    breakdown,
  };
}

function formatKRW(amount: number): string {
  if (amount >= 100_000_000) {
    const eok = Math.floor(amount / 100_000_000);
    const man = Math.floor((amount % 100_000_000) / 10_000);
    return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
  }
  if (amount >= 10_000) {
    return `${Math.floor(amount / 10_000).toLocaleString()}만원`;
  }
  return `${amount.toLocaleString()}원`;
}

export default function LottoCalculatorPage() {
  const [inputValue, setInputValue] = useState('');
  const amount = parseInt(inputValue.replace(/[^0-9]/g, '')) || 0;
  const result = calculateTax(amount);

  const presets: { label: string; value: number; icon: React.ReactNode }[] = [
    { label: '1등 평균 (20억)', value: 2_000_000_000, icon: <Trophy className="w-5 h-5 mx-auto" /> },
    { label: '10억', value: 1_000_000_000, icon: <Coins className="w-5 h-5 mx-auto" /> },
    { label: '5억', value: 500_000_000, icon: <Banknote className="w-5 h-5 mx-auto" /> },
    { label: '3억', value: 300_000_000, icon: <Banknote className="w-5 h-5 mx-auto" /> },
    { label: '1억', value: 100_000_000, icon: <CreditCard className="w-5 h-5 mx-auto" /> },
    { label: '2등 평균', value: 50_000_000, icon: <Target className="w-5 h-5 mx-auto" /> },
  ];

  return (
    <>
      <Breadcrumb items={[
        { label: '홈', href: '/' },
        { label: '당첨금 세금 계산기' },
      ]} />

      <div className="max-w-2xl mx-auto">
        {/* Page header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              boxShadow: '0 8px 24px rgba(211, 97, 53, 0.3)',
            }}
          >
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            로또 당첨금 세금 계산기
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            로또 당첨금의 세후 실수령액을 계산해보세요
          </p>
        </div>

        {/* Input Card */}
        <Card variant="glass" padding="lg" className="mb-6">
          <div className="space-y-5">
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: 'var(--text)' }}
              >
                당첨금액 입력
              </label>
              <input
                type="text"
                value={inputValue ? Number(inputValue).toLocaleString() : ''}
                onChange={(e) => setInputValue(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="금액을 입력하세요 (원)"
                className={cn(
                  'w-full px-5 py-4 rounded-xl text-lg font-medium',
                  'transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'
                )}
                style={{
                  backgroundColor: 'var(--bg)',
                  color: 'var(--text)',
                  border: '2px solid var(--border)',
                }}
              />
              {amount > 0 && (
                <p className="text-sm mt-2 font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {formatKRW(amount)}
                </p>
              )}
            </div>

            <div>
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-tertiary)' }}>
                빠른 입력
              </p>
              <div className="grid grid-cols-3 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setInputValue(String(preset.value))}
                    className={cn(
                      'px-3 py-2.5 rounded-xl text-xs font-medium',
                      'transition-all duration-200',
                      'hover:-translate-y-0.5 hover:shadow-md',
                      'active:scale-95'
                    )}
                    style={{
                      backgroundColor: amount === preset.value ? 'var(--primary)' : 'var(--surface-hover)',
                      color: amount === preset.value ? 'white' : 'var(--text-secondary)',
                      border: amount === preset.value ? 'none' : '1px solid var(--border)',
                    }}
                  >
                    <span className="block mb-0.5">{preset.icon}</span>
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {amount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInputValue('')}
                className="w-full"
              >
                초기화
              </Button>
            )}
          </div>
        </Card>

        {/* Results */}
        {amount > 0 && (
          <div className="space-y-4 animate-fadeInUp">
            {/* Net amount - hero card */}
            <div
              className="rounded-2xl p-8 text-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              }}
            >
              {/* Decorative elements */}
              <div
                className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }}
              />
              <div
                className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }}
              />

              <div className="relative z-10 space-y-2">
                <p className="text-sm text-white/80 font-medium">실수령액 (세후)</p>
                <p className="text-4xl md:text-5xl font-black text-white">
                  {formatKRW(result.net)}
                </p>
                <Badge
                  variant="default"
                  className="bg-white/20 text-white border-white/30"
                >
                  실효세율 {result.taxRate.toFixed(1)}%
                </Badge>
              </div>
            </div>

            {/* Gross & Tax breakdown */}
            <div className="grid grid-cols-2 gap-4">
              <Card variant="glass">
                <div className="text-center space-y-1">
                  <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    당첨금 (세전)
                  </p>
                  <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                    {formatKRW(result.gross)}
                  </p>
                </div>
              </Card>
              <Card variant="glass">
                <div className="text-center space-y-1">
                  <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    세금 합계
                  </p>
                  <p className="text-xl font-bold" style={{ color: '#EF4444' }}>
                    -{formatKRW(result.tax)}
                  </p>
                </div>
              </Card>
            </div>

            {/* Tax detail breakdown */}
            {result.breakdown.length > 0 && (
              <Card variant="glass">
                <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
                  세금 상세 내역
                </h3>
                <div className="space-y-3">
                  {result.breakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 border-b last:border-b-0"
                      style={{ borderColor: 'var(--border-light)' }}
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant={item.rate === 22 ? 'info' : 'warning'} size="sm">
                          {item.rate}%
                        </Badge>
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {item.label}
                        </span>
                      </div>
                      <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                        {formatKRW(item.tax)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Info note */}
            <Card variant="outlined" padding="sm">
              <div className="space-y-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                <p>* 3억원 이하: 소득세 20% + 지방소득세 2% = 22%</p>
                <p>* 3억원 초과: 소득세 30% + 지방소득세 3% = 33%</p>
                <p>* 본 계산은 참고용이며, 정확한 세금은 세무서에 문의하세요.</p>
              </div>
            </Card>
          </div>
        )}

        {/* Empty state */}
        {amount === 0 && (
          <Card variant="glass" className="text-center py-12">
            <div className="space-y-3">
              <span className="block"><DollarSign className="w-12 h-12 mx-auto" /></span>
              <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>
                당첨금액을 입력하면 세후 실수령액을 계산합니다
              </p>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                빠른 입력 버튼을 사용하거나 직접 금액을 입력하세요
              </p>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
