import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { REAL_LOTTO_DATA } from '@/data/realLottoData';
import Breadcrumb from '@/components/layout/Breadcrumb';
import PatternAnalysisContent from './PatternAnalysisContent';

interface Props {
  params: { type: string };
}

export const revalidate = 3600;

const PATTERN_TYPES = [
  { type: 'odd-even', name: '홀짝 비율 분석', desc: '로또 당첨번호의 홀수/짝수 비율 통계' },
  { type: 'high-low', name: '고저 비율 분석', desc: '로또 당첨번호의 고번호(23~45)/저번호(1~22) 비율' },
  { type: 'sum-range', name: '합계 구간 분석', desc: '로또 당첨번호 6개 합계의 분포와 최적 구간' },
  { type: 'consecutive', name: '연속번호 분석', desc: '로또 당첨번호에서 연속 번호가 나오는 패턴' },
  { type: 'section', name: '구간별 분포 분석', desc: '1~10, 11~20, 21~30, 31~40, 41~45 구간별 출현 통계' },
  { type: 'ending-number', name: '끝수 분석', desc: '로또 당첨번호의 끝자리(0~9) 출현 패턴' },
  { type: 'gap', name: '번호 간격 분석', desc: '당첨번호 간의 간격(차이) 통계' },
  { type: 'ac-value', name: 'AC값 분석', desc: '로또 당첨번호의 AC값(조합 차이 수) 분석' },
] as const;

type PatternType = typeof PATTERN_TYPES[number]['type'];

export function generateStaticParams() {
  return PATTERN_TYPES.map(p => ({ type: p.type }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pattern = PATTERN_TYPES.find(p => p.type === params.type);
  if (!pattern) return { title: '패턴 분석 | 로또킹' };

  const totalRounds = REAL_LOTTO_DATA.length;
  const title = `로또 ${pattern.name} - ${totalRounds}회 데이터 기반 | 로또킹`;
  const description = `${pattern.desc}. 총 ${totalRounds}회 추첨 데이터를 기반으로 당첨 확률이 높은 패턴을 분석합니다.`;

  return {
    title,
    description,
    openGraph: {
      title: `로또 ${pattern.name}`,
      description,
      url: `https://lotto.gon.ai.kr/lotto/pattern/${pattern.type}`,
    },
  };
}

function analyzeOddEven() {
  const distribution: Record<string, number> = {};
  for (const round of REAL_LOTTO_DATA) {
    const oddCount = round.numbers.filter(n => n % 2 === 1).length;
    const key = `${oddCount}:${6 - oddCount}`;
    distribution[key] = (distribution[key] || 0) + 1;
  }
  return Object.entries(distribution)
    .map(([ratio, count]) => ({ ratio, count, percentage: ((count / REAL_LOTTO_DATA.length) * 100).toFixed(1) }))
    .sort((a, b) => b.count - a.count);
}

function analyzeHighLow() {
  const distribution: Record<string, number> = {};
  for (const round of REAL_LOTTO_DATA) {
    const lowCount = round.numbers.filter(n => n <= 22).length;
    const key = `저${lowCount}:고${6 - lowCount}`;
    distribution[key] = (distribution[key] || 0) + 1;
  }
  return Object.entries(distribution)
    .map(([ratio, count]) => ({ ratio, count, percentage: ((count / REAL_LOTTO_DATA.length) * 100).toFixed(1) }))
    .sort((a, b) => b.count - a.count);
}

function analyzeSumRange() {
  const sums = REAL_LOTTO_DATA.map(r => ({
    round: r.round,
    sum: r.numbers.reduce((a, b) => a + b, 0),
  }));
  const ranges = [
    { label: '21~80', min: 21, max: 80 },
    { label: '81~120', min: 81, max: 120 },
    { label: '121~160', min: 121, max: 160 },
    { label: '161~200', min: 161, max: 200 },
    { label: '201~255', min: 201, max: 255 },
  ];
  const avgSum = Math.round(sums.reduce((a, b) => a + b.sum, 0) / sums.length);
  const result = ranges.map(r => ({
    label: r.label,
    count: sums.filter(s => s.sum >= r.min && s.sum <= r.max).length,
    percentage: ((sums.filter(s => s.sum >= r.min && s.sum <= r.max).length / sums.length) * 100).toFixed(1),
  }));
  return { ranges: result, avgSum, minSum: Math.min(...sums.map(s => s.sum)), maxSum: Math.max(...sums.map(s => s.sum)) };
}

function analyzeConsecutive() {
  let withConsecutive = 0;
  const consecutiveCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
  for (const round of REAL_LOTTO_DATA) {
    const sorted = [...round.numbers].sort((a, b) => a - b);
    let maxConsec = 0;
    let currentConsec = 0;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] - sorted[i - 1] === 1) {
        currentConsec++;
        maxConsec = Math.max(maxConsec, currentConsec);
      } else {
        currentConsec = 0;
      }
    }
    if (maxConsec > 0) withConsecutive++;
    const key = Math.min(maxConsec, 3);
    consecutiveCounts[key] = (consecutiveCounts[key] || 0) + 1;
  }
  return {
    withConsecutive,
    withoutConsecutive: REAL_LOTTO_DATA.length - withConsecutive,
    percentage: ((withConsecutive / REAL_LOTTO_DATA.length) * 100).toFixed(1),
    counts: consecutiveCounts,
  };
}

