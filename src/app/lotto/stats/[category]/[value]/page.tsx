import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllLottoData } from '@/lib/dataFetcher';
import Breadcrumb from '@/components/layout/Breadcrumb';
import StatsDetailContent from './StatsDetailContent';

interface Props {
  params: { category: string; value: string };
}

export const revalidate = 3600;

// ── Category configs ──
const CATEGORIES: Record<string, {
  name: string;
  patternSlug: string;
  values: string[];
  label: (v: string) => string;
  title: (v: string) => string;
  match: (nums: number[], v: string) => boolean;
}> = {
  'odd-even': {
    name: '홀짝 비율',
    patternSlug: 'odd-even',
    values: ['0-6', '1-5', '2-4', '3-3', '4-2', '5-1', '6-0'],
    label: (v) => { const [o, e] = v.split('-'); return `홀수${o} 짝수${e}`; },
    title: (v) => { const [o, e] = v.split('-'); return `로또 홀수 ${o}개 짝수 ${e}개 당첨번호 분석`; },
    match: (nums, v) => nums.filter(n => n % 2 === 1).length === +v.split('-')[0],
  },
  'high-low': {
    name: '고저 비율',
    patternSlug: 'high-low',
    values: ['0-6', '1-5', '2-4', '3-3', '4-2', '5-1', '6-0'],
    label: (v) => { const [h, l] = v.split('-'); return `고번호${h} 저번호${l}`; },
    title: (v) => { const [h, l] = v.split('-'); return `로또 고번호 ${h}개 저번호 ${l}개 분석`; },
    match: (nums, v) => nums.filter(n => n >= 23).length === +v.split('-')[0],
  },
  'ac': {
    name: 'AC값',
    patternSlug: 'ac-value',
    values: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    label: (v) => `AC값 ${v}`,
    title: (v) => `로또 AC값 ${v} 당첨번호 분석`,
    match: (nums, v) => {
      const sorted = [...nums].sort((a, b) => a - b);
      const diffs = new Set<number>();
      for (let i = 0; i < sorted.length; i++)
        for (let j = i + 1; j < sorted.length; j++)
          diffs.add(sorted[j] - sorted[i]);
      return diffs.size - 5 === +v;
    },
  },
  'consecutive': {
    name: '연번',
    patternSlug: 'consecutive',
    values: ['0', '1', '2', '3', '4'],
    label: (v) => v === '0' ? '연번 없음' : `연번 ${v}쌍`,
    title: (v) => v === '0' ? '로또 연번 없는 당첨번호 분석' : `로또 연번 ${v}쌍 포함 당첨번호 분석`,
    match: (nums, v) => {
      const sorted = [...nums].sort((a, b) => a - b);
      let pairs = 0;
      for (let i = 1; i < sorted.length; i++)
        if (sorted[i] - sorted[i - 1] === 1) pairs++;
      const t = +v;
      return t >= 4 ? pairs >= 4 : pairs === t;
    },
  },
};

