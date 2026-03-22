'use client';

import Link from 'next/link';
import SectionFrame from '@/components/ui/SectionFrame';

interface Props {
  type: string;
  name: string;
  desc: string;
  totalRounds: number;
  data: unknown;
  allPatterns: { type: string; name: string }[];
}

const patternEmoji: Record<string, string> = {
  'odd-even': '🔢',
  'high-low': '⬆️⬇️',
  'sum-range': '➕',
  'consecutive': '🔗',
  'section': '📊',
  'ending-number': '🔚',
  'gap': '↔️',
  'ac-value': '🧮',
};

export default function PatternAnalysisContent({ type, name, desc, totalRounds, data, allPatterns }: Props) {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-4xl mb-3">{patternEmoji[type] || '📈'}</div>
      <SectionFrame
        eyebrow="패턴 분석"
        title={`로또 ${name}`}
        subtitle={`총 ${totalRounds}회 데이터 기반 | ${desc}`}
        size="sm"
        animate={false}
        maxWidth="full"
        headingLevel={1}
        className="px-0"
      >
        <div />
      </SectionFrame>

      {/* 분석 결과 */}
      {type === 'odd-even' && <OddEvenResult data={data as { ratio: string; count: number; percentage: string }[]} />}
      {type === 'high-low' && <HighLowResult data={data as { ratio: string; count: number; percentage: string }[]} />}
      {type === 'sum-range' && <SumRangeResult data={data as { ranges: { label: string; count: number; percentage: string }[]; avgSum: number; minSum: number; maxSum: number }} />}
      {type === 'consecutive' && <ConsecutiveResult data={data as { withConsecutive: number; withoutConsecutive: number; percentage: string; counts: Record<number, number> }} />}
      {type === 'section' && <SectionResult data={data as { label: string; count: number; percentage: string; expected: string }[]} />}
      {type === 'ending-number' && <EndingNumberResult data={data as { digit: number; count: number; percentage: string }[]} />}
      {type === 'gap' && <GapResult data={data as { gap: number; count: number }[]} />}
      {type === 'ac-value' && <ACValueResult data={data as { ac: number; count: number; percentage: string }[]} />}

      {/* FAQ */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold mb-4">❓ 자주 묻는 질문</h2>
        <div className="space-y-4">
          {getFaqItems(type, name, totalRounds).map((faq, i) => (
            <div key={i} className="border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              <h3 className="font-semibold mb-1">{faq.q}</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 관련 분석 페이지 */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold mb-4">📊 관련 분석</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <LinkCard href="/lotto/statistics" icon="📈" title="번호 통계" />
          <LinkCard href="/lotto/number/1" icon="🔢" title="번호별 분석" />
          <LinkCard href="/lotto/dream" icon="🌙" title="꿈번호" />
          <LinkCard href="/lotto/year/2025" icon="📅" title="연도별 분석" />
        </div>
      </div>

      {/* 다른 패턴 */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold mb-4">📋 다른 패턴 분석</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {allPatterns.map(p => (
            <Link
              key={p.type}
              href={`/lotto/pattern/${p.type}`}
              className={`p-3 rounded-lg text-center text-sm font-medium transition-all hover:opacity-80 ${p.type === type ? 'font-bold' : ''}`}
              style={{
                backgroundColor: p.type === type ? '#D36135' : 'var(--border)',
                color: p.type === type ? '#fff' : 'var(--text)',
              }}
            >
              {patternEmoji[p.type]} {p.name.replace(' 분석', '')}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function BarChart({ items, maxCount }: { items: { label: string; count: number; sub?: string }[]; maxCount: number }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-sm font-medium w-24 shrink-0">{item.label}</span>
          <div className="flex-1">
            <div className="h-7 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
              <div
                className="h-full rounded-full flex items-center px-3"
                style={{
                  width: `${Math.max((item.count / maxCount) * 100, 8)}%`,
                  backgroundColor: i === 0 ? '#D36135' : '#3E5641',
                }}
              >
                <span className="text-xs font-bold text-white whitespace-nowrap">{item.count}회</span>
              </div>
            </div>
          </div>
          <span className="text-sm w-14 text-right" style={{ color: 'var(--text-secondary)' }}>{item.sub}</span>
        </div>
      ))}
    </div>
  );
}

function OddEvenResult({ data }: { data: { ratio: string; count: number; percentage: string }[] }) {
  const maxCount = Math.max(...data.map(d => d.count));
  return (
    <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
      <h2 className="text-xl font-bold mb-2">홀짝 비율 분포</h2>
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>홀:짝 비율별 출현 횟수 (가장 많은 비율이 1위)</p>
      <BarChart items={data.map(d => ({ label: `홀${d.ratio}짝`, count: d.count, sub: `${d.percentage}%` }))} maxCount={maxCount} />
      <p className="mt-4 text-sm p-3 rounded-lg" style={{ backgroundColor: 'rgba(211,97,53,0.1)' }}>
        💡 <strong>팁:</strong> 홀짝이 3:3 또는 4:2로 나오는 경우가 가장 많습니다. 한쪽으로 치우친 6:0이나 0:6은 매우 드뭅니다.
      </p>
    </div>
  );
}

function HighLowResult({ data }: { data: { ratio: string; count: number; percentage: string }[] }) {
  const maxCount = Math.max(...data.map(d => d.count));
  return (
    <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
      <h2 className="text-xl font-bold mb-2">고저 비율 분포</h2>
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>저번호(1~22) : 고번호(23~45) 비율별 출현 횟수</p>
      <BarChart items={data.map(d => ({ label: d.ratio, count: d.count, sub: `${d.percentage}%` }))} maxCount={maxCount} />
      <p className="mt-4 text-sm p-3 rounded-lg" style={{ backgroundColor: 'rgba(211,97,53,0.1)' }}>
        💡 <strong>팁:</strong> 저번호와 고번호가 3:3으로 균형 잡힌 경우가 가장 많습니다.
      </p>
    </div>
  );
}

function SumRangeResult({ data }: { data: { ranges: { label: string; count: number; percentage: string }[]; avgSum: number; minSum: number; maxSum: number } }) {
  const maxCount = Math.max(...data.ranges.map(d => d.count));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="평균 합계" value={String(data.avgSum)} />
        <StatCard label="최소 합계" value={String(data.minSum)} />
        <StatCard label="최대 합계" value={String(data.maxSum)} />
      </div>
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold mb-2">합계 구간별 분포</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>당첨번호 6개의 합계가 어느 구간에 가장 많이 분포하는지</p>
        <BarChart items={data.ranges.map(d => ({ label: d.label, count: d.count, sub: `${d.percentage}%` }))} maxCount={maxCount} />
        <p className="mt-4 text-sm p-3 rounded-lg" style={{ backgroundColor: 'rgba(211,97,53,0.1)' }}>
          💡 <strong>팁:</strong> 합계 100~170 구간이 당첨 확률이 가장 높습니다. 극단적으로 낮거나 높은 합계는 드뭅니다.
        </p>
      </div>
    </div>
  );
}

function ConsecutiveResult({ data }: { data: { withConsecutive: number; withoutConsecutive: number; percentage: string; counts: Record<number, number> } }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="연속번호 포함" value={`${data.withConsecutive}회`} sub={`${data.percentage}%`} />
        <StatCard label="연속번호 없음" value={`${data.withoutConsecutive}회`} sub={`${(100 - Number(data.percentage)).toFixed(1)}%`} />
      </div>
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold mb-2">연속번호 개수별 분포</h2>
        <div className="space-y-3">
          {Object.entries(data.counts).map(([key, count]) => {
            const label = key === '0' ? '연속 없음' : key === '1' ? '2연속' : key === '2' ? '3연속' : '4연속+';
            const maxVal = Math.max(...Object.values(data.counts));
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="text-sm font-medium w-20">{label}</span>
                <div className="flex-1">
                  <div className="h-7 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                    <div className="h-full rounded-full flex items-center px-3" style={{ width: `${Math.max((count / maxVal) * 100, 8)}%`, backgroundColor: '#D36135' }}>
                      <span className="text-xs font-bold text-white">{count}회</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-sm p-3 rounded-lg" style={{ backgroundColor: 'rgba(211,97,53,0.1)' }}>
          💡 <strong>팁:</strong> 전체 추첨의 약 {data.percentage}%에서 연속번호가 1쌍 이상 포함됩니다. 연속번호를 완전히 배제하지 않는 것이 유리합니다.
        </p>
      </div>
    </div>
  );
}

function SectionResult({ data }: { data: { label: string; count: number; percentage: string; expected: string }[] }) {
  const maxCount = Math.max(...data.map(d => d.count));
  const colors = ['#FFC107', '#2196F3', '#FF5722', '#757575', '#4CAF50'];
  return (
    <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
      <h2 className="text-xl font-bold mb-2">구간별 번호 분포</h2>
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>5개 구간별 번호 출현 횟수와 기대값 비교</p>
      <div className="space-y-3">
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center gap-3">
            <span className="text-sm font-medium w-16">{d.label}</span>
            <div className="flex-1">
              <div className="h-7 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                <div className="h-full rounded-full flex items-center px-3" style={{ width: `${(d.count / maxCount) * 100}%`, backgroundColor: colors[i] }}>
                  <span className="text-xs font-bold text-white">{d.count}회</span>
                </div>
              </div>
            </div>
            <span className="text-sm w-20 text-right" style={{ color: 'var(--text-secondary)' }}>{d.percentage}% (기대 {d.expected})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EndingNumberResult({ data }: { data: { digit: number; count: number; percentage: string }[] }) {
  const maxCount = Math.max(...data.map(d => d.count));
  return (
    <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
      <h2 className="text-xl font-bold mb-2">끝수별 출현 빈도</h2>
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>당첨번호의 끝자리(0~9)별 출현 순위</p>
      <BarChart items={data.map((d, i) => ({ label: `끝수 ${d.digit}`, count: d.count, sub: `${d.percentage}%` }))} maxCount={maxCount} />
      <p className="mt-4 text-sm p-3 rounded-lg" style={{ backgroundColor: 'rgba(211,97,53,0.1)' }}>
        💡 <strong>팁:</strong> 같은 끝수의 번호를 3개 이상 선택하면 당첨 확률이 낮아집니다. 다양한 끝수를 골고루 선택하세요.
      </p>
    </div>
  );
}

function GapResult({ data }: { data: { gap: number; count: number }[] }) {
  const maxCount = Math.max(...data.map(d => d.count));
  return (
    <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
      <h2 className="text-xl font-bold mb-2">인접 번호 간격 분포</h2>
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>정렬된 당첨번호에서 인접한 두 번호의 차이</p>
      <BarChart items={data.map(d => ({ label: `간격 ${d.gap}`, count: d.count, sub: '' }))} maxCount={maxCount} />
      <p className="mt-4 text-sm p-3 rounded-lg" style={{ backgroundColor: 'rgba(211,97,53,0.1)' }}>
        💡 <strong>팁:</strong> 간격 1(연속번호)~8이 가장 자주 나타납니다. 번호 사이가 너무 멀리 떨어진 조합은 드뭅니다.
      </p>
    </div>
  );
}

function ACValueResult({ data }: { data: { ac: number; count: number; percentage: string }[] }) {
  const maxCount = Math.max(...data.map(d => d.count));
  return (
    <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
      <h2 className="text-xl font-bold mb-2">AC값 분포</h2>
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>AC값 = 번호 조합의 차이값 종류 수 - 5. 높을수록 번호가 골고루 분포</p>
      <BarChart items={data.map(d => ({ label: `AC ${d.ac}`, count: d.count, sub: `${d.percentage}%` }))} maxCount={maxCount} />
      <p className="mt-4 text-sm p-3 rounded-lg" style={{ backgroundColor: 'rgba(211,97,53,0.1)' }}>
        💡 <strong>팁:</strong> AC값 7~10이 가장 흔합니다. AC값이 낮으면 번호가 한쪽에 몰려 있다는 뜻이며 당첨 확률이 낮습니다.
      </p>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl p-4 text-center" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{sub}</div>}
    </div>
  );
}

function LinkCard({ href, icon, title }: { href: string; icon: string; title: string }) {
  return (
    <Link
      href={href}
      className="p-3 rounded-lg text-center text-sm font-medium transition-all hover:opacity-80"
      style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
    >
      <div className="text-xl mb-1">{icon}</div>
      {title}
    </Link>
  );
}

function getFaqItems(type: string, name: string, totalRounds: number) {
  const faqMap: Record<string, { q: string; a: string }[]> = {
    'odd-even': [
      { q: '로또 홀짝 비율에서 가장 많이 나오는 조합은?', a: `총 ${totalRounds}회 추첨 데이터 분석 결과, 홀수 3개 + 짝수 3개(3:3)가 가장 많이 출현했습니다. 그 다음은 4:2 또는 2:4입니다.` },
      { q: '홀수나 짝수로만 구성된 번호도 당첨된 적 있나요?', a: '6:0(홀수만) 또는 0:6(짝수만)은 매우 드물게 나타납니다. 통계적으로 전체의 1% 미만이므로 한쪽으로 치우친 번호는 피하는 것이 좋습니다.' },
      { q: '홀짝 비율을 번호 선택에 어떻게 활용하나요?', a: '3:3 또는 4:2 비율로 번호를 구성하는 것이 통계적으로 가장 유리합니다. 예를 들어 홀수 3개(1,7,15)와 짝수 3개(8,22,34)를 조합하세요.' },
    ],
    'high-low': [
      { q: '로또 번호에서 저번호와 고번호의 기준은?', a: '1~22를 저번호(Low), 23~45를 고번호(High)로 구분합니다. 45개 번호를 거의 절반으로 나눈 기준입니다.' },
      { q: '저번호와 고번호의 최적 비율은?', a: `${totalRounds}회 데이터 분석 결과, 3:3(저3:고3)이 가장 많이 출현했습니다. 한쪽으로 4개 이상 치우친 조합은 확률이 낮아집니다.` },
      { q: '고저 비율 분석을 실전에 어떻게 쓰나요?', a: '번호를 선택한 후 저번호(1~22)와 고번호(23~45) 개수를 세어보세요. 3:3이나 2:4가 아니라면 일부 번호를 교체하는 것이 좋습니다.' },
    ],
    'sum-range': [
      { q: '로또 당첨번호 합계의 평균은?', a: `${totalRounds}회 데이터 기준, 당첨번호 6개의 합계 평균은 약 130~140입니다. 이론적 기대값은 138입니다.` },
      { q: '합계가 너무 낮거나 높으면 불리한가요?', a: '네, 합계 60 이하나 200 이상인 경우는 전체의 5% 미만입니다. 100~170 구간이 가장 자주 당첨되므로 이 범위를 목표로 번호를 선택하세요.' },
      { q: '번호 합계를 쉽게 계산하는 방법은?', a: '선택한 6개 번호를 모두 더하면 됩니다. 예를 들어 3, 12, 18, 27, 35, 41을 선택하면 합계는 136으로 최적 구간에 해당합니다.' },
    ],
    'consecutive': [
      { q: '연속번호가 포함된 당첨이 실제로 많나요?', a: `네, 전체 ${totalRounds}회 중 절반 이상에서 연속번호(예: 5-6, 23-24)가 1쌍 이상 포함되었습니다. 연속번호를 완전히 배제하면 오히려 불리합니다.` },
      { q: '3연속번호(예: 10-11-12)는 자주 나오나요?', a: '3연속번호는 2연속에 비해 출현 빈도가 크게 낮습니다. 2연속 1쌍 정도를 포함하는 것이 가장 현실적인 전략입니다.' },
      { q: '연속번호 전략을 어떻게 활용하나요?', a: '6개 번호 중 2개는 연속되게(예: 15-16), 나머지 4개는 간격을 두고 선택하는 것이 통계적으로 가장 자연스러운 조합입니다.' },
    ],
    'section': [
      { q: '로또 번호의 5개 구간은 어떻게 나누나요?', a: '1~9(1구간), 10~19(2구간), 20~29(3구간), 30~39(4구간), 40~45(5구간)으로 나눕니다. 각 구간에서 고루 번호를 선택하는 것이 좋습니다.' },
      { q: '한 구간에서 번호를 많이 뽑으면 불리한가요?', a: '한 구간에서 3개 이상 선택하면 당첨 확률이 낮아집니다. 최소 3~4개 구간에 걸쳐 번호를 분산시키세요.' },
      { q: '구간별로 꼭 1개씩 넣어야 하나요?', a: '꼭 1개씩일 필요는 없지만, 최소 3개 구간 이상에서 번호를 선택하는 것이 통계적으로 유리합니다.' },
    ],
    'ending-number': [
      { q: '끝수 분석이란 무엇인가요?', a: '당첨번호의 일의 자리(끝자리) 숫자를 분석하는 것입니다. 예를 들어 7, 17, 27, 37은 모두 끝수 7입니다.' },
      { q: '같은 끝수 번호를 여러 개 넣으면 불리한가요?', a: '같은 끝수의 번호를 3개 이상 선택하면 당첨 확률이 크게 떨어집니다. 다양한 끝수를 골고루 배분하세요.' },
      { q: '가장 자주 나오는 끝수는?', a: `${totalRounds}회 데이터에서 끝수 0~9의 출현 빈도는 비교적 균등하지만, 미세한 차이가 있습니다. 위 차트에서 상위 끝수를 참고하세요.` },
    ],
    'gap': [
      { q: '번호 간격 분석이란?', a: '당첨번호를 오름차순 정렬한 후 인접한 두 번호의 차이를 분석하는 것입니다. 예를 들어 3, 8, 15면 간격은 5, 7입니다.' },
      { q: '적절한 번호 간격은?', a: '간격 1~8이 가장 자주 나타납니다. 모든 번호가 10 이상 떨어져 있거나, 모두 붙어있는 경우는 드뭅니다.' },
      { q: '간격 분석을 실전에 어떻게 활용하나요?', a: '선택한 6개 번호를 정렬한 후 간격을 확인하세요. 간격이 너무 균일하거나 극단적이면 일부 번호를 조정하는 것이 좋습니다.' },
    ],
    'ac-value': [
      { q: 'AC값이란 무엇인가요?', a: '번호 조합 복잡도(Arithmetic Complexity)입니다. 6개 번호에서 만들 수 있는 15개 차이값 중 서로 다른 값의 개수에서 5를 뺀 값입니다. 0~10 범위입니다.' },
      { q: 'AC값이 높으면 좋은 건가요?', a: 'AC값이 높을수록 번호가 골고루 분포되어 있다는 뜻입니다. AC값 7~10이 당첨 번호에서 가장 자주 나타나므로, 이 범위를 목표로 하세요.' },
      { q: 'AC값이 낮은 번호 예시는?', a: '1, 2, 3, 4, 5, 6 같은 연속번호는 AC값이 매우 낮습니다(AC=1). 이런 패턴은 당첨 확률이 극히 낮으므로 피해야 합니다.' },
    ],
  };
  return faqMap[type] || [
    { q: `${name}은 무엇인가요?`, a: `${name}은 로또 당첨번호의 패턴을 분석하여 번호 선택에 도움을 주는 통계 분석입니다.` },
    { q: `이 분석을 어떻게 활용하나요?`, a: `과거 ${totalRounds}회의 데이터를 기반으로 한 통계이므로, 번호 선택 시 참고 자료로 활용하세요.` },
  ];
}
