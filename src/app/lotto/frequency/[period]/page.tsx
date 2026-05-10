import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllLottoData } from '@/lib/dataFetcher';
import Breadcrumb from '@/components/layout/Breadcrumb';
import FrequencyContent from './FrequencyContent';

interface Props {
  params: { period: string };
}

export const revalidate = 3600;

const PERIOD_CONFIGS: Record<string, { label: string; filterLabel: string }> = {
  'all': { label: '전체 역대', filterLabel: '전체 역대 기간' },
  'recent-10': { label: '최근 10회', filterLabel: '최근 10회차' },
  'recent-20': { label: '최근 20회', filterLabel: '최근 20회차' },
  'recent-50': { label: '최근 50회', filterLabel: '최근 50회차' },
  'recent-100': { label: '최근 100회', filterLabel: '최근 100회차' },
  '2026': { label: '2026년', filterLabel: '2026년 추첨' },
  '2025': { label: '2025년', filterLabel: '2025년 추첨' },
  '2024': { label: '2024년', filterLabel: '2024년 추첨' },
  '2023': { label: '2023년', filterLabel: '2023년 추첨' },
  '2022': { label: '2022년', filterLabel: '2022년 추첨' },
  '2021': { label: '2021년', filterLabel: '2021년 추첨' },
  '2020': { label: '2020년', filterLabel: '2020년 추첨' },
};

const ALL_PERIODS = Object.entries(PERIOD_CONFIGS).map(([slug, cfg]) => ({
  slug,
  label: cfg.label,
}));

