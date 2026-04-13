'use client';

import Link from 'next/link';
import LottoNumbers from '@/components/lotto/LottoNumbers';

interface MonthRound {
  round: number;
  drawDate: string;
  numbers: number[];
  bonusNumber: number;
  firstPrize: number;
  firstWinners: number;
}

interface Props {
  year: number;
  month: number;
  roundCount: number;
  rounds: MonthRound[];
  numberFrequency: { number: number; count: number }[];
  avgFirstPrize: number;
  maxFirstPrize: number;
  totalFirstWinners: number;
  oddCount: number;
  evenCount: number;
  prevMonth: string | null;
  nextMonth: string | null;
}

const MONTH_NAMES = ['', '1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

const formatMoney = (amount: number): string => {
  if (amount >= 100000000) return `${(amount / 100000000).toFixed(1)}억원`;
  if (amount >= 10000) return `${(amount / 10000).toFixed(0)}만원`;
  return `${amount}원`;
};

function parseYM(ym: string): { year: number; month: number } {
  const [y, m] = ym.split('-').map(Number);
  return { year: y, month: m };
}

export default function MonthlyArchiveContent({
  year, month, roundCount, rounds, numberFrequency,
  avgFirstPrize, maxFirstPrize, totalFirstWinners,
  oddCount, evenCount, prevMonth, nextMonth,
}: Props) {
  const totalNumbers = oddCount + evenCount;
  const firstRound = rounds[0]?.round ?? 0;
  const lastRound = rounds[rounds.length - 1]?.round ?? 0;

  const sorted = [...numberFrequency].sort((a, b) => b.count - a.count);
  const top5 = sorted.filter(x => x.count > 0).slice(0, 5);
  const notAppeared = numberFrequency.filter(x => x.count === 0).map(x => x.number);
  const maxCount = top5[0]?.count || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="text-sm text-gray-400 mb-1">월별 당첨번호</div>
        <h1 className="text-2xl font-bold text-white mb-2">
          {year}년 {MONTH_NAMES[month]} 로또 당첨번호
        </h1>
        <p className="text-gray-400">
          {firstRound}회 ~ {lastRound}회 | 총 <span className="text-yellow-400 font-semibold">{roundCount}회</span> 추첨
        </p>
      </div>

      {/* Month navigation */}
      <div className="flex justify-between items-center">
        {prevMonth ? (
          <Link href={`/lotto/monthly/${prevMonth}`} className="text-blue-400 hover:text-blue-300 text-sm">
            ← {parseYM(prevMonth).year}년 {MONTH_NAMES[parseYM(prevMonth).month]}
          </Link>
        ) : <div />}
        <Link href={`/lotto/year/${year}`} className="text-gray-400 hover:text-white text-sm">
          {year}년 전체 보기
        </Link>
        {nextMonth ? (
          <Link href={`/lotto/monthly/${nextMonth}`} className="text-blue-400 hover:text-blue-300 text-sm">
            {parseYM(nextMonth).year}년 {MONTH_NAMES[parseYM(nextMonth).month]} →
          </Link>
        ) : <div />}
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
          <div className="text-xs text-gray-400 mb-1">추첨 횟수</div>
          <div className="text-2xl font-bold text-yellow-400">{roundCount}회</div>
          <div className="text-xs text-gray-500">{firstRound}~{lastRound}회</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
          <div className="text-xs text-gray-400 mb-1">평균 1등 당첨금</div>
          <div className="text-2xl font-bold text-green-400">
            {avgFirstPrize > 0 ? formatMoney(avgFirstPrize) : '-'}
          </div>
          {maxFirstPrize > 0 && <div className="text-xs text-gray-500">최대 {formatMoney(maxFirstPrize)}</div>}
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
          <div className="text-xs text-gray-400 mb-1">1등 당첨자</div>
          <div className="text-2xl font-bold text-white">{totalFirstWinners}명</div>
          <div className="text-xs text-gray-500">회당 {(totalFirstWinners / roundCount).toFixed(1)}명</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
          <div className="text-xs text-gray-400 mb-1">홀짝 비율</div>
          <div className="text-2xl font-bold text-white">
            {totalNumbers > 0 ? `${((oddCount / totalNumbers) * 100).toFixed(0)}:${((evenCount / totalNumbers) * 100).toFixed(0)}` : '-'}
          </div>
          <div className="text-xs text-gray-500">홀 {oddCount} / 짝 {evenCount}</div>
        </div>
      </div>

      {/* Hot / Cold numbers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <h2 className="text-lg font-semibold text-white mb-3">🔥 이달의 핫넘버</h2>
          <div className="space-y-2">
            {top5.map(({ number, count }) => (
              <Link key={number} href={`/lotto/number/${number}`} className="flex items-center justify-between hover:bg-gray-700/30 rounded-lg p-2 transition-colors">
                <div className="flex items-center gap-3">
                  <LottoNumbers numbers={[number]} size="sm" />
                  <span className="text-gray-300">{number}번</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-sm font-medium">
                    {count}회
                  </span>
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(count / maxCount) * 100}%` }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <h2 className="text-lg font-semibold text-white mb-3">❄️ 이달의 콜드넘버</h2>
          {notAppeared.length > 0 ? (
            <>
              <p className="text-sm text-gray-400 mb-3">이달 미출현 번호 ({notAppeared.length}개)</p>
              <div className="flex flex-wrap gap-2">
                {notAppeared.map(n => (
                  <Link key={n} href={`/lotto/number/${n}`} className="hover:scale-110 transition-transform">
                    <LottoNumbers numbers={[n]} size="sm" />
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400">이달에는 모든 번호가 최소 1회 출현했습니다.</p>
          )}
        </div>
      </div>

      {/* All draws this month */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-white mb-4">
          📋 {year}년 {MONTH_NAMES[month]} 전체 추첨 결과
        </h2>
        <div className="space-y-3">
          {rounds.map(r => (
            <Link
              key={r.round}
              href={`/lotto/${r.round}`}
              className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-900/50 rounded-lg p-3 hover:bg-gray-700/30 transition-colors gap-2"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-400 w-16 shrink-0">{r.round}회</span>
                <LottoNumbers numbers={r.numbers} size="sm" />
                <span className="text-gray-500 text-xs">+</span>
                <LottoNumbers numbers={[r.bonusNumber]} size="sm" />
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 sm:shrink-0">
                <span>{r.drawDate}</span>
                {r.firstPrize > 0 && <span className="text-green-400">{formatMoney(r.firstPrize)}</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Number frequency heatmap */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-white mb-4">📊 번호별 출현 빈도</h2>
        <div className="grid grid-cols-9 gap-1.5">
          {numberFrequency.map(({ number, count }) => {
            const intensity = count > 0 ? Math.max(0.2, count / maxCount) : 0;
            return (
              <Link
                key={number}
                href={`/lotto/number/${number}`}
                className="relative aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-transform hover:scale-110"
                style={{
                  backgroundColor: count > 0
                    ? `rgba(234, 179, 8, ${intensity})`
                    : 'rgba(55, 65, 81, 0.5)',
                }}
              >
                <span className={count > 0 ? 'font-bold text-white' : 'text-gray-500'}>{number}</span>
                <span className={`text-[10px] ${count > 0 ? 'text-yellow-200' : 'text-gray-600'}`}>{count}</span>
              </Link>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">색이 진할수록 많이 출현한 번호</p>
      </div>

      {/* Related links */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-white mb-3">🔗 관련 분석</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Link href={`/lotto/year/${year}`} className="bg-gray-900/50 rounded-lg p-3 text-center hover:bg-gray-700/30 transition-colors">
            <div className="text-sm text-gray-300">{year}년 전체</div>
            <div className="text-xs text-gray-500">연도별 분석</div>
          </Link>
          <Link href="/lotto/statistics" className="bg-gray-900/50 rounded-lg p-3 text-center hover:bg-gray-700/30 transition-colors">
            <div className="text-sm text-gray-300">전체 통계</div>
            <div className="text-xs text-gray-500">번호 분석</div>
          </Link>
          {top5[0] && (
            <Link href={`/lotto/number/${top5[0].number}`} className="bg-gray-900/50 rounded-lg p-3 text-center hover:bg-gray-700/30 transition-colors">
              <div className="text-sm text-yellow-400">{top5[0].number}번 분석</div>
              <div className="text-xs text-gray-500">이달의 핫넘버</div>
            </Link>
          )}
          {top5.length >= 2 && (
            <Link
              href={`/lotto/pair/${Math.min(top5[0].number, top5[1].number)}-${Math.max(top5[0].number, top5[1].number)}`}
              className="bg-gray-900/50 rounded-lg p-3 text-center hover:bg-gray-700/30 transition-colors"
            >
              <div className="text-sm text-blue-400">{top5[0].number}+{top5[1].number} 조합</div>
              <div className="text-xs text-gray-500">번호 궁합</div>
            </Link>
          )}
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-700/50">
        {prevMonth ? (
          <Link href={`/lotto/monthly/${prevMonth}`} className="text-blue-400 hover:text-blue-300">
            ← {parseYM(prevMonth).year}년 {MONTH_NAMES[parseYM(prevMonth).month]}
          </Link>
        ) : <div />}
        <Link href="/lotto/list" className="text-gray-400 hover:text-white text-sm">
          전체 목록 →
        </Link>
        {nextMonth ? (
          <Link href={`/lotto/monthly/${nextMonth}`} className="text-blue-400 hover:text-blue-300">
            {parseYM(nextMonth).year}년 {MONTH_NAMES[parseYM(nextMonth).month]} →
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}
