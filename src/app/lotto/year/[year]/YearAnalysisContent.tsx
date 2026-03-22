'use client';

import Link from 'next/link';
import LottoNumbers from '@/components/lotto/LottoNumbers';
import SectionFrame from '@/components/ui/SectionFrame';

interface YearRound {
  round: number;
  drawDate: string;
  numbers: number[];
  bonusNumber: number;
  firstPrize: number;
  firstWinners: number;
}

interface Props {
  year: number;
  roundCount: number;
  firstRound: number;
  lastRound: number;
  top10: { number: number; count: number }[];
  bottom10: { number: number; count: number }[];
  avgFirstPrize: number;
  maxFirstPrize: number;
  totalFirstWinners: number;
  oddCount: number;
  evenCount: number;
  sections: number[];
  allYears: number[];
  yearData: YearRound[];
}

const formatMoney = (amount: number): string => {
  if (amount >= 100000000) return `${(amount / 100000000).toFixed(1)}억원`;
  if (amount >= 10000) return `${(amount / 10000).toFixed(0)}만원`;
  return `${amount}원`;
};

const getBallColor = (num: number): string => {
  if (num <= 10) return '#FFC107';
  if (num <= 20) return '#2196F3';
  if (num <= 30) return '#FF5722';
  if (num <= 40) return '#757575';
  return '#4CAF50';
};

const sectionLabels = ['1~10', '11~20', '21~30', '31~40', '41~45'];
const sectionColors = ['#FFC107', '#2196F3', '#FF5722', '#757575', '#4CAF50'];

export default function YearAnalysisContent({
  year, roundCount, firstRound, lastRound, top10, bottom10,
  avgFirstPrize, maxFirstPrize, totalFirstWinners,
  oddCount, evenCount, sections, allYears, yearData,
}: Props) {
  const totalNumbers = oddCount + evenCount;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <SectionFrame
        eyebrow="연도별 분석"
        title={`${year}년 로또 당첨번호 분석`}
        subtitle={`${firstRound}회 ~ ${lastRound}회 | 총 ${roundCount}회 추첨`}
        size="sm"
        animate={false}
        maxWidth="full"
        headingLevel={1}
        className="px-0"
      >
        <div />
      </SectionFrame>

      {/* 핵심 지표 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="추첨 횟수" value={`${roundCount}회`} sub={`${firstRound}~${lastRound}회`} />
        <StatCard label="1등 평균 당첨금" value={formatMoney(avgFirstPrize)} sub={`최대 ${formatMoney(maxFirstPrize)}`} />
        <StatCard label="1등 당첨자 수" value={`${totalFirstWinners}명`} sub={`회당 평균 ${(totalFirstWinners / roundCount).toFixed(1)}명`} />
        <StatCard label="홀짝 비율" value={`${((oddCount / totalNumbers) * 100).toFixed(0)}:${((evenCount / totalNumbers) * 100).toFixed(0)}`} sub={`홀 ${oddCount} / 짝 ${evenCount}`} />
      </div>

      {/* 가장 많이 나온 번호 TOP 10 */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold mb-4">🔥 {year}년 가장 많이 나온 번호 TOP 10</h2>
        <div className="space-y-3">
          {top10.map((item, i) => (
            <div key={item.number} className="flex items-center gap-3">
              <span className="text-sm font-bold w-8">{i + 1}위</span>
              <LottoNumbers numbers={[item.number]} size="sm" />
              <div className="flex-1">
                <div className="h-6 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                  <div
                    className="h-full rounded-full flex items-center px-2"
                    style={{
                      width: `${Math.max((item.count / top10[0].count) * 100, 15)}%`,
                      backgroundColor: getBallColor(item.number),
                    }}
                  >
                    <span className="text-xs font-bold text-white">{item.count}회</span>
                  </div>
                </div>
              </div>
              <Link
                href={`/lotto/number/${item.number}`}
                className="text-xs px-2 py-1 rounded hover:opacity-80"
                style={{ backgroundColor: 'var(--border)', color: 'var(--text-secondary)' }}
              >
                상세
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* 가장 적게 나온 번호 */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold mb-4">🧊 {year}년 가장 적게 나온 번호</h2>
        <div className="flex flex-wrap gap-3">
          {bottom10.map(item => (
            <Link key={item.number} href={`/lotto/number/${item.number}`} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:opacity-80" style={{ backgroundColor: 'var(--border)' }}>
              <LottoNumbers numbers={[item.number]} size="xs" />
              <span className="text-sm">{item.count}회</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 구간별 분포 */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold mb-4">📊 구간별 번호 분포</h2>
        <div className="space-y-3">
          {sections.map((count, i) => {
            const maxCount = Math.max(...sections);
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm font-medium w-16">{sectionLabels[i]}</span>
                <div className="flex-1">
                  <div className="h-6 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                    <div
                      className="h-full rounded-full flex items-center px-2"
                      style={{
                        width: `${(count / maxCount) * 100}%`,
                        backgroundColor: sectionColors[i],
                      }}
                    >
                      <span className="text-xs font-bold text-white">{count}회</span>
                    </div>
                  </div>
                </div>
                <span className="text-sm w-12 text-right" style={{ color: 'var(--text-secondary)' }}>
                  {((count / totalNumbers) * 100).toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 당첨번호 목록 */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold mb-4">📋 {year}년 전체 당첨번호</h2>
        <div className="space-y-3">
          {yearData.map(round => (
            <Link
              key={round.round}
              href={`/lotto/${round.round}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:opacity-80 transition-opacity"
              style={{ backgroundColor: 'var(--bg)' }}
            >
              <span className="text-sm font-bold w-16">{round.round}회</span>
              <LottoNumbers numbers={round.numbers} bonusNumber={round.bonusNumber} size="xs" />
              <span className="text-xs ml-auto hidden md:block" style={{ color: 'var(--text-secondary)' }}>
                {round.drawDate}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* 다른 연도 */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold mb-4">📅 다른 연도 분석</h2>
        <div className="flex flex-wrap gap-2">
          {allYears.map(y => (
            <Link
              key={y}
              href={`/lotto/year/${y}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80 ${y === year ? 'font-bold' : ''}`}
              style={{
                backgroundColor: y === year ? '#D36135' : 'var(--border)',
                color: y === year ? '#fff' : 'var(--text)',
              }}
            >
              {y}
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold mb-4">❓ 자주 묻는 질문</h2>
        <div className="space-y-4">
          <FaqItem
            q={`${year}년 로또에서 가장 많이 나온 번호는?`}
            a={`${year}년에는 ${top10.slice(0, 3).map(t => `${t.number}번(${t.count}회)`).join(', ')}이 가장 많이 출현했습니다.`}
          />
          <FaqItem
            q={`${year}년 로또 1등 당첨금 평균은?`}
            a={`${year}년 1등 평균 당첨금은 ${formatMoney(avgFirstPrize)}이며, 최대 ${formatMoney(maxFirstPrize)}이 나왔습니다. 총 ${totalFirstWinners}명이 1등에 당첨되었습니다.`}
          />
          <FaqItem
            q={`${year}년 로또는 몇 회 추첨했나요?`}
            a={`${year}년에는 ${firstRound}회부터 ${lastRound}회까지 총 ${roundCount}회 추첨이 진행되었습니다.`}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl p-4 text-center" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{sub}</div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="border-b pb-3" style={{ borderColor: 'var(--border)' }}>
      <h3 className="font-semibold mb-1">{q}</h3>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{a}</p>
    </div>
  );
}