export function generateStaticParams() {
  return Object.keys(PERIOD_CONFIGS).map(period => ({ period }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cfg = PERIOD_CONFIGS[params.period];
  if (!cfg) return { title: '번호 빈도 분석 | 로또킹' };

  const allData = await getAllLottoData();
  const filtered = filterData(allData, params.period);
  const totalRounds = filtered.length;

  const ranked = calculateRanking(filtered, allData);
  const top3 = ranked.slice(0, 3).map(n => n.number).join(', ');
  const bottom3 = ranked.slice(-3).map(n => n.number).join(', ');

  const title = `로또 ${cfg.label} 자주 나오는 번호 순위 - 핫넘버 콜드넘버 | 로또킹`;
  const description = `로또 6/45 ${cfg.filterLabel} ${totalRounds}회 기준 번호 출현 빈도 순위. 핫넘버 TOP 3: ${top3}번. 콜드넘버: ${bottom3}번. 이월번호, 색상별 통계까지 한눈에.`;

  return {
    title,
    description,
    alternates: { canonical: `/lotto/frequency/${params.period}` },
    openGraph: {
      title: `로또 ${cfg.label} 핫넘버 콜드넘버 순위`,
      description,
      url: `https://lotto.gon.ai.kr/lotto/frequency/${params.period}`,
    },
  };
}

function filterData(allData: { round: number; drawDate: string; numbers: number[]; bonusNumber: number }[], period: string) {
  const sorted = [...allData].sort((a, b) => b.round - a.round);
  if (period === 'all') return allData;
  if (period.startsWith('recent-')) {
    const n = parseInt(period.split('-')[1]);
    return sorted.slice(0, n);
  }
  // Year
  return allData.filter(d => d.drawDate.startsWith(period));
}

function calculateRanking(filtered: { round: number; numbers: number[]; bonusNumber: number }[], allData: { round: number; numbers: number[]; bonusNumber: number }[]) {
  const latestRound = Math.max(...allData.map(d => d.round));
  const totalRounds = filtered.length;

  const stats = Array.from({ length: 45 }, (_, i) => {
    const num = i + 1;
    let count = 0;
    let lastRound = 0;
    for (const d of filtered) {
      if (d.numbers.includes(num)) {
        count++;
        if (d.round > lastRound) lastRound = d.round;
      }
    }
    // For gap, use all data
    let lastAppearAll = 0;
    for (const d of allData) {
      if (d.numbers.includes(num) && d.round > lastAppearAll) lastAppearAll = d.round;
    }
    return {
      number: num,
      count,
      percentage: totalRounds > 0 ? ((count / totalRounds) * 100).toFixed(1) : '0.0',
      lastRound,
      gap: latestRound - lastAppearAll,
    };
  });

  return stats.sort((a, b) => b.count - a.count || a.gap - b.gap);
}

const COLOR_GROUPS = [
  { group: '노란공 (1~10)', color: '#FFC107', range: [1, 10] as const },
  { group: '파란공 (11~20)', color: '#2196F3', range: [11, 20] as const },
  { group: '빨간공 (21~30)', color: '#FF5722', range: [21, 30] as const },
  { group: '회색공 (31~40)', color: '#757575', range: [31, 40] as const },
  { group: '초록공 (41~45)', color: '#4CAF50', range: [41, 45] as const },
];

export default async function FrequencyPage({ params }: Props) {
  const cfg = PERIOD_CONFIGS[params.period];
  if (!cfg) notFound();

  const allData = await getAllLottoData();
  const filtered = filterData(allData, params.period);
  const totalRounds = filtered.length;

  if (totalRounds === 0) notFound();

  const ranked = calculateRanking(filtered, allData);

  const colorGroupStats = COLOR_GROUPS.map(g => {
    const nums = ranked.filter(n => n.number >= g.range[0] && n.number <= g.range[1]);
    const avg = (nums.reduce((sum, n) => sum + n.count, 0) / nums.length).toFixed(1);
    return {
      group: g.group,
      color: g.color,
      avg,
      numbers: `${g.range[0]}~${g.range[1]}번`,
    };
  });

  // Server-generated trusted JSON-LD: all values come from static lotto result data, no user input.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `로또 ${cfg.label} 번호 출현 빈도 랭킹`,
    description: `${cfg.filterLabel} ${totalRounds}회 기준 로또 번호 1~45 출현 빈도 순위`,
    url: `https://lotto.gon.ai.kr/lotto/frequency/${params.period}`,
    keywords: ['로또 자주 나오는 번호', '로또 핫넘버', '로또 콜드넘버', '로또 빈도 분석', `로또 ${cfg.label} 통계`],
    creator: { '@type': 'Organization', name: '로또킹', url: 'https://lotto.gon.ai.kr' },
  };

  const top3 = ranked.slice(0, 3);
  const bottom3 = ranked.slice(-3);
  const overdueTop = [...ranked].sort((a, b) => b.gap - a.gap).slice(0, 3);

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `로또에서 ${cfg.filterLabel} 가장 많이 나온 번호는?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${cfg.filterLabel} 기준 가장 많이 나온 번호는 ${top3.map(n => `${n.number}번(${n.count}회)`).join(', ')}입니다.`,
        },
      },
      {
        '@type': 'Question',
        name: `로또 ${cfg.label} 안 나오는 번호(콜드넘버)는?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${cfg.filterLabel} 기준 가장 적게 나온 번호는 ${bottom3.map(n => `${n.number}번(${n.count}회)`).join(', ')}입니다.`,
        },
      },
      {
        '@type': 'Question',
        name: '로또 이월번호(오래 안 나온 번호)는 언제 나올까요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `현재 가장 오래 안 나온 번호는 ${overdueTop.map(n => `${n.number}번(${n.gap}회차째 미출현)`).join(', ')}입니다. 통계적으로 이월번호가 반드시 나오는 시점은 예측할 수 없지만, 평균 출현 간격을 참고할 수 있습니다.`,
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <Breadcrumb items={[
        { label: '홈', href: '/' },
        { label: '번호 빈도 분석', href: '/lotto/frequency/all' },
        { label: cfg.label },
      ]} />

      <FrequencyContent
        period={params.period}
        periodLabel={`${cfg.label} 번호`}
        totalRounds={totalRounds}
        rankedNumbers={ranked}
        colorGroupStats={colorGroupStats}
        allPeriods={ALL_PERIODS}
      />
    </>
  );
}
