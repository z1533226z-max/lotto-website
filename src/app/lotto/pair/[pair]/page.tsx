import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllLottoData, getLatestRound } from '@/lib/dataFetcher';
import { LottoStatisticsAnalyzer } from '@/lib/statisticsAnalyzer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import PairAnalysisContent from './PairAnalysisContent';

interface Props {
  params: { pair: string };
}

function parsePair(pair: string): [number, number] | null {
  const parts = pair.split('-');
  if (parts.length !== 2) return null;
  const a = parseInt(parts[0]);
  const b = parseInt(parts[1]);
  if (isNaN(a) || isNaN(b) || a < 1 || a > 44 || b < 2 || b > 45 || a >= b) return null;
  return [a, b];
}

// 이론적 동시 출현 확률: C(43,4)/C(45,6) = 123410/8145060 ≈ 1.52%
const THEORETICAL_RATE = '1.52';

export const revalidate = 3600;

export function generateStaticParams() {
  const params = [];
  for (let i = 1; i <= 44; i++) {
    for (let j = i + 1; j <= 45; j++) {
      params.push({ pair: `${i}-${j}` });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const parsed = parsePair(params.pair);
  if (!parsed) return { title: '번호 조합 분석 | 로또킹' };

  const [num1, num2] = parsed;
  const allData = await getAllLottoData();
  const pairCount = allData.filter(r =>
    r.numbers.includes(num1) && r.numbers.includes(num2)
  ).length;

  const title = `로또 ${num1}번 ${num2}번 동시 출현 ${pairCount}회 - 번호 궁합 분석 | 로또킹`;
  const description = `로또 6/45에서 ${num1}번과 ${num2}번이 함께 나온 횟수는 ${pairCount}회입니다. 동시 출현 패턴, 최근 추세, 출현 회차 목록, 관련 번호 조합을 분석합니다.`;

  return {
    title,
    description,
    alternates: { canonical: `/lotto/pair/${num1}-${num2}` },
    openGraph: {
      title: `로또 ${num1}번 & ${num2}번 동시 출현 분석`,
      description,
      url: `https://lotto.gon.ai.kr/lotto/pair/${num1}-${num2}`,
    },
  };
}

export default async function PairAnalysisPage({ params }: Props) {
  const parsed = parsePair(params.pair);
  if (!parsed) notFound();

  const [num1, num2] = parsed;
  const allData = await getAllLottoData();
  const latest = getLatestRound(allData);
  if (!latest) notFound();

  const totalRounds = allData.length;
  const latestRound = latest.round;

  // 동시 출현 회차 (본번호 6개에서만 카운트)
  const pairRounds = allData
    .filter(r => r.numbers.includes(num1) && r.numbers.includes(num2))
    .map(r => ({ round: r.round, date: r.drawDate, numbers: r.numbers, bonus: r.bonusNumber }))
    .sort((a, b) => b.round - a.round);

  const pairCount = pairRounds.length;
  const pairRate = ((pairCount / totalRounds) * 100).toFixed(2);
  const lastPairRound = pairRounds.length > 0 ? pairRounds[0].round : 0;
  const pairGap = lastPairRound > 0 ? latestRound - lastPairRound : -1;

  // 최근 100회 vs 전체 출현율 비교 (추세 판단)
  const recent100 = allData.slice(-100);
  const recentPairCount = recent100.filter(r =>
    r.numbers.includes(num1) && r.numbers.includes(num2)
  ).length;
  const recentRate = ((recentPairCount / Math.min(100, totalRounds)) * 100).toFixed(2);

  // 개별 번호 통계
  const freq1 = LottoStatisticsAnalyzer.calculateFrequency(num1, allData);
  const freq2 = LottoStatisticsAnalyzer.calculateFrequency(num2, allData);
  const hot1 = LottoStatisticsAnalyzer.calculateHotColdScore(num1, allData);
  const hot2 = LottoStatisticsAnalyzer.calculateHotColdScore(num2, allData);
  const last1 = LottoStatisticsAnalyzer.calculateLastAppeared(num1, allData);
  const last2 = LottoStatisticsAnalyzer.calculateLastAppeared(num2, allData);

  // 이 조합과 자주 함께 나오는 다른 번호 TOP5
  const companionCounts: Record<number, number> = {};
  for (const round of pairRounds) {
    for (const n of round.numbers) {
      if (n !== num1 && n !== num2) {
        companionCounts[n] = (companionCounts[n] || 0) + 1;
      }
    }
  }
  const topCompanions = Object.entries(companionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([n, count]) => ({ number: Number(n), count }));

  // 동시 출현 간격 통계
  const pairRoundsSorted = [...pairRounds].sort((a, b) => a.round - b.round);
  const pairGaps: number[] = [];
  for (let i = 1; i < pairRoundsSorted.length; i++) {
    pairGaps.push(pairRoundsSorted[i].round - pairRoundsSorted[i - 1].round);
  }
  const avgPairGap = pairGaps.length > 0
    ? (pairGaps.reduce((a, b) => a + b, 0) / pairGaps.length).toFixed(1)
    : '0';
  const maxPairGap = pairGaps.length > 0 ? Math.max(...pairGaps) : 0;
  const minPairGap = pairGaps.length > 0 ? Math.min(...pairGaps) : 0;

  // JSON-LD: Dataset (server-generated trusted data, not user input)
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `로또 ${num1}번 ${num2}번 동시 출현 분석`,
    description: `로또 6/45 ${num1}번과 ${num2}번의 동시 출현 통계. 총 ${totalRounds}회 중 ${pairCount}회 동시 출현(${pairRate}%).`,
    url: `https://lotto.gon.ai.kr/lotto/pair/${num1}-${num2}`,
    keywords: [`로또 ${num1}번 ${num2}번`, '로또 번호 궁합', '로또 동시 출현', '로또 조합 분석'],
    creator: { '@type': 'Organization', name: '로또킹', url: 'https://lotto.gon.ai.kr' },
    license: 'https://creativecommons.org/licenses/by/4.0/',
  };

  // JSON-LD: FAQPage (server-generated trusted data, not user input)
  const faqJsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `로또 ${num1}번과 ${num2}번은 몇 번 같이 나왔나요?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `로또 ${num1}번과 ${num2}번은 총 ${totalRounds}회 추첨 중 ${pairCount}회 동시 출현했습니다 (출현율 ${pairRate}%).`,
        },
      },
      {
        '@type': 'Question',
        name: `로또 ${num1}번 ${num2}번 조합의 출현 확률은?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `이론적 동시 출현 확률은 약 ${THEORETICAL_RATE}%이며, 실제 출현율은 ${pairRate}%입니다.`,
        },
      },
      {
        '@type': 'Question',
        name: `로또 ${num1}번과 ${num2}번이 마지막으로 같이 나온 회차는?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: lastPairRound > 0
            ? `${num1}번과 ${num2}번이 마지막으로 동시 출현한 회차는 ${lastPairRound}회차입니다.`
            : `${num1}번과 ${num2}번은 아직 동시에 출현한 적이 없습니다.`,
        },
      },
    ],
  };

  return (
    <>
      {/* eslint-disable-next-line -- JSON-LD structured data from trusted server-side lotto data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }} />
      {/* eslint-disable-next-line -- JSON-LD structured data from trusted server-side lotto data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLdData) }} />

      <Breadcrumb items={[
        { label: '홈', href: '/' },
        { label: '번호 분석', href: '/lotto/number/1' },
        { label: `${num1}번 & ${num2}번 조합` },
      ]} />

      <PairAnalysisContent
        num1={num1}
        num2={num2}
        totalRounds={totalRounds}
        latestRound={latestRound}
        pairCount={pairCount}
        pairRate={pairRate}
        lastPairRound={lastPairRound}
        pairGap={pairGap}
        recentPairCount={recentPairCount}
        recentRate={recentRate}
        theoreticalRate={THEORETICAL_RATE}
        freq1={freq1}
        freq2={freq2}
        hot1={hot1}
        hot2={hot2}
        last1={last1}
        last2={last2}
        topCompanions={topCompanions}
        pairRounds={pairRounds.slice(0, 20)}
        avgPairGap={avgPairGap}
        maxPairGap={maxPairGap}
        minPairGap={minPairGap}
      />
    </>
  );
}
