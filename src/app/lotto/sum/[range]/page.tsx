import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllLottoData, getLatestRound } from '@/lib/dataFetcher';
import Breadcrumb from '@/components/layout/Breadcrumb';
import SumRangeContent from './SumRangeContent';

interface Props {
  params: { range: string };
}

/** 합계 구간 정의 (13개) */
const SUM_RANGES = [
  { slug: '21-70', min: 21, max: 70, label: '21~70 (극저합계)' },
  { slug: '71-85', min: 71, max: 85, label: '71~85 (저합계)' },
  { slug: '86-100', min: 86, max: 100, label: '86~100' },
  { slug: '101-115', min: 101, max: 115, label: '101~115' },
  { slug: '116-130', min: 116, max: 130, label: '116~130' },
  { slug: '131-145', min: 131, max: 145, label: '131~145 (최빈 구간)' },
  { slug: '146-160', min: 146, max: 160, label: '146~160' },
  { slug: '161-175', min: 161, max: 175, label: '161~175' },
  { slug: '176-190', min: 176, max: 190, label: '176~190' },
  { slug: '191-205', min: 191, max: 205, label: '191~205' },
  { slug: '206-220', min: 206, max: 220, label: '206~220' },
  { slug: '221-235', min: 221, max: 235, label: '221~235 (고합계)' },
  { slug: '236-255', min: 236, max: 255, label: '236~255 (극고합계)' },
] as const;

function parseRange(raw: string) {
  return SUM_RANGES.find(r => r.slug === raw) ?? null;
}

