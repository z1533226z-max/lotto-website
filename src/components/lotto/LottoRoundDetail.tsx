'use client';

import React from 'react';
import { Trophy } from 'lucide-react';
import LottoNumbers from './LottoNumbers';
import Card from '@/components/ui/Card';
import JustAnnouncedBadge from './JustAnnouncedBadge';
import TextParts from './TextParts';
import {
  NUMBER_BAND_LABELS,
  PRIZE_TAX_NOTE,
  analyzeRoundNumbers,
  bandLabel,
  patternHeading,
  patternParts,
  patternStats,
  prizeText,
  roundDateLabel,
  roundTitle,
} from '@/lib/roundContent';
import type { LottoResult } from '@/types/lotto';

interface Props {
  data: LottoResult;
  maxRound: number;
  /** 당첨금 표 아래에 넣을 서버 렌더 구역 (다음 추첨·판매점·내 번호 확인) */
  children?: React.ReactNode;
}

/** 등수별 당첨금 행: 1인 당첨금·당첨자 수·세후 실수령액 (미집계는 '집계 중', 집계 끝난 1등 0명만 '이월') */
function PrizeRow({ data, rank }: { data: LottoResult; rank: 1 | 2 }) {
  const t = prizeText(data, rank);
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-600 mb-1">{t.heading}</h3>
      {t.state === 'paid' ? (
        <>
          <p className={`text-xl font-bold ${rank === 1 ? 'text-primary' : 'text-secondary'}`}>{t.amount}</p>
          <p className="text-xs text-gray-500">{t.detail}</p>
          <p className="mt-2 text-sm text-gray-700">
            세후 실수령 <strong className="text-gray-900">{t.net}</strong>
            <span className="block text-xs text-gray-500">{t.netDetail}</span>
          </p>
        </>
      ) : (
        <p className="text-sm text-gray-500">{t.status}</p>
      )}
    </div>
  );
}

const STAT_BG = ['bg-blue-50', 'bg-purple-50', 'bg-green-50', 'bg-amber-50'];

const LottoRoundDetail: React.FC<Props> = ({ data, maxRound, children }) => {
  const a = analyzeRoundNumbers(data.numbers);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              <span className="flex items-center justify-center gap-2 flex-wrap">
                <Trophy className="w-7 h-7 text-yellow-500" /> {roundTitle(data)}
                <JustAnnouncedBadge round={data.round} />
              </span>{' '}
              <span className="block mt-1 text-base md:text-lg font-medium text-gray-600">
                {roundDateLabel(data)}
              </span>
            </h1>
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
            <PrizeRow data={data} rank={1} />
            <PrizeRow data={data} rank={2} />
          </div>
          <p className="text-xs text-gray-400 -mt-3">
            {PRIZE_TAX_NOTE}{' '}
            <a href="/lotto/calculator" className="underline hover:text-primary">세금 계산기</a>
          </p>

          {children}

          {/* 당첨번호 패턴 분석 */}
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 space-y-3">
            <h2 className="text-base font-bold text-gray-800">{patternHeading(data)}</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              <TextParts parts={patternParts(data, a)} />
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              {patternStats(a).map(([label, value], i) => (
                <div key={label} className={`rounded-md ${STAT_BG[i]} py-2`}>
                  <div className="text-xs text-gray-500">{label}</div>
                  <div className="text-sm font-bold text-gray-800">{value}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">번호대별 분포</div>
              <div className="flex flex-wrap gap-1.5">
                {NUMBER_BAND_LABELS.map((label, i) => (
                  <span
                    key={label}
                    className={`text-xs px-2 py-1 rounded-md ${
                      a.bands[i] > 0 ? 'bg-primary/10 text-primary font-medium' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {bandLabel(a, i)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 이전/다음 네비게이션 */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            {data.round > 1 ? (
              <a
                href={`/lotto/${data.round - 1}`}
                className="flex items-center gap-1 text-primary hover:underline"
              >
                ← {data.round - 1}회
              </a>
            ) : <span />}
            <a
              href="/lotto/list"
              className="text-gray-600 hover:text-primary transition-colors"
            >
              전체 목록
            </a>
            {data.round < maxRound ? (
              <a
                href={`/lotto/${data.round + 1}`}
                className="flex items-center gap-1 text-primary hover:underline"
              >
                {data.round + 1}회 →
              </a>
            ) : <span />}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LottoRoundDetail;
