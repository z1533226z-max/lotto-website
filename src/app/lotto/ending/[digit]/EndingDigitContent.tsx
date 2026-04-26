'use client';

import Link from 'next/link';
import LottoNumbers from '@/components/lotto/LottoNumbers';
import CrossSectionLinks from '@/components/lotto/CrossSectionLinks';

interface Props {
  digit: number;
  numbers: number[];
  totalRounds: number;
  latestRound: number;
  numberFreq: Record<number, number>;
  totalHits: number;
  avgPerRound: string;
  recentHits: number;
  recentAvg: string;
  rank: number;
  allDigitHits: number[];
  topCompanionDigits: { digit: number; count: number }[];
  recentRounds: {
    round: number;
    date: string;
    numbers: number[];
    bonus: number;
    digitNumbers: number[];
  }[];
  multiHitRounds: number;
  avgGap: string;
  maxGap: number;
}

export default function EndingDigitContent({
  digit, numbers, totalRounds, latestRound,
  numberFreq, totalHits, avgPerRound,
  recentHits, recentAvg, rank,
  allDigitHits, topCompanionDigits, recentRounds,
  multiHitRounds, avgGap, maxGap,
}: Props) {
  const overallAvg = parseFloat(avgPerRound);
  const recentAvgNum = parseFloat(recentAvg);
  const trend = recentAvgNum > overallAvg * 1.15 ? '상승' : recentAvgNum < overallAvg * 0.85 ? '하락' : '보통';
  const trendEmoji = trend === '상승' ? '📈' : trend === '하락' ? '📉' : '➡️';
  const multiRate = ((multiHitRounds / totalRounds) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center gap-2 mb-3">
          <LottoNumbers numbers={numbers} size="lg" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          끝수 {digit} 완벽 분석
        </h1>
        <p className="text-gray-400">
          {numbers.join(', ')}번 — 총 <span className="text-yellow-400 font-semibold">{totalHits}회</span> 출현 · 회당 평균 {avgPerRound}개
        </p>
      </div>

      {/* 핵심 통계 4카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
          <div className="text-xs text-gray-400 mb-1">총 출현</div>
          <div className="text-2xl font-bold text-yellow-400">{totalHits}회</div>
          <div className="text-xs text-gray-500">전체 {totalRounds}회 중</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
          <div className="text-xs text-gray-400 mb-1">끝수 순위</div>
          <div className="text-2xl font-bold text-white">{rank}위</div>
          <div className="text-xs text-gray-500">10개 끝수 중</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
          <div className="text-xs text-gray-400 mb-1">최근 추세</div>
          <div className="text-2xl font-bold text-white">{trendEmoji} {trend}</div>
          <div className="text-xs text-gray-500">최근 100회 기준</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
          <div className="text-xs text-gray-400 mb-1">2개+ 동시 출현</div>
          <div className="text-2xl font-bold text-white">{multiRate}%</div>
          <div className="text-xs text-gray-500">{multiHitRounds}회</div>
        </div>
      </div>

      {/* 개별 번호 출현 빈도 */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-white mb-4">번호별 출현 횟수</h2>
        <div className="space-y-3">
          {numbers.map(n => {
            const freq = numberFreq[n] || 0;
            const maxFreq = Math.max(...Object.values(numberFreq));
            const pct = maxFreq > 0 ? (freq / maxFreq) * 100 : 0;
            return (
              <div key={n} className="flex items-center gap-3">
                <Link href={`/lotto/number/${n}`} className="flex-shrink-0">
                  <LottoNumbers numbers={[n]} size="sm" />
                </Link>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{n}번</span>
                    <span className="text-yellow-400 font-medium">{freq}회</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-yellow-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 끝수별 비교 차트 */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-white mb-4">전체 끝수 비교</h2>
        <div className="space-y-2">
          {allDigitHits
            .map((hits, d) => ({ digit: d, hits }))
            .sort((a, b) => b.hits - a.hits)
            .map(item => {
              const maxHits = Math.max(...allDigitHits);
              const pct = maxHits > 0 ? (item.hits / maxHits) * 100 : 0;
              const isMe = item.digit === digit;
              return (
                <div key={item.digit} className="flex items-center gap-3">
                  {isMe ? (
                    <span className="w-16 text-sm font-bold text-yellow-400">끝수 {item.digit}</span>
                  ) : (
                    <Link href={`/lotto/ending/${item.digit}`} className="w-16 text-sm text-gray-400 hover:text-white transition-colors">
                      끝수 {item.digit}
                    </Link>
                  )}
                  <div className="flex-1 h-5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isMe ? 'bg-gradient-to-r from-yellow-500 to-orange-400' : 'bg-gray-600'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className={`w-16 text-right text-sm ${isMe ? 'text-yellow-400 font-bold' : 'text-gray-500'}`}>
                    {item.hits}회
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* 동반 끝수 TOP5 */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-white mb-4">끝수 {digit}과 자주 함께 나오는 끝수 TOP5</h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {topCompanionDigits.map((cd, idx) => (
            <Link key={cd.digit} href={`/lotto/ending/${cd.digit}`}
              className="bg-gray-700/50 rounded-lg p-3 text-center hover:bg-gray-700 transition-colors">
              <div className="text-xs text-gray-400 mb-1">{idx + 1}위</div>
              <div className="text-xl font-bold text-white">끝수 {cd.digit}</div>
              <div className="text-sm text-yellow-400">{cd.count}회 동반</div>
            </Link>
          ))}
        </div>
      </div>

      {/* 출현 간격 통계 */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-white mb-4">출현 간격 분석</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">평균 출현 간격</div>
            <div className="text-xl font-bold text-white">{avgGap}회</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">최대 미출현 기간</div>
            <div className="text-xl font-bold text-white">{maxGap}회</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">전체 평균</div>
            <div className="text-xl font-bold text-white">{avgPerRound}개/회</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">최근 100회 평균</div>
            <div className={`text-xl font-bold ${trend === '상승' ? 'text-green-400' : trend === '하락' ? 'text-red-400' : 'text-white'}`}>
              {recentAvg}개/회
            </div>
          </div>
        </div>
      </div>

      {/* 최근 출현 회차 */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-white mb-4">최근 출현 회차 (최근 20회)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-2 text-gray-400 font-medium">회차</th>
                <th className="text-left py-2 px-2 text-gray-400 font-medium">추첨일</th>
                <th className="text-left py-2 px-2 text-gray-400 font-medium">당첨번호</th>
                <th className="text-center py-2 px-2 text-gray-400 font-medium">끝수 {digit}</th>
              </tr>
            </thead>
            <tbody>
              {recentRounds.map(r => (
                <tr key={r.round} className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-2 px-2">
                    <Link href={`/lotto/${r.round}`} className="text-blue-400 hover:underline">{r.round}회</Link>
                  </td>
                  <td className="py-2 px-2 text-gray-400">{r.date}</td>
                  <td className="py-2 px-2">
                    <LottoNumbers numbers={r.numbers} size="xs" />
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span className="text-yellow-400 font-medium">
                      {r.digitNumbers.join(', ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 다른 끝수 바로가기 */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-white mb-4">다른 끝수 분석</h2>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {Array.from({ length: 10 }, (_, i) => (
            <Link key={i} href={`/lotto/ending/${i}`}
              className={`rounded-lg p-3 text-center transition-colors ${
                i === digit
                  ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 font-bold'
                  : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'
              }`}>
              {i}
            </Link>
          ))}
        </div>
      </div>

      {/* 관련 페이지 링크 */}
      <div className="flex flex-wrap gap-2 text-sm">
        <Link href="/lotto/pattern/ending-number" className="text-blue-400 hover:underline">끝수 패턴 분석 →</Link>
        <Link href="/lotto/statistics" className="text-blue-400 hover:underline">전체 통계 →</Link>
        <Link href="/lotto/pattern/section" className="text-blue-400 hover:underline">구간 분석 →</Link>
      </div>

      <CrossSectionLinks current="ending" className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50" />
    </div>
  );
}