function getSum(numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

export const revalidate = 3600;

export function generateStaticParams() {
  return SUM_RANGES.map(r => ({ range: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const range = parseRange(params.range);
  if (!range) return { title: '합계 구간 분석 | 로또킹' };

  const allData = await getAllLottoData();
  const totalRounds = allData.length;
  const matchCount = allData.filter(d => {
    const s = getSum(d.numbers);
    return s >= range.min && s <= range.max;
  }).length;
  const pct = ((matchCount / totalRounds) * 100).toFixed(1);

  const title = `로또 합계 ${range.min}~${range.max} 분석 - ${matchCount}회 출현(${pct}%) | 로또킹`;
  const description = `로또 6/45 당첨번호 합계가 ${range.min}~${range.max}인 회차 완전 분석. ${totalRounds}회 중 ${matchCount}회(${pct}%) 출현. 자주 나오는 번호, 홀짝·고저 비율, 최근 추세를 확인하세요.`;

  return {
    title,
    description,
    alternates: { canonical: `/lotto/sum/${range.slug}` },
    openGraph: {
      title: `로또 합계 ${range.min}~${range.max} 통계 분석`,
      description,
      url: `https://lotto.gon.ai.kr/lotto/sum/${range.slug}`,
    },
  };
}

export default async function SumRangePage({ params }: Props) {
  const range = parseRange(params.range);
  if (!range) notFound();

  const allData = await getAllLottoData();
  const latest = getLatestRound(allData);
  if (!latest) notFound();

  const totalRounds = allData.length;
  const latestRound = latest.round;

  // ── 해당 구간 회차 필터 ──
  const matchedRounds = allData.filter(d => {
    const s = getSum(d.numbers);
    return s >= range.min && s <= range.max;
  });
  const matchCount = matchedRounds.length;
  const matchPct = ((matchCount / totalRounds) * 100).toFixed(1);

  // ── 합계 통계 ──
  const sums = matchedRounds.map(d => getSum(d.numbers)).sort((a, b) => a - b);
  const avgSum = sums.length > 0
    ? (sums.reduce((a, b) => a + b, 0) / sums.length).toFixed(1)
    : '0';
  const medianSum = sums.length > 0 ? sums[Math.floor(sums.length / 2)] : 0;
  const minSum = sums.length > 0 ? sums[0] : 0;
  const maxSum = sums.length > 0 ? sums[sums.length - 1] : 0;

  // ── 최근 100회 추세 ──
  const recent100 = allData.slice(-100);
  const recentMatches = recent100.filter(d => {
    const s = getSum(d.numbers);
    return s >= range.min && s <= range.max;
  });
  const recentMatchCount = recentMatches.length;
  const recentMatchPct = ((recentMatchCount / Math.min(100, totalRounds)) * 100).toFixed(1);

  // ── 자주 나오는 번호 TOP 10 ──
  const numFreq: Record<number, number> = {};
  for (const r of matchedRounds) {
    for (const n of r.numbers) {
      numFreq[n] = (numFreq[n] || 0) + 1;
    }
  }
  const topNumbers = Object.entries(numFreq)
    .map(([n, count]) => ({
      number: parseInt(n),
      count,
      pct: ((count / matchCount) * 100).toFixed(1),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // ── 홀짝 분포 ──
  const oddEvenCount: Record<string, number> = {};
  for (const r of matchedRounds) {
    const odd = r.numbers.filter(n => n % 2 === 1).length;
    const even = 6 - odd;
    const key = `홀${odd}:짝${even}`;
    oddEvenCount[key] = (oddEvenCount[key] || 0) + 1;
  }
  const oddEvenDist = Object.entries(oddEvenCount)
    .map(([label, count]) => ({ label, count, pct: ((count / matchCount) * 100).toFixed(1) }))
    .sort((a, b) => b.count - a.count);

  // ── 고저 분포 ──
  const highLowCount: Record<string, number> = {};
  for (const r of matchedRounds) {
    const low = r.numbers.filter(n => n <= 22).length;
    const high = 6 - low;
    const key = `저${low}:고${high}`;
    highLowCount[key] = (highLowCount[key] || 0) + 1;
  }
  const highLowDist = Object.entries(highLowCount)
    .map(([label, count]) => ({ label, count, pct: ((count / matchCount) * 100).toFixed(1) }))
    .sort((a, b) => b.count - a.count);

  // ── 최근 출현 회차 (20개) ──
  const recentRounds = matchedRounds
    .sort((a, b) => b.round - a.round)
    .slice(0, 20)
    .map(r => ({
      round: r.round,
      date: r.drawDate,
      numbers: r.numbers,
      bonus: r.bonusNumber,
      sum: getSum(r.numbers),
    }));

  // ── 전체 구간 분포 (비교용) ──
  const allRanges = SUM_RANGES.map(r => {
    const cnt = allData.filter(d => {
      const s = getSum(d.numbers);
      return s >= r.min && s <= r.max;
    }).length;
    return {
      label: `${r.min}~${r.max}`,
      slug: r.slug,
      count: cnt,
      pct: ((cnt / totalRounds) * 100).toFixed(1),
      isCurrent: r.slug === range.slug,
    };
  });

  // ── JSON-LD (server-generated trusted data) ──
  const jsonLdData = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `로또 합계 ${range.min}~${range.max} 출현 통계`,
    description: `로또 6/45 당첨번호 합계가 ${range.min}~${range.max}인 회차의 ${totalRounds}회 누적 통계. ${matchCount}회 출현(${matchPct}%).`,
    url: `https://lotto.gon.ai.kr/lotto/sum/${range.slug}`,
    keywords: [`로또 합계 ${range.min}~${range.max}`, '로또 합계 분석', '로또 합계 통계', '로또 번호 합'],
    creator: { '@type': 'Organization', name: '로또킹', url: 'https://lotto.gon.ai.kr' },
    license: 'https://creativecommons.org/licenses/by/4.0/',
  });

  const faqJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `로또 합계 ${range.min}~${range.max}은 몇 번 나왔나요?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `로또 6/45에서 당첨번호 6개의 합계가 ${range.min}~${range.max}인 경우는 총 ${matchCount}회 출현했습니다. 전체 ${totalRounds}회 중 ${matchPct}%의 비율입니다.`,
        },
      },
      {
        '@type': 'Question',
        name: `합계 ${range.min}~${range.max} 구간에서 가장 많이 나온 번호는?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: topNumbers.length > 0
            ? `합계 ${range.min}~${range.max} 구간에서 가장 많이 나온 번호는 ${topNumbers[0].number}번(${topNumbers[0].count}회, ${topNumbers[0].pct}%)${topNumbers[1] ? `, ${topNumbers[1].number}번(${topNumbers[1].count}회)` : ''} 순입니다.`
            : '분석할 데이터가 부족합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '로또 당첨번호 합계는 보통 얼마인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '로또 6/45 당첨번호 6개의 합계는 평균 약 131~145 구간에 가장 많이 분포합니다. 이론적 평균은 138입니다.',
        },
      },
    ],
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdData }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd }} />

      <Breadcrumb items={[
        { label: '홈', href: '/' },
        { label: '패턴 분석', href: '/lotto/pattern/sum-range' },
        { label: `합계 ${range.min}~${range.max}` },
      ]} />

      <SumRangeContent
        rangeLabel={range.label}
        min={range.min}
        max={range.max}
        totalRounds={totalRounds}
        latestRound={latestRound}
        matchCount={matchCount}
        matchPct={matchPct}
        avgSum={avgSum}
        medianSum={medianSum}
        minSum={minSum}
        maxSum={maxSum}
        topNumbers={topNumbers}
        oddEvenDist={oddEvenDist}
        highLowDist={highLowDist}
        recentRounds={recentRounds}
        allRanges={allRanges}
        recentMatchCount={recentMatchCount}
        recentMatchPct={recentMatchPct}
      />
    </>
  );
}
