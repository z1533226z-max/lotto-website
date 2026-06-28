'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import LottoNumbers from './LottoNumbers';
import Card from '@/components/ui/Card';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { LottoResult } from '@/types/lotto';

interface Props {
  data: LottoResult;
  maxRound: number;
}

const sorted = (arr: number[]) => [...arr].sort((a, b) => a - b);

const analyzeNumbers = (numbers: number[]) => {
  const nums = sorted(numbers);
  const oddCount = nums.filter(n => n % 2 === 1).length;
  const evenCount = nums.length - oddCount;
  const lowCount = nums.filter(n => n <= 22).length; // 저번호 1~22
  const highCount = nums.length - lowCount;           // 고번호 23~45
  const sum = nums.reduce((a, b) => a + b, 0);
  const lastDigitSum = nums.reduce((a, b) => a + (b % 10), 0);

  // 연속번호 쌍 개수 (예: 14,15 → 1쌍)
  let consecutivePairs = 0;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] - nums[i - 1] === 1) consecutivePairs++;
  }

  // 구간별 분포 (1-9, 10-19, 20-29, 30-39, 40-45)
  const bands = [0, 0, 0, 0, 0];
  nums.forEach(n => {
    if (n <= 9) bands[0]++;
    else if (n <= 19) bands[1]++;
    else if (n <= 29) bands[2]++;
    else if (n <= 39) bands[3]++;
    else bands[4]++;
  });

  return { oddCount, evenCount, lowCount, highCount, sum, lastDigitSum, consecutivePairs, bands };
};

const LottoRoundDetail: React.FC<Props> = ({ data, maxRound }) => {
  const a = analyzeNumbers(data.numbers);
  const sortedNumbers = sorted(data.numbers).join(', ');
  const bandLabels = ['1~9', '10~19', '20~29', '30~39', '40~45'];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <Trophy className="w-7 h-7 text-yellow-500" /> 로또 {data.round}회 당첨번호
            </h1>
            <p className="text-gray-600">
              {formatDate(data.drawDate)} 추첨
            </p>
          </div>

          <div className="flex justify-center">
            <LottoNumbers
              numbers={data.numbers}
              bonusNumber={data.bonusNumber}
              size="lg"
              animated={false}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-1">1등 당첨금</h3>
              <p className="text-xl font-bold text-primary">
                {formatCurrency(data.prizeMoney.first)}
              </p>
              <p className="text-sm text-gray-500">
                {data.prizeMoney.firstWinners}명 당첨
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-1">2등 당첨금</h3>
              <p className="text-xl font-bold text-secondary">
                {formatCurrency(data.prizeMoney.second)}
              </p>
              <p className="text-sm text-gray-500">
                {data.prizeMoney.secondWinners}명 당첨
              </p>
            </div>
          </div>

          {/* 당첨번호 패턴 분석 */}
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 space-y-3">
            <h2 className="text-base font-bold text-gray-800">
              로또 {data.round}회 당첨번호 패턴 분석
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {data.round}회 로또 당첨번호는 <strong>{sortedNumbers}</strong> 이며 보너스 번호는{' '}
              <strong>{data.bonusNumber}</strong>입니다. 이번 회차는 홀수 {a.oddCount}개·짝수{' '}
              {a.evenCount}개로 구성되었고, 저번호(1~22) {a.lowCount}개·고번호(23~45) {a.highCount}개가
              나왔습니다. 당첨번호 6개의 합계는 <strong>{a.sum}</strong>이며,{' '}
              {a.consecutivePairs > 0
                ? `연속번호가 ${a.consecutivePairs}쌍 포함되어 있습니다.`
                : '연속번호는 포함되지 않았습니다.'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="rounded-md bg-blue-50 py-2">
                <div className="text-xs text-gray-500">홀 : 짝</div>
                <div className="text-sm font-bold text-gray-800">{a.oddCount} : {a.evenCount}</div>
              </div>
              <div className="rounded-md bg-purple-50 py-2">
                <div className="text-xs text-gray-500">저 : 고</div>
                <div className="text-sm font-bold text-gray-800">{a.lowCount} : {a.highCount}</div>
              </div>
              <div className="rounded-md bg-green-50 py-2">
                <div className="text-xs text-gray-500">번호 합계</div>
                <div className="text-sm font-bold text-gray-800">{a.sum}</div>
              </div>
              <div className="rounded-md bg-amber-50 py-2">
                <div className="text-xs text-gray-500">연속번호</div>
                <div className="text-sm font-bold text-gray-800">{a.consecutivePairs}쌍</div>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">번호대별 분포</div>
              <div className="flex flex-wrap gap-1.5">
                {a.bands.map((count, i) => (
                  <span
                    key={bandLabels[i]}
                    className={`text-xs px-2 py-1 rounded-md ${
                      count > 0 ? 'bg-primary/10 text-primary font-medium' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {bandLabels[i]}: {count}개
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 이전/다음 네비게이션 */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            {data.round > 1 ? (
              <Link
                href={`/lotto/${data.round - 1}`}
                className="flex items-center gap-1 text-primary hover:underline"
              >
                ← {data.round - 1}회
              </Link>
            ) : <span />}
            <Link
              href="/lotto/list"
              className="text-gray-600 hover:text-primary transition-colors"
            >
              전체 목록
            </Link>
            {data.round < maxRound ? (
              <Link
                href={`/lotto/${data.round + 1}`}
                className="flex items-center gap-1 text-primary hover:underline"
              >
                {data.round + 1}회 →
              </Link>
            ) : <span />}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LottoRoundDetail;
