'use client';

import Link from 'next/link';
import CrossSectionLinks from '@/components/lotto/CrossSectionLinks';

interface NumberFreq {
  number: number;
  count: number;
  percentage: string;
  lastRound: number;
  gap: number;
}

interface TrendItem {
  number: number;
  recentCount: number;
  recentRate: string;
  allRate: string;
  delta: number;
}

interface Props {
  period: string;
  periodLabel: string;
  totalRounds: number;
  rankedNumbers: NumberFreq[];
  colorGroupStats: { group: string; color: string; avg: string; numbers: string }[];
  allPeriods: { slug: string; label: string }[];
  risingNumbers: TrendItem[];
  fallingNumbers: TrendItem[];
  trendWindow: number;
}

const getBallStyle = (num: number): { bg: string; text: string } => {
  if (num <= 10) return { bg: '#FFC107', text: '#333' };
  if (num <= 20) return { bg: '#2196F3', text: '#fff' };
  if (num <= 30) return { bg: '#FF5722', text: '#fff' };
  if (num <= 40) return { bg: '#757575', text: '#fff' };
  return { bg: '#4CAF50', text: '#fff' };
};

function Ball({ num, size = 32 }: { num: number; size?: number }) {
  const s = getBallStyle(num);
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-bold shrink-0"
      style={{ width: size, height: size, backgroundColor: s.bg, color: s.text, fontSize: size * 0.4 }}
    >
      {num}
    </span>
  );
}

