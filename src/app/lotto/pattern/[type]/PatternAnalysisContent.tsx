'use client';

import SectionFrame from '@/components/ui/SectionFrame';
import type { FaqItem } from '@/lib/seo';

interface Props {
  type: string;
  name: string;
  desc: string;
  totalRounds: number;
  data: unknown;
  allPatterns: { type: string; name: string }[];
  faqItems: FaqItem[];
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

export default function PatternAnalysisContent({ type, name, desc, totalRounds, data, allPatterns, faqItems }: Props) {
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
          {faqItems.map((faq, i) => (
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
            <a
              key={p.type}
              href={`/lotto/pattern/${p.type}`}
              className={`p-3 rounded-lg text-center text-sm font-medium transition-all hover:opacity-80 ${p.type === type ? 'font-bold' : ''}`}
              style={{
                backgroundColor: p.type === type ? '#D36135' : 'var(--border)',
                color: p.type === type ? '#fff' : 'var(--text)',
              }}
            >
              {patternEmoji[p.type]} {p.name.replace(' 분석', '')}
            </a>
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
      <div className="mt-4 flex flex-wrap gap-2">
        {data.map(d => {
          const [o, e] = d.ratio.split(':');
          return (
            <a key={d.ratio} href={`/lotto/stats/odd-even/${o}-${e}`} className="px-3 py-1.5 rounded-lg text-sm transition-all hover:opacity-80" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}>
              홀{o}짝{e} 상세 →
            </a>
          );
        })}
      </div>
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
      <div className="mt-4 flex flex-wrap gap-2">
        {data.map(d => {
          const m = d.ratio.match(/저(\d+):고(\d+)/);
          if (!m) return null;
          return (
            <a key={d.ratio} href={`/lotto/stats/high-low/${m[2]}-${m[1]}`} className="px-3 py-1.5 rounded-lg text-sm transition-all hover:opacity-80" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}>
              {d.ratio} 상세 →
            </a>
          );
        })}
      </div>
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
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.keys(data.counts).map(key => {
            const label = key === '0' ? '연번 없음' : `연번 ${key}쌍`;
            return (
              <a key={key} href={`/lotto/stats/consecutive/${key}`} className="px-3 py-1.5 rounded-lg text-sm transition-all hover:opacity-80" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}>
                {label} 상세 →
              </a>
            );
          })}
        </div>
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
      <div className="mt-4 flex flex-wrap gap-2">
        {data.map(d => (
          <a key={d.ac} href={`/lotto/stats/ac/${d.ac}`} className="px-3 py-1.5 rounded-lg text-sm transition-all hover:opacity-80" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}>
            AC {d.ac} 상세 →
          </a>
        ))}
      </div>
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
    <a
      href={href}
      className="p-3 rounded-lg text-center text-sm font-medium transition-all hover:opacity-80"
      style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
    >
      <div className="text-xl mb-1">{icon}</div>
      {title}
    </a>
  );
}
