'use client';

import Link from 'next/link';
import LottoNumbers from '@/components/lotto/LottoNumbers';

interface Props {
  num: number;
  totalRounds: number;
  frequency: number;
  percentage: string;
  lastAppeared: number;
  hotColdScore: number;
  consecutiveCount: number;
  recentFrequency: number;
  latestRound: number;
  status: string;
  section: string;
  avgGap: string;
  maxGap: number;
  minGap: number;
  currentGap: number;
  topCompanions: { number: number; count: number }[];
  yearlyFrequency: { year: string; count: number }[];
}

const getBallColor = (num: number): string => {
  if (num <= 10) return '#FFC107';
  if (num <= 20) return '#2196F3';
  if (num <= 30) return '#FF5722';
  if (num <= 40) return '#757575';
  return '#4CAF50';
};

export default function NumberAnalysisContent({
  num, totalRounds, frequency, percentage, lastAppeared,
  hotColdScore, consecutiveCount, recentFrequency, latestRound,
  status, section, avgGap, maxGap, minGap, currentGap,
  topCompanions, yearlyFrequency,
}: Props) {
  const ballColor = getBallColor(num);
  const maxYearCount = Math.max(...yearlyFrequency.map(y => y.count), 1);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center mb-4">
          <LottoNumbers numbers={[num]} size="lg" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">
          로또 {num}번 완전 분석
        </h1>
        <p style={{ color: 'var(--text-secondary)' }} className="mt-2">
          총 {totalRounds}회 추첨 기준 | {section} 구간 | {status}
        </p>
      </div>

      {/* 핵심 지표 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="출현 횟수" value={`${frequency}회`} sub={`${percentage}%`} />
        <StatCard
          label="핫/콜드 점수"
          value={`${hotColdScore > 0 ? '+' : ''}${hotColdScore}`}
          sub={status}
          valueColor={hotColdScore >= 20 ? '#EF4444' : hotColdScore <= -20 ? '#3B82F6' : undefined}
        />
        <StatCard label="마지막 출현" value={`${lastAppeared}회`} sub={`${currentGap}회 전`} />
        <StatCard label="최근 20회 출현" value={`${recentFrequency}회`} sub={consecutiveCount > 0 ? `${consecutiveCount}회 연속 중` : '연속 없음'} />
      </div>

      {/* 출현 간격 분석 */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold mb-4">📊 출현 간격 분석</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: ballColor }}>{avgGap}</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>평균 간격</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{maxGap}</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>최대 간격</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{minGap}</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>최소 간격</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: currentGap > Number(avgGap) * 1.5 ? '#EF4444' : '#22C55E' }}>{currentGap}</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>현재 간격</div>
          </div>
        </div>
        {currentGap > Number(avgGap) * 1.5 && (
          <p className="mt-4 text-sm p-3 rounded-lg" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
            ⚠️ 현재 간격({currentGap}회)이 평균({avgGap}회)보다 크게 벌어져 있습니다. 출현 가능성이 높아지는 구간입니다.
          </p>
        )}
      </div>

      {/* 동반 출현 번호 */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold mb-4">🤝 함께 자주 나오는 번호 TOP 5</h2>
        <div className="space-y-3">
          {topCompanions.map((comp, i) => (
            <div key={comp.number} className="flex items-center gap-3">
              <span className="text-sm font-medium w-6">{i + 1}위</span>
              <LottoNumbers numbers={[comp.number]} size="sm" />
              <div className="flex-1">
                <div className="h-6 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                  <div
                    className="h-full rounded-full flex items-center px-2"
                    style={{
                      width: `${Math.max((comp.count / topCompanions[0].count) * 100, 20)}%`,
                      backgroundColor: getBallColor(comp.number),
                    }}
                  >
                    <span className="text-xs font-bold text-white">{comp.count}회</span>
                  </div>
                </div>
              </div>
              <Link
                href={`/lotto/number/${comp.number}`}
                className="text-xs px-2 py-1 rounded"
                style={{ backgroundColor: 'var(--border)', color: 'var(--text-secondary)' }}
              >
                분석 보기
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* 연도별 출현 추이 */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold mb-4">📈 연도별 출현 추이</h2>
        <div className="space-y-2">
          {yearlyFrequency.map(({ year, count }) => (
            <div key={year} className="flex items-center gap-3">
              <span className="text-sm w-12 font-medium">{year}</span>
              <div className="flex-1">
                <div className="h-5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(count / maxYearCount) * 100}%`,
                      backgroundColor: ballColor,
                      minWidth: count > 0 ? '8%' : '0%',
                    }}
                  />
                </div>
              </div>
              <span className="text-sm w-8 text-right font-medium">{count}회</span>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ 섹션 */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold mb-4">❓ 자주 묻는 질문</h2>
        <div className="space-y-4">
          <FaqItem
            q={`로또 ${num}번은 몇 번 나왔나요?`}
            a={`로또 ${num}번은 총 ${totalRounds}회 추첨 중 ${frequency}회 출현했습니다. 출현율은 ${percentage}%입니다.`}
          />
          <FaqItem
            q={`로또 ${num}번은 핫 번호인가요?`}
            a={`로또 ${num}번의 핫/콜드 점수는 ${hotColdScore}점으로, 현재 "${status}"로 분류됩니다. 점수가 양수이면 최근 자주 출현하는 핫 번호, 음수이면 출현이 뜸한 콜드 번호입니다.`}
          />
          <FaqItem
            q={`로또 ${num}번과 같이 나오는 번호는?`}
            a={`로또 ${num}번과 가장 자주 함께 출현한 번호는 ${topCompanions.map(c => `${c.number}번(${c.count}회)`).join(', ')}입니다.`}
          />
          <FaqItem
            q={`로또 ${num}번은 평균 몇 회 간격으로 나오나요?`}
            a={`로또 ${num}번의 평균 출현 간격은 ${avgGap}회입니다. 최소 ${minGap}회에서 최대 ${maxGap}회 간격으로 출현했으며, 현재 ${currentGap}회째 미출현 중입니다.`}
          />
        </div>
      </div>

      {/* 다른 번호 탐색 */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold mb-4">🔢 다른 번호 분석</h2>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 45 }, (_, i) => i + 1).map(n => (
            <Link
              key={n}
              href={`/lotto/number/${n}`}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all hover:scale-110 ${n === num ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
              style={{
                backgroundColor: n === num ? getBallColor(n) : 'var(--border)',
                color: n === num ? '#fff' : 'var(--text)',
              }}
            >
              {n}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, valueColor }: { label: string; value: string; sub: string; valueColor?: string }) {
  return (
    <div className="rounded-xl p-4 text-center" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</div>
      <div className="text-2xl font-bold" style={valueColor ? { color: valueColor } : undefined}>{value}</div>
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
