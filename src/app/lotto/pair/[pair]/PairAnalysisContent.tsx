'use client';

import Link from 'next/link';
import LottoNumbers from '@/components/lotto/LottoNumbers';

interface Props {
  num1: number;
  num2: number;
  totalRounds: number;
  latestRound: number;
  pairCount: number;
  pairRate: string;
  lastPairRound: number;
  pairGap: number;
  recentPairCount: number;
  recentRate: string;
  theoreticalRate: string;
  freq1: number;
  freq2: number;
  hot1: number;
  hot2: number;
  last1: number;
  last2: number;
  topCompanions: { number: number; count: number }[];
  pairRounds: { round: number; date: string; numbers: number[]; bonus: number }[];
  avgPairGap: string;
  maxPairGap: number;
  minPairGap: number;
}

function pairUrl(a: number, b: number): string {
  const [lo, hi] = a < b ? [a, b] : [b, a];
  return `/lotto/pair/${lo}-${hi}`;
}

export default function PairAnalysisContent({
  num1, num2, totalRounds, latestRound,
  pairCount, pairRate, lastPairRound, pairGap,
  recentPairCount, recentRate, theoreticalRate,
  freq1, freq2, hot1, hot2, last1, last2,
  topCompanions, pairRounds,
  avgPairGap, maxPairGap, minPairGap,
}: Props) {
  const overallRate = parseFloat(pairRate);
  const theoretical = parseFloat(theoreticalRate);
  const rateRatio = theoretical > 0 ? (overallRate / theoretical) : 0;
  const rateLabel = rateRatio >= 1.2 ? '높음' : rateRatio <= 0.8 ? '낮음' : '보통';

  const recentRateNum = parseFloat(recentRate);
  const trend = recentRateNum > overallRate * 1.3 ? '상승' : recentRateNum < overallRate * 0.7 ? '하락' : '보통';
  const trendEmoji = trend === '상승' ? '📈' : trend === '하락' ? '📉' : '➡️';

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center gap-3 mb-4">
          <LottoNumbers numbers={[num1]} size="lg" />
          <span className="text-2xl text-gray-400">&amp;</span>
          <LottoNumbers numbers={[num2]} size="lg" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          {num1}번 &amp; {num2}번 번호 궁합 분석
        </h1>
        <p className="text-gray-400">
          총 {totalRounds}회 추첨 중 <span className="text-yellow-400 font-semibold">{pairCount}회</span> 동시 출현 (출현율 {pairRate}%)
        </p>
      </div>

      {/* 핵심 통계 4카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
          <div className="text-xs text-gray-400 mb-1">동시 출현</div>
          <div className="text-2xl font-bold text-yellow-400">{pairCount}회</div>
          <div className="text-xs text-gray-500">전체 {totalRounds}회 중</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
          <div className="text-xs text-gray-400 mb-1">출현율 vs 이론값</div>
          <div className="text-2xl font-bold text-white">{pairRate}%</div>
          <div className={`text-xs ${rateLabel === '높음' ? 'text-green-400' : rateLabel === '낮음' ? 'text-red-400' : 'text-gray-400'}`}>
            이론 {theoreticalRate}% · {rateLabel}
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
          <div className="text-xs text-gray-400 mb-1">마지막 동시 출현</div>
          <div className="text-2xl font-bold text-white">
            {lastPairRound > 0 ? `${lastPairRound}회` : '-'}
          </div>
          <div className="text-xs text-gray-500">
            {pairGap > 0 ? `${pairGap}회차 전` : pairGap === 0 ? '이번 회차' : '기록 없음'}
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
          <div className="text-xs text-gray-400 mb-1">최근 100회 추세</div>
          <div className="text-2xl font-bold text-white">{trendEmoji} {recentRate}%</div>
          <div className={`text-xs ${trend === '상승' ? 'text-green-400' : trend === '하락' ? 'text-red-400' : 'text-gray-400'}`}>
            최근 {recentPairCount}회 출현 · {trend}
          </div>
        </div>
      </div>

      {/* 출현 간격 통계 */}
      {pairCount >= 2 && (
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <h2 className="text-lg font-semibold text-white mb-3">동시 출현 간격</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-gray-400">평균 간격</div>
              <div className="text-xl font-bold text-white">{avgPairGap}회</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">최소 간격</div>
              <div className="text-xl font-bold text-green-400">{minPairGap}회</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">최대 간격</div>
              <div className="text-xl font-bold text-red-400">{maxPairGap}회</div>
            </div>
          </div>
        </div>
      )}

      {/* 개별 번호 비교 */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-white mb-3">개별 번호 비교</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="py-2 text-left">항목</th>
                <th className="py-2 text-center">
                  <LottoNumbers numbers={[num1]} size="sm" />
                </th>
                <th className="py-2 text-center">
                  <LottoNumbers numbers={[num2]} size="sm" />
                </th>
              </tr>
            </thead>
            <tbody className="text-white">
              <tr className="border-b border-gray-700/50">
                <td className="py-2 text-gray-400">출현 횟수</td>
                <td className="py-2 text-center font-medium">{freq1}회</td>
                <td className="py-2 text-center font-medium">{freq2}회</td>
              </tr>
              <tr className="border-b border-gray-700/50">
                <td className="py-2 text-gray-400">출현율</td>
                <td className="py-2 text-center">{((freq1 / totalRounds) * 100).toFixed(1)}%</td>
                <td className="py-2 text-center">{((freq2 / totalRounds) * 100).toFixed(1)}%</td>
              </tr>
              <tr className="border-b border-gray-700/50">
                <td className="py-2 text-gray-400">핫/콜드 점수</td>
                <td className={`py-2 text-center ${hot1 >= 20 ? 'text-red-400' : hot1 <= -20 ? 'text-blue-400' : ''}`}>
                  {hot1}점
                </td>
                <td className={`py-2 text-center ${hot2 >= 20 ? 'text-red-400' : hot2 <= -20 ? 'text-blue-400' : ''}`}>
                  {hot2}점
                </td>
              </tr>
              <tr>
                <td className="py-2 text-gray-400">마지막 출현</td>
                <td className="py-2 text-center">{last1}회</td>
                <td className="py-2 text-center">{last2}회</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex gap-3 justify-center text-sm">
          <Link href={`/lotto/number/${num1}`} className="text-blue-400 hover:text-blue-300">
            {num1}번 상세 분석 →
          </Link>
          <Link href={`/lotto/number/${num2}`} className="text-blue-400 hover:text-blue-300">
            {num2}번 상세 분석 →
          </Link>
        </div>
      </div>

      {/* 동시 출현 회차 목록 */}
      {pairRounds.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <h2 className="text-lg font-semibold text-white mb-3">
            동시 출현 회차 {pairCount > 20 ? `(최근 20회)` : `(${pairCount}회)`}
          </h2>
          <div className="space-y-2">
            {pairRounds.map(r => (
              <Link
                key={r.round}
                href={`/lotto/${r.round}`}
                className="flex items-center justify-between bg-gray-900/50 rounded-lg px-3 py-2 hover:bg-gray-700/50 transition-colors"
              >
                <span className="text-sm">
                  <span className="text-yellow-400 font-medium">{r.round}회</span>
                  <span className="text-gray-500 ml-2">{r.date}</span>
                </span>
                <LottoNumbers numbers={r.numbers} bonusNumber={r.bonus} size="xs" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 함께 자주 출현하는 번호 */}
      {topCompanions.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <h2 className="text-lg font-semibold text-white mb-3">
            {num1}번 &amp; {num2}번과 자주 함께 출현하는 번호
          </h2>
          <div className="space-y-2">
            {topCompanions.map((c, idx) => (
              <div key={c.number} className="flex items-center gap-3">
                <span className="text-gray-500 text-sm w-6">{idx + 1}.</span>
                <LottoNumbers numbers={[c.number]} size="sm" />
                <span className="text-white text-sm flex-1">{c.count}회 동시 출현</span>
                <Link
                  href={pairUrl(num1, c.number)}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  {num1}-{c.number}
                </Link>
                <Link
                  href={pairUrl(num2, c.number)}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  {num2}-{c.number}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 관련 조합 탐색 */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-white mb-3">다른 번호 조합 보기</h2>
        <div className="space-y-3">
          <div>
            <div className="text-sm text-gray-400 mb-2">{num1}번의 다른 조합</div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 45 }, (_, i) => i + 1)
                .filter(n => n !== num1 && n !== num2)
                .slice(0, 12)
                .map(n => (
                  <Link
                    key={n}
                    href={pairUrl(num1, n)}
                    className="px-2 py-1 text-xs bg-gray-700/50 rounded hover:bg-gray-600/50 text-gray-300 hover:text-white transition-colors"
                  >
                    {num1}-{n}
                  </Link>
                ))}
              <span className="text-xs text-gray-500 self-center">외 {45 - 2 - 12}개</span>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-2">{num2}번의 다른 조합</div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 45 }, (_, i) => i + 1)
                .filter(n => n !== num1 && n !== num2)
                .slice(0, 12)
                .map(n => (
                  <Link
                    key={n}
                    href={pairUrl(num2, n)}
                    className="px-2 py-1 text-xs bg-gray-700/50 rounded hover:bg-gray-600/50 text-gray-300 hover:text-white transition-colors"
                  >
                    {num2}-{n}
                  </Link>
                ))}
              <span className="text-xs text-gray-500 self-center">외 {45 - 2 - 12}개</span>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <div className="text-center text-sm text-gray-400 space-x-4">
        <Link href="/lotto/statistics" className="hover:text-white transition-colors">
          전체 통계 →
        </Link>
        <Link href="/lotto/list" className="hover:text-white transition-colors">
          전체 당첨번호 →
        </Link>
        <Link href={`/lotto/number/${num1}`} className="hover:text-white transition-colors">
          {num1}번 분석 →
        </Link>
        <Link href={`/lotto/number/${num2}`} className="hover:text-white transition-colors">
          {num2}번 분석 →
        </Link>
      </div>
    </div>
  );
}