function analyzeSection() {
  const sectionCounts = [0, 0, 0, 0, 0];
  const sectionLabels = ['1~10', '11~20', '21~30', '31~40', '41~45'];
  for (const round of REAL_LOTTO_DATA) {
    for (const n of round.numbers) {
      if (n <= 10) sectionCounts[0]++;
      else if (n <= 20) sectionCounts[1]++;
      else if (n <= 30) sectionCounts[2]++;
      else if (n <= 40) sectionCounts[3]++;
      else sectionCounts[4]++;
    }
  }
  const total = sectionCounts.reduce((a, b) => a + b, 0);
  return sectionLabels.map((label, i) => ({
    label,
    count: sectionCounts[i],
    percentage: ((sectionCounts[i] / total) * 100).toFixed(1),
    expected: i < 4 ? '22.2%' : '11.1%',
  }));
}

function analyzeEndingNumber() {
  const endings: Record<number, number> = {};
  for (let i = 0; i <= 9; i++) endings[i] = 0;
  for (const round of REAL_LOTTO_DATA) {
    for (const n of round.numbers) {
      endings[n % 10]++;
    }
  }
  const total = Object.values(endings).reduce((a, b) => a + b, 0);
  return Object.entries(endings)
    .map(([digit, count]) => ({ digit: Number(digit), count, percentage: ((count / total) * 100).toFixed(1) }))
    .sort((a, b) => b.count - a.count);
}

function analyzeGap() {
  const gaps: Record<number, number> = {};
  for (const round of REAL_LOTTO_DATA) {
    const sorted = [...round.numbers].sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i++) {
      const gap = sorted[i] - sorted[i - 1];
      gaps[gap] = (gaps[gap] || 0) + 1;
    }
  }
  return Object.entries(gaps)
    .map(([gap, count]) => ({ gap: Number(gap), count }))
    .sort((a, b) => a.gap - b.gap)
    .slice(0, 20);
}

function analyzeACValue() {
  const acValues: Record<number, number> = {};
  for (const round of REAL_LOTTO_DATA) {
    const sorted = [...round.numbers].sort((a, b) => a - b);
    const diffs = new Set<number>();
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        diffs.add(sorted[j] - sorted[i]);
      }
    }
    const ac = diffs.size - 5;
    acValues[ac] = (acValues[ac] || 0) + 1;
  }
  const total = REAL_LOTTO_DATA.length;
  return Object.entries(acValues)
    .map(([ac, count]) => ({ ac: Number(ac), count, percentage: ((count / total) * 100).toFixed(1) }))
    .sort((a, b) => a.ac - b.ac);
}

export default function PatternPage({ params }: Props) {
  const pattern = PATTERN_TYPES.find(p => p.type === params.type);
  if (!pattern) notFound();

  const totalRounds = REAL_LOTTO_DATA.length;

  let analysisData: unknown;
  switch (params.type as PatternType) {
    case 'odd-even': analysisData = analyzeOddEven(); break;
    case 'high-low': analysisData = analyzeHighLow(); break;
    case 'sum-range': analysisData = analyzeSumRange(); break;
    case 'consecutive': analysisData = analyzeConsecutive(); break;
    case 'section': analysisData = analyzeSection(); break;
    case 'ending-number': analysisData = analyzeEndingNumber(); break;
    case 'gap': analysisData = analyzeGap(); break;
    case 'ac-value': analysisData = analyzeACValue(); break;
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `로또 ${pattern.name}이란?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${pattern.desc} 총 ${totalRounds}회 추첨 데이터를 기반으로 분석합니다.`,
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <Breadcrumb items={[
        { label: '홈', href: '/' },
        { label: '패턴 분석' },
        { label: pattern.name },
      ]} />

      <PatternAnalysisContent
        type={params.type}
        name={pattern.name}
        desc={pattern.desc}
        totalRounds={totalRounds}
        data={analysisData}
        allPatterns={PATTERN_TYPES.map(p => ({ type: p.type, name: p.name }))}
      />
    </>
  );
}
