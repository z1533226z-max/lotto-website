'use client';

import Link from 'next/link';
import LottoNumbers from '@/components/lotto/LottoNumbers';

interface Props {
  num: number;
  totalRounds: number;
  latestRound: number;
  frequency: number;
  mainFrequency: number;
  recentHits: number;
  avgGap: string;
  maxGap: number;
  currentGap: number;
  rank: number;
  topCompanionNumbers: { number: number; count: number }[];
  recentRounds: {
    round: number;
    date: string;
    numbers: number[];
    bonus: number;
  }[];
  allBonusFreq: { number: number; freq: number }[];
}

export default function BonusNumberContent({
  num, totalRounds, latestRound,
  frequency, mainFrequency, recentHits,
  avgGap, maxGap, currentGap, rank,
  topCompanionNumbers, recentRounds, allBonusFreq,
}: Props) {
  const pct = ((frequency / totalRounds) * 100).toFixed(1);
  const mainPct = ((mainFrequency / totalRounds) * 100).toFixed(1);
  const recent100Pct = ((recentHits / Math.min(100, totalRounds)) * 100).toFixed(1);
  const overallPct = parseFloat(pct);
  const recentPctNum = parseFloat(recent100Pct);
  const trend = recentPctNum > overallPct * 1.3 ? '상승' : recentPctNum < overallPct * 0.7 ? '하락' : '보통';
  const trendEmoji = trend === '상승' ? '📈' : trend === '하락' ? '📉' : '➡️';

  const gapStatus = currentGap > parseFloat(avgGap) * 1.5
    ? '평균 대비 오래 미출현'
    : currentGap < parseFloat(avgGap) * 0.5
      ? '최근 출현'
      : '평균 수준';

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center gap-2 mb-3">
          <LottoNumbers numbers={[num]} size="lg" />
          <span className="text-sm text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">보너스</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          로또 보너스번호 {num}번 완벽 분석
        </h1>
        <p className="text-gray-400">
          총 <span className="text-yellow-400 font-semibold">{frequency}회</span> 보너스 출현 · 전체 {totalRounds}회 중 {pct}%
        </p>
      </div>

      {/* 핵심 통계 4카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
          <div className="text-xs text-gray-400 mb-1">보너스 출현</div>
          <div className="text-2xl font-bold text-yellow-400">{frequency}회</div>
          <div className="text-xs text-gray-500">{pct}%</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
          <div className="text-xs text-gray-400 mb-1">보너스 순위</div>
          <div className="text-2xl font-bold text-white">{rank}위</div>
          <div className="text-xs text-gray-500">45개 번호 중</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
          <div className="text-xs text-gray-400 mb-1">최근 추세</div>
          <div className="text-2xl font-bold text-white">{trendEmoji} {trend}</div>
          <div className="text-xs text-gray-500">최근 100회 기준</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
          <div className="text-xs text-gray-400 mb-1">현재 미출현</div>
          <div className="text-2xl font-bold text-white">{currentGap}회</div>
          <div className="text-xs text-gray-500">{gapStatus}</div>
        </div>
      </div>

      {/* 보너스 vs 본번호 비교 */}
      <section className="bg-gray-800/30 rounded-xl p-5 border border-gray-700/30">
        <h2 className="text-lg font-bold text-white mb-4">🎯 보너스 vs 본번호 비교</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">보너스번호 출현</div>
            <div className="text-xl font-bold text-yellow-400">{frequency}회 ({pct}%)</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">본번호 출현</div>
            <div className="text-xl font-bold text-blue-400">{mainFrequency}회 ({mainPct}%)</div>
          </div>
        </div>
        <div className="mt-3 text-center">
          <div className="text-sm text-gray-400">본번호 + 보너스 합산</div>
          <div className="text-lg font-semibold text-white">
            {frequency + mainFrequency}회 ({((frequency + mainFrequency) / totalRounds * 100).toFixed(1)}%)
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {num}번은 본번호로 {mainFrequency}회, 보너스로 {frequency}회 나와 총 {frequency + mainFrequency}회 등장했습니다.
        </p>
      </section>

      {/* 출현 간격 분석 */}
      <section className="bg-gray-800/30 rounded-xl p-5 border border-gray-700/30">
        <h2 className="text-lg font-bold text-white mb-4">📊 보너스 출현 간격</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-xs text-gray-400 mb-1">평균 간격</div>
            <div className="text-xl font-bold text-white">{avgGap}회</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">최대 간격</div>
            <div className="text-xl font-bold text-red-400">{maxGap}회</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">현재 간격</div>
            <div className="text-xl font-bold text-white">{currentGap}회</div>
          </div>
        </div>
      </section>

      {/* 동반 본번호 TOP 5 */}
      <section className="bg-gray-800/30 rounded-xl p-5 border border-gray-700/30">
        <h2 className="text-lg font-bold text-white mb-4">🤝 함께 나온 본번호 TOP 5</h2>
        <p className="text-xs text-gray-400 mb-3">{num}번이 보너스번호일 때 가장 자주 같이 나온 본번호</p>
        <div className="space-y-2">
          {topCompanionNumbers.map((c, i) => {
            const barWidth = topCompanionNumbers[0]?.count
              ? (c.count / topCompanionNumbers[0].count * 100)
              : 0;
            return (
              <div key={c.number} className="flex items-center gap-3">
                <span className="text-sm text-gray-400 w-6">{i + 1}.</span>
                <Link href={`/lotto/number/${c.number}`} className="flex-shrink-0">
                  <LottoNumbers numbers={[c.number]} size="sm" />
                </Link>
                <div className="flex-1 bg-gray-700/30 rounded-full h-5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500/60 to-blue-400/40 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${Math.max(barWidth, 20)}%` }}
                  >
                    <span className="text-xs text-white font-medium">{c.count}회</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 보너스 번호 전체 순위 */}
      <section className="bg-gray-800/30 rounded-xl p-5 border border-gray-700/30">
        <h2 className="text-lg font-bold text-white mb-4">🏆 보너스번호 출현 순위</h2>
        <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
          {allBonusFreq.slice(0, 45).map(item => (
            <Link
              key={item.number}
              href={`/lotto/bonus/${item.number}`}
              className={`text-center p-2 rounded-lg border transition-colors ${
                item.number === num
                  ? 'bg-yellow-500/20 border-yellow-500/50'
                  : 'bg-gray-800/50 border-gray-700/30 hover:border-gray-600/50'
              }`}
            >
              <div className={`text-sm font-bold ${item.number === num ? 'text-yellow-400' : 'text-white'}`}>
                {item.number}
              </div>
              <div className="text-xs text-gray-400">{item.freq}회</div>
            </Link>
          ))}
        </div>
      </section>

      {/* 최근 출현 회차 */}
      <section className="bg-gray-800/30 rounded-xl p-5 border border-gray-700/30">
        <h2 className="text-lg font-bold text-white mb-4">🕐 최근 보너스 출현 회차</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700/50">
                <th className="py-2 px-3 text-left">회차</th>
                <th className="py-2 px-3 text-left">추첨일</th>
                <th className="py-2 px-3 text-left">당첨번호</th>
                <th className="py-2 px-3 text-center">보너스</th>
              </tr>
            </thead>
            <tbody>
              {recentRounds.map(r => (
                <tr key={r.round} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-2 px-3">
                    <Link href={`/lotto/${r.round}`} className="text-blue-400 hover:underline">
                      {r.round}회
                    </Link>
                  </td>
                  <td className="py-2 px-3 text-gray-400">{r.date}</td>
                  <td className="py-2 px-3">
                    <LottoNumbers numbers={r.numbers} size="xs" />
                  </td>
                  <td className="py-2 px-3 text-center">
                    <LottoNumbers numbers={[r.bonus]} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 관련 페이지 링크 */}
      <section className="bg-gray-800/30 rounded-xl p-5 border border-gray-700/30">
        <h2 className="text-lg font-bold text-white mb-3">🔗 관련 분석</h2>
        <div className="flex flex-wrap gap-2">
          <Link href={`/lotto/number/${num}`} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-sm hover:bg-blue-500/20 transition-colors">
            {num}번 본번호 분석
          </Link>
          <Link href={`/lotto/ending/${num % 10}`} className="px-3 py-1.5 bg-purple-500/10 text-purple-400 rounded-lg text-sm hover:bg-purple-500/20 transition-colors">
            끝수 {num % 10} 분석
          </Link>
          <Link href="/lotto/statistics" className="px-3 py-1.5 bg-gray-500/10 text-gray-400 rounded-lg text-sm hover:bg-gray-500/20 transition-colors">
            전체 통계
          </Link>
          {num > 1 && (
            <Link href={`/lotto/bonus/${num - 1}`} className="px-3 py-1.5 bg-gray-500/10 text-gray-400 rounded-lg text-sm hover:bg-gray-500/20 transition-colors">
              ← {num - 1}번 보너스
            </Link>
          )}
          {num < 45 && (
            <Link href={`/lotto/bonus/${num + 1}`} className="px-3 py-1.5 bg-gray-500/10 text-gray-400 rounded-lg text-sm hover:bg-gray-500/20 transition-colors">
              {num + 1}번 보너스 →
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
