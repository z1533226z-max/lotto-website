'use client';

import Link from 'next/link';
import LottoNumbers from '@/components/lotto/LottoNumbers';
import CrossSectionLinks from '@/components/lotto/CrossSectionLinks';

interface RoundInfo {
  round: number;
  date: string;
  numbers: number[];
  bonus: number;
  sum: number;
}

interface RangeDistribution {
  label: string;
  slug: string;
  count: number;
  pct: string;
  isCurrent: boolean;
}

interface OddEvenDist {
  label: string;
  count: number;
  pct: string;
}

interface Props {
  rangeLabel: string;
  min: number;
  max: number;
  totalRounds: number;
  latestRound: number;
  matchCount: number;
  matchPct: string;
  avgSum: string;
  medianSum: number;
  minSum: number;
  maxSum: number;
  topNumbers: { number: number; count: number; pct: string }[];
  oddEvenDist: OddEvenDist[];
  highLowDist: OddEvenDist[];
  recentRounds: RoundInfo[];
  allRanges: RangeDistribution[];
  recentMatchCount: number;
  recentMatchPct: string;
}

export default function SumRangeContent({
  rangeLabel, min, max, totalRounds, latestRound,
  matchCount, matchPct, avgSum, medianSum, minSum, maxSum,
  topNumbers, oddEvenDist, highLowDist,
  recentRounds, allRanges, recentMatchCount, recentMatchPct,
}: Props) {
  const overallPct = parseFloat(matchPct);
  const recentPctNum = parseFloat(recentMatchPct);
  const trend = recentPctNum > overallPct * 1.3 ? '상승' : recentPctNum < overallPct * 0.7 ? '하락' : '보통';
  const trendEmoji = trend === '상승' ? '📈' : trend === '하락' ? '📉' : '➡️';

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center gap-2 mb-3">
          <span className="text-3xl font-bold text-yellow-400">{min}~{max}</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          로또 합계 {rangeLabel} 완벽 분석
        </h1>
        <p className="text-gray-400">
          총 <span className="text-yellow-400 font-semibold">{matchCount}회</span> 출현 · 전체 {totalRounds}회 중 {matchPct}%
        </p>
      </div>

      {/* 핵심 통계 4카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
          <div className="text-xs text-gray-400 mb-1">출현 횟수</div>
          <div className="text-2xl font-bold text-yellow-400">{matchCount}회</div>
          <div className="text-xs text-gray-500">{matchPct}%</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
          <div className="text-xs text-gray-400 mb-1">평균 합계</div>
          <div className="text-2xl font-bold text-white">{avgSum}</div>
          <div className="text-xs text-gray-500">이 구간 평균</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
          <div className="text-xs text-gray-400 mb-1">최근 추세</div>
          <div className="text-2xl font-bold text-white">{trendEmoji} {trend}</div>
          <div className="text-xs text-gray-500">최근 100회 기준</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
          <div className="text-xs text-gray-400 mb-1">합계 범위</div>
          <div className="text-2xl font-bold text-white">{minSum}~{maxSum}</div>
          <div className="text-xs text-gray-500">실제 최소~최대</div>
        </div>
      </div>

      {/* 합계 구간 분포 */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
        <h2 className="text-lg font-bold text-white mb-4">전체 합계 구간 분포</h2>
        <div className="space-y-2">
          {allRanges.map(r => (
            <div key={r.slug} className="flex items-center gap-3">
              {r.isCurrent ? (
                <span className="w-24 text-sm font-bold text-yellow-400">{r.label}</span>
              ) : (
                <Link href={`/lotto/sum/${r.slug}`} className="w-24 text-sm text-blue-400 hover:underline">
                  {r.label}
                </Link>
              )}
              <div className="flex-1 bg-gray-700/50 rounded-full h-5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${r.isCurrent ? 'bg-yellow-400' : 'bg-blue-500/60'}`}
                  style={{ width: `${Math.min(parseFloat(r.pct) * 3, 100)}%` }}
                />
              </div>
              <span className="w-20 text-right text-sm text-gray-300">{r.count}회 ({r.pct}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* 자주 나오는 번호 TOP 10 */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
        <h2 className="text-lg font-bold text-white mb-4">이 구간에서 자주 나오는 번호 TOP 10</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {topNumbers.slice(0, 10).map((item, idx) => (
            <Link key={item.number} href={`/lotto/number/${item.number}`} className="bg-gray-700/30 rounded-lg p-3 text-center hover:bg-gray-700/50 transition-colors">
              <div className="flex justify-center mb-2">
                <LottoNumbers numbers={[item.number]} size="md" />
              </div>
              <div className="text-xs text-gray-400">{idx + 1}위</div>
              <div className="text-sm font-bold text-white">{item.count}회</div>
              <div className="text-xs text-gray-500">{item.pct}%</div>
            </Link>
          ))}
        </div>
      </div>

      {/* 홀짝/고저 분포 */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <h2 className="text-lg font-bold text-white mb-3">홀짝 비율</h2>
          <div className="space-y-2">
            {oddEvenDist.map(d => (
              <div key={d.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-300">{d.label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-700/50 rounded-full h-3 overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: `${Math.min(parseFloat(d.pct) * 2, 100)}%` }} />
                  </div>
                  <span className="text-sm text-gray-400 w-20 text-right">{d.count}회 ({d.pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <h2 className="text-lg font-bold text-white mb-3">고저 비율</h2>
          <div className="space-y-2">
            {highLowDist.map(d => (
              <div key={d.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-300">{d.label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-700/50 rounded-full h-3 overflow-hidden">
                    <div className="h-full bg-green-400 rounded-full" style={{ width: `${Math.min(parseFloat(d.pct) * 2, 100)}%` }} />
                  </div>
                  <span className="text-sm text-gray-400 w-20 text-right">{d.count}회 ({d.pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 최근 출현 회차 */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
        <h2 className="text-lg font-bold text-white mb-4">최근 출현 회차 (최대 20회)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-2 px-3 text-left text-gray-400">회차</th>
                <th className="py-2 px-3 text-left text-gray-400">추첨일</th>
                <th className="py-2 px-3 text-left text-gray-400">당첨번호</th>
                <th className="py-2 px-3 text-right text-gray-400">합계</th>
              </tr>
            </thead>
            <tbody>
              {recentRounds.map(r => (
                <tr key={r.round} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                  <td className="py-2 px-3">
                    <Link href={`/lotto/${r.round}`} className="text-blue-400 hover:underline">{r.round}회</Link>
                  </td>
                  <td className="py-2 px-3 text-gray-400">{r.date}</td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1">
                      <LottoNumbers numbers={r.numbers} size="sm" />
                      <span className="text-gray-500 mx-1">+</span>
                      <LottoNumbers numbers={[r.bonus]} size="sm" />
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-yellow-400">{r.sum}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 관련 분석 링크 */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
        <h2 className="text-lg font-bold text-white mb-3">관련 분석</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/lotto/pattern/sum-range" className="px-3 py-2 bg-gray-700/50 rounded-lg text-sm text-blue-400 hover:bg-gray-700 transition-colors">
            합계 패턴 분석
          </Link>
          <Link href="/lotto/pattern/odd-even" className="px-3 py-2 bg-gray-700/50 rounded-lg text-sm text-blue-400 hover:bg-gray-700 transition-colors">
            홀짝 패턴 분석
          </Link>
          <Link href="/lotto/pattern/high-low" className="px-3 py-2 bg-gray-700/50 rounded-lg text-sm text-blue-400 hover:bg-gray-700 transition-colors">
            고저 패턴 분석
          </Link>
          <Link href="/lotto/statistics" className="px-3 py-2 bg-gray-700/50 rounded-lg text-sm text-blue-400 hover:bg-gray-700 transition-colors">
            종합 통계
          </Link>
        </div>
      </div>

      <CrossSectionLinks current="sum" className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50" />
    </div>
  );
}