export function generateStaticParams() {
  const params: { category: string; value: string }[] = [];
  for (const [cat, cfg] of Object.entries(CATEGORIES)) {
    for (const val of cfg.values) {
      params.push({ category: cat, value: val });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cfg = CATEGORIES[params.category];
  if (!cfg || !cfg.values.includes(params.value)) return { title: '통계 분석 | 로또킹' };

  const allData = await getAllLottoData();
  const totalRounds = allData.length;
  const matchCount = allData.filter(d => cfg.match(d.numbers, params.value)).length;
  const pct = ((matchCount / totalRounds) * 100).toFixed(1);

  const title = `${cfg.title(params.value)} - ${matchCount}회(${pct}%) | 로또킹`;
  const description = `로또 6/45 역대 ${totalRounds}회 중 ${cfg.label(params.value)} 조합 ${matchCount}회 출현(${pct}%). 출현 추세, 최근 당첨번호, 연도별 통계를 확인하세요.`;

  return {
    title,
    description,
    alternates: { canonical: `/lotto/stats/${params.category}/${params.value}` },
    openGraph: {
      title: cfg.title(params.value),
      description,
      url: `https://lotto.gon.ai.kr/lotto/stats/${params.category}/${params.value}`,
    },
  };
}

export default async function StatsDetailPage({ params }: Props) {
  const cfg = CATEGORIES[params.category];
  if (!cfg || !cfg.values.includes(params.value)) notFound();

  const allData = await getAllLottoData();
  const totalRounds = allData.length;

  // Filter matching rounds
  const matchingRounds = allData.filter(d => cfg.match(d.numbers, params.value));
  const matchCount = matchingRounds.length;
  const pct = ((matchCount / totalRounds) * 100).toFixed(1);

  // Recent 30 matching rounds
  const recentMatches = [...matchingRounds]
    .sort((a, b) => b.round - a.round)
    .slice(0, 30)
    .map(r => ({ round: r.round, date: r.drawDate, numbers: r.numbers, bonus: r.bonusNumber }));

  // Yearly distribution
  const yearMap = new Map<number, { count: number; total: number }>();
  for (const d of allData) {
    const year = parseInt(d.drawDate.substring(0, 4));
    if (!yearMap.has(year)) yearMap.set(year, { count: 0, total: 0 });
    const entry = yearMap.get(year)!;
    entry.total++;
    if (cfg.match(d.numbers, params.value)) entry.count++;
  }
  const yearlyData = Array.from(yearMap.entries())
    .map(([year, data]) => ({ year, ...data }))
    .sort((a, b) => a.year - b.year);

  // Other values in same category
  const otherValues = cfg.values.map(v => {
    const cnt = allData.filter(d => cfg.match(d.numbers, v)).length;
    return { value: v, name: cfg.label(v), count: cnt, percentage: ((cnt / totalRounds) * 100).toFixed(1) };
  });

  // Gap analysis
  const sortedMatchRounds = matchingRounds.map(r => r.round).sort((a, b) => a - b);
  const gaps: number[] = [];
  for (let i = 1; i < sortedMatchRounds.length; i++) gaps.push(sortedMatchRounds[i] - sortedMatchRounds[i - 1]);
  const avgGap = gaps.length > 0 ? (gaps.reduce((a, b) => a + b, 0) / gaps.length).toFixed(1) : '-';
  const lastMatch = matchingRounds.length > 0
    ? [...matchingRounds].sort((a, b) => b.round - a.round)[0]
    : null;
  const roundsSinceLast = lastMatch ? allData[allData.length - 1].round - lastMatch.round : totalRounds;

  // JSON-LD is safe here: all values are server-generated from trusted static data (lotto results).
  // No user input flows into these objects.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: cfg.title(params.value),
    description: `${cfg.label(params.value)} 패턴의 ${totalRounds}회 누적 통계`,
    url: `https://lotto.gon.ai.kr/lotto/stats/${params.category}/${params.value}`,
    keywords: [cfg.title(params.value), `로또 ${cfg.name}`, '로또 패턴 분석', '로또 통계'],
    creator: { '@type': 'Organization', name: '로또킹', url: 'https://lotto.gon.ai.kr' },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `로또에서 ${cfg.label(params.value)} 패턴은 얼마나 자주 나오나요?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `전체 ${totalRounds}회 추첨 중 ${cfg.label(params.value)} 패턴은 ${matchCount}회 출현했습니다. 출현 확률은 ${pct}%입니다.`,
        },
      },
      {
        '@type': 'Question',
        name: `${cfg.label(params.value)} 패턴이 가장 최근에 나온 회차는?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: lastMatch
            ? `가장 최근 출현 회차는 ${lastMatch.round}회(${lastMatch.drawDate})이며, 당첨번호는 ${lastMatch.numbers.join(', ')}입니다.`
            : '해당 패턴의 출현 기록이 없습니다.',
        },
      },
      {
        '@type': 'Question',
        name: `${cfg.name} 분석이 로또 번호 선택에 도움이 되나요?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${cfg.name} 분석은 과거 통계를 기반으로 각 패턴의 출현 빈도를 보여줍니다. 극단적으로 치우친 패턴(출현율 5% 미만)을 피하면 통계적으로 유리한 조합을 선택할 수 있습니다.`,
        },
      },
    ],
  };

  // Server-generated trusted JSON-LD (same pattern as other lotto pages)
  const jsonLdScript = JSON.stringify(jsonLd);
  const faqJsonLdScript = JSON.stringify(faqJsonLd);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLdScript }} />

      <Breadcrumb items={[
        { label: '홈', href: '/' },
        { label: `${cfg.name} 분석`, href: `/lotto/pattern/${cfg.patternSlug}` },
        { label: cfg.label(params.value) },
      ]} />

      <StatsDetailContent
        category={params.category}
        value={params.value}
        categoryName={cfg.name}
        valueName={cfg.label(params.value)}
        patternSlug={cfg.patternSlug}
        totalRounds={totalRounds}
        matchCount={matchCount}
        percentage={pct}
        avgGap={avgGap}
        roundsSinceLast={roundsSinceLast}
        recentMatches={recentMatches}
        yearlyData={yearlyData}
        otherValues={otherValues}
      />
    </>
  );
}
