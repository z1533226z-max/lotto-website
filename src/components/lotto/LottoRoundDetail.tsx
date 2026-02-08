'use client';

import React from 'react';
import Link from 'next/link';
import LottoNumbers from './LottoNumbers';
import Card from '@/components/ui/Card';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { LottoResult } from '@/types/lotto';

interface Props {
  data: LottoResult;
  maxRound: number;
}

const LottoRoundDetail: React.FC<Props> = ({ data, maxRound }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              🏆 {data.round}회 로또 당첨번호
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