export default function FrequencyContent({
  period, periodLabel, totalRounds, rankedNumbers, colorGroupStats, allPeriods,
  risingNumbers, fallingNumbers, trendWindow,
}: Props) {
  const top5 = rankedNumbers.slice(0, 5);
  const bottom5 = [...rankedNumbers].slice(-5).reverse();
  const maxCount = rankedNumbers[0]?.count ?? 1;

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <div className="text-sm text-blue-400 mb-2">번호 출현 빈도 분석</div>
        <h1 className="text-2xl font-bold text-white mb-2">{periodLabel} 출현 빈도 랭킹</h1>
        <p className="text-gray-400">
          총 <span className="text-yellow-400 font-semibold">{totalRounds.toLocaleString()}회</span> 추첨 기준 &middot; 45개 번호 빈도 순위
        </p>
      </div>

      {/* Period tabs */}
      <div className="flex flex-wrap gap-2 justify-center">
        {allPeriods.map(p => (
          <Link
            key={p.slug}
            href={`/lotto/frequency/${p.slug}`}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              p.slug === period
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            {p.label}
          </Link>
        ))}
      </div>

      {/* Hot & Cold summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-red-900/30 to-red-800/10 rounded-xl p-4 border border-red-700/30">
          <h2 className="text-lg font-bold text-red-400 mb-3">🔥 핫넘버 TOP 5</h2>
          <div className="space-y-2">
            {top5.map((n, i) => (
              <Link key={n.number} href={`/lotto/number/${n.number}`} className="flex items-center gap-3 hover:bg-white/5 rounded-lg p-1.5 transition-colors">
                <span className="text-xs text-gray-500 w-5">{i + 1}위</span>
                <Ball num={n.number} />
                <div className="flex-1">
                  <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500/70 rounded-full" style={{ width: `${(n.count / maxCount) * 100}%` }} />
                  </div>
                </div>
                <span className="text-sm text-white font-semibold">{n.count}회</span>
                <span className="text-xs text-gray-500">{n.percentage}%</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 rounded-xl p-4 border border-blue-700/30">
          <h2 className="text-lg font-bold text-blue-400 mb-3">🧊 콜드넘버 TOP 5</h2>
          <div className="space-y-2">
            {bottom5.map((n, i) => (
              <Link key={n.number} href={`/lotto/number/${n.number}`} className="flex items-center gap-3 hover:bg-white/5 rounded-lg p-1.5 transition-colors">
                <span className="text-xs text-gray-500 w-5">{i + 1}위</span>
                <Ball num={n.number} />
                <div className="flex-1">
                  <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500/70 rounded-full" style={{ width: `${(n.count / maxCount) * 100}%` }} />
                  </div>
                </div>
                <span className="text-sm text-white font-semibold">{n.count}회</span>
                <span className="text-xs text-gray-500">{n.percentage}%</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Trend analysis: recent appearance rate vs all-time average */}
      <div className="bg-gradient-to-br from-orange-900/20 to-sky-900/10 rounded-xl p-4 border border-orange-700/30">
        <h2 className="text-lg font-bold text-white mb-1">📈 로또 당첨번호 트렌드 (최근 {trendWindow}회 추세)</h2>
        <p className="text-xs text-gray-400 mb-4">
          최근 {trendWindow}회 출현율을 역대 평균과 비교해 <span className="text-orange-400 font-semibold">상승세</span>·<span className="text-sky-400 font-semibold">하락세</span> 번호를 분석했습니다.
          핫넘버가 &ldquo;누적으로 많이 나온 번호&rdquo;라면, 트렌드는 &ldquo;요즘 더 자주 나오는 번호&rdquo;입니다.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-bold text-orange-400 mb-2">📈 상승세 (요즘 더 자주)</h3>
            <div className="space-y-1">
              {risingNumbers.map(n => (
                <Link key={n.number} href={`/lotto/number/${n.number}`} className="flex items-center gap-3 hover:bg-white/5 rounded-lg p-1.5 transition-colors">
                  <Ball num={n.number} size={28} />
                  <span className="text-sm text-gray-300 flex-1">최근 {n.recentCount}회 출현 · 역대 {n.allRate}%</span>
                  <span className="text-sm font-semibold text-orange-400">+{n.delta}%p</span>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-sky-400 mb-2">📉 하락세 (요즘 뜸함)</h3>
            <div className="space-y-1">
              {fallingNumbers.map(n => (
                <Link key={n.number} href={`/lotto/number/${n.number}`} className="flex items-center gap-3 hover:bg-white/5 rounded-lg p-1.5 transition-colors">
                  <Ball num={n.number} size={28} />
                  <span className="text-sm text-gray-300 flex-1">최근 {n.recentCount}회 출현 · 역대 {n.allRate}%</span>
                  <span className="text-sm font-semibold text-sky-400">{n.delta}%p</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          ※ %p는 최근 출현율에서 역대 평균 출현율을 뺀 값입니다. 로또는 매 회차 독립 추첨이므로 트렌드는 참고용 통계이며 당첨을 보장하지 않습니다.
        </p>
      </div>

      {/* Overdue numbers */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        <h2 className="text-lg font-bold text-yellow-400 mb-3">⏳ 이월번호 (오래 안 나온 순)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {[...rankedNumbers]
            .sort((a, b) => b.gap - a.gap)
            .slice(0, 10)
            .map(n => (
              <Link key={n.number} href={`/lotto/number/${n.number}`} className="flex items-center gap-2 bg-gray-900/50 rounded-lg p-2 hover:bg-gray-700/50 transition-colors">
                <Ball num={n.number} size={28} />
                <div className="text-xs">
                  <div className="text-white font-semibold">{n.gap}회차 째</div>
                  <div className="text-gray-500">미출현</div>
                </div>
              </Link>
            ))}
        </div>
      </div>

      {/* Color group stats */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        <h2 className="text-lg font-bold text-white mb-3">🎨 색상(구간)별 출현 통계</h2>
        <div className="space-y-3">
          {colorGroupStats.map(g => (
            <div key={g.group} className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
              <span className="text-sm text-gray-300 w-24">{g.group}</span>
              <span className="text-xs text-gray-500 w-28">{g.numbers}</span>
              <span className="text-sm text-white font-semibold">평균 {g.avg}회</span>
            </div>
          ))}
        </div>
      </div>

      {/* Full ranking table */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        <h2 className="text-lg font-bold text-white mb-3">📊 전체 번호 순위 (1~45위)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-2 text-gray-400">순위</th>
                <th className="text-left py-2 px-2 text-gray-400">번호</th>
                <th className="text-left py-2 px-2 text-gray-400">출현</th>
                <th className="text-left py-2 px-2 text-gray-400">비율</th>
                <th className="text-left py-2 px-2 text-gray-400">미출현</th>
                <th className="text-left py-2 px-2 text-gray-400 hidden sm:table-cell">빈도</th>
              </tr>
            </thead>
            <tbody>
              {rankedNumbers.map((n, i) => (
                <tr key={n.number} className="border-b border-gray-700/30 hover:bg-gray-700/20">
                  <td className="py-2 px-2 text-gray-500">{i + 1}</td>
                  <td className="py-2 px-2">
                    <Link href={`/lotto/number/${n.number}`}>
                      <Ball num={n.number} size={26} />
                    </Link>
                  </td>
                  <td className="py-2 px-2 text-white font-semibold">{n.count}회</td>
                  <td className="py-2 px-2 text-gray-300">{n.percentage}%</td>
                  <td className="py-2 px-2 text-gray-400">{n.gap}회</td>
                  <td className="py-2 px-2 hidden sm:table-cell">
                    <div className="h-2 w-24 bg-gray-700/50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(n.count / maxCount) * 100}%`,
                          backgroundColor: i < 10 ? '#ef4444' : i >= 35 ? '#3b82f6' : '#6b7280',
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CrossSectionLinks current="frequency" />
    </div>
  );
}
