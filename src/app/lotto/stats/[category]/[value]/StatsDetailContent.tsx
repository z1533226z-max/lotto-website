'use client';

import Link from 'next/link';
import LottoNumbers from '@/components/lotto/LottoNumbers';
import CrossSectionLinks from '@/components/lotto/CrossSectionLinks';

interface Props {
  category: string;
  value: string;
  categoryName: string;
  valueName: string;
  patternSlug: string;
  totalRounds: number;
  matchCount: number;
  percentage: string;
  avgGap: string;
  roundsSinceLast: number;
  recentMatches: {
    round: number;
    date: string;
    numbers: number[];
    bonus: number;
  }[];
  yearlyData: { year: number; count: number; total: number }[];
  otherValues: { value: string; name: string; count: number; percentage: string }[];
}

export default function StatsDetailContent({
  category, value, categoryName, valueName, patternSlug,
  totalRounds, matchCount, percentage, avgGap, roundsSinceLast,
  recentMatches, yearlyData, otherValues,
}: Props) {
  const maxYearlyCount = Math.max(...yearlyData.map(y => y.count), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="text-sm text-blue-400 mb-2">{categoryName} 상세 분석</div>
        <h1 className="text-2xl font-bold text-white mb-2">{valueName} 당첨번호 분석</h1>
        <p className="text-gray-400">
          총 <span className="text-yellow-400 font-semibold">{matchCount.toLocaleString()}회</span> 출현
          &middot; 전체 {totalRounds.toLocaleString()}회 중 {percentage}%
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
          <div className="text-xs text-gray-400 mb-1">출현 횟수</div>
          <div className="text-2xl font-bold text-yellow-400">{matchCount}</div>
          <div className="text-xs text-gray-500">{percentage}%</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
          <div className="text-xs text-gray-400 mb-1">평균 출현 간격</div>
          <div className="text-2xl font-bold text-white">{avgGap}회</div>
          <div className="text-xs text-gray-500">회차 기준</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
          <div className="text-xs text-gray-400 mb-1">마지막 출현 후</div>
          <div className="text-2xl font-bold text-white">{roundsSinceLast}회</div>
          <div className="text-xs text-gray-500">경과</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
          <div className="text-xs text-gray-400 mb-1">출현 상태</div>
          <div className="text-2xl font-bold">
            {roundsSinceLast <= parseFloat(avgGap || '999') * 0.5
              ? <span className="text-green-400">활발</span>
              : roundsSinceLast >= parseFloat(avgGap || '1') * 1.5
                ? <span className="text-red-400">침체</span>
                : <span className="text-blue-400">보통</span>
            }
          </div>
          <div className="text-xs text-gray-500">평균 간격 대비</div>
        </div>
      </div>

      {/* Yearly Trend */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        <h2 className="text-lg font-bold text-white mb-4">연도별 출현 추이</h2>
        <div className="space-y-2">
          {yearlyData.map(y => {
            const barWidth = (y.count / maxYearlyCount) * 100;
            const yearPct = y.total > 0 ? ((y.count / y.total) * 100).toFixed(1) : '0';
            return (
              <div key={y.year} className="flex items-center gap-2 text-sm">
                <span className="w-12 text-gray-400 text-right">{y.year}</span>
                <div className="flex-1 bg-gray-700/30 rounded-full h-5 relative overflow-hidden">
                  <div
                    className="bg-blue-500/70 h-full rounded-full transition-all"
                    style={{ width: `${barWidth}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs text-white/80">
                    {y.count}회 ({yearPct}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Other Values Comparison */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        <h2 className="text-lg font-bold text-white mb-4">{categoryName} 비율별 비교</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {otherValues.map(ov => {
            const isActive = ov.value === value;
            return (
              <Link
                key={ov.value}
                href={`/lotto/stats/${category}/${ov.value}`}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600/30 border border-blue-500/50'
                    : 'bg-gray-700/30 border border-gray-700/30 hover:bg-gray-700/50'
                }`}
              >
                <span className={`text-sm font-medium ${isActive ? 'text-blue-300' : 'text-gray-300'}`}>
                  {ov.name}
                </span>
                <span className="text-sm text-gray-400">
                  {ov.count}회 ({ov.percentage}%)
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Matches Table */}
      {recentMatches.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <h2 className="text-lg font-bold text-white mb-4">
            최근 출현 회차 <span className="text-sm text-gray-400 font-normal">(최대 30개)</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 px-2 text-gray-400">회차</th>
                  <th className="text-left py-2 px-2 text-gray-400">추첨일</th>
                  <th className="text-left py-2 px-2 text-gray-400">당첨번호</th>
                </tr>
              </thead>
              <tbody>
                {recentMatches.map(m => (
                  <tr key={m.round} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                    <td className="py-2 px-2">
                      <Link href={`/lotto/${m.round}`} className="text-blue-400 hover:text-blue-300">
                        {m.round}회
                      </Link>
                    </td>
                    <td className="py-2 px-2 text-gray-400">{m.date}</td>
                    <td className="py-2 px-2">
                      <LottoNumbers numbers={m.numbers} bonusNumber={m.bonus} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        <h2 className="text-lg font-bold text-white mb-4">자주 묻는 질문</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-blue-300 mb-1">
              Q. 로또에서 {valueName} 패턴은 얼마나 자주 나오나요?
            </h3>
            <p className="text-sm text-gray-400">
              전체 {totalRounds.toLocaleString()}회 추첨 중 {valueName} 패턴은 {matchCount.toLocaleString()}회 출현했습니다.
              출현 확률은 {percentage}%이며, 평균 {avgGap}회마다 한 번 출현합니다.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-blue-300 mb-1">
              Q. {categoryName} 분석으로 당첨 확률을 높일 수 있나요?
            </h3>
            <p className="text-sm text-gray-400">
              {categoryName} 분석은 과거 통계를 기반으로 합니다. 극단적으로 치우친 패턴(출현율 5% 미만)을 피하면
              통계적으로 더 유리한 번호 조합을 선택할 수 있습니다. 가장 많이 출현한 패턴을 참고하되,
              로또는 매 회차 독립적인 추첨이므로 과거 패턴이 미래를 보장하지 않습니다.
            </p>
          </div>
        </div>
      </div>

      {/* Related Links */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        <h2 className="text-lg font-bold text-white mb-3">관련 분석</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/lotto/pattern/${patternSlug}`}
            className="px-3 py-1.5 bg-gray-700/50 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            {categoryName} 전체 보기
          </Link>
          <Link
            href="/lotto/statistics"
            className="px-3 py-1.5 bg-gray-700/50 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            종합 통계
          </Link>
          <Link
            href="/lotto/pattern/odd-even"
            className="px-3 py-1.5 bg-gray-700/50 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            홀짝 분석
          </Link>
          <Link
            href="/lotto/pattern/high-low"
            className="px-3 py-1.5 bg-gray-700/50 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            고저 분석
          </Link>
          <Link
            href="/lotto/pattern/ac-value"
            className="px-3 py-1.5 bg-gray-700/50 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            AC값 분석
          </Link>
          <Link
            href="/lotto/pattern/consecutive"
            className="px-3 py-1.5 bg-gray-700/50 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            연번 분석
          </Link>
        </div>
      </div>

      <CrossSectionLinks current="pattern" />
    </div>
  );
}
