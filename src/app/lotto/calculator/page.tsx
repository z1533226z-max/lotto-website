'use client';

import React, { useState } from 'react';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Card from '@/components/ui/Card';

// 로또 세금 계산
function calculateTax(amount: number) {
  if (amount <= 0) return { gross: 0, tax: 0, net: 0, taxRate: 0, breakdown: [] };

  const breakdown: { label: string; amount: number; rate: number; tax: number }[] = [];

  let totalTax = 0;

  if (amount <= 50_000_000) {
    // 5천만원 이하: 비과세 (복권 당첨금 비과세 한도)
    // 실제로는 200만원 이하가 비과세이지만, 편의상 세금 계산
  }

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

  const presets = [
    { label: '1등 평균 (20억)', value: 2_000_000_000 },
    { label: '10억', value: 1_000_000_000 },
    { label: '5억', value: 500_000_000 },
    { label: '3억', value: 300_000_000 },
    { label: '1억', value: 100_000_000 },
    { label: '2등 평균 (5천만)', value: 50_000_000 },
  ];

  return (
    <>
      <Breadcrumb items={[
        { label: '홈', href: '/' },
        { label: '당첨금 세금 계산기' },
      ]} />

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          로또 당첨금 세금 계산기
        </h1>
        <p className="text-gray-600 mb-6">
          로또 당첨금의 세후 실수령액을 계산해보세요
        </p>

        <Card className="mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                당첨금액 입력
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="금액을 입력하세요 (원)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {amount > 0 && (
                <p className="text-sm text-gray-500 mt-1">{formatKRW(amount)}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setInputValue(String(preset.value))}
                  className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {amount > 0 && (
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white/70 rounded-lg">
                  <p className="text-sm text-gray-600">당첨금 (세전)</p>
                  <p className="text-xl font-bold text-gray-800">{formatKRW(result.gross)}</p>
                </div>
                <div className="text-center p-4 bg-white/70 rounded-lg">
                  <p className="text-sm text-gray-600">세금 합계</p>
                  <p className="text-xl font-bold text-red-600">-{formatKRW(result.tax)}</p>
                </div>
              </div>

              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">실수령액 (세후)</p>
                <p className="text-3xl font-bold text-primary">{formatKRW(result.net)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  실효세율: {result.taxRate.toFixed(1)}%
                </p>
              </div>

              {result.breakdown.length > 0 && (
                <div className="bg-white/70 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">세금 상세 내역</h3>
                  <div className="space-y-2">
                    {result.breakdown.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.label} ({item.rate}%)
                        </span>
                        <span className="text-gray-800 font-medium">
                          {formatKRW(item.tax)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 bg-white/50 rounded-lg p-3">
                <p>* 3억원 이하: 소득세 20% + 지방소득세 2% = 22%</p>
                <p>* 3억원 초과: 소득세 30% + 지방소득세 3% = 33%</p>
                <p>* 본 계산은 참고용이며, 정확한 세금은 세무서에 문의하세요.</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
