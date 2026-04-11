import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllLottoData, getLatestRound } from '@/lib/dataFetcher';
import { LottoStatisticsAnalyzer } from '@/lib/statisticsAnalyzer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import NumberAnalysisContent from './NumberAnalysisContent';

interface Props {
  params: { id: string };
}

export const revalidate = 3600;

export function generateStaticParams() {
  return Array.from({ length: 45 }, (_, i) => ({ id: String(i + 1) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const num = parseInt(params.id);
  if (isNaN(num) || num < 1 || num > 45) {
    return { title: '번호 분석 | 로또킹' };
  }

  const allData = await getAllLottoData();
  const frequency = LottoStatisticsAnalyzer.calculateFrequency(num, allData);
  const totalRounds = allData.length;
  const percentage = ((frequency / totalRounds) * 100).toFixed(1);

  const title = `로또 ${num}번 분석 - 출현 ${frequency}회 (${percentage}%) | 로또킹`;
  const description = `로또 6/45 ${num}번 완전 분석. 총 ${totalRounds}회 중 ${frequency}회 출현(${percentage}%). 출현 간격, 최근 추세, 동반 출현 번호, 핫/콜드 점수까지 한눈에 확인하세요.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/lotto/number/${num}`,
    },
    openGraph: {
      title: `로또 ${num}번 번호 분석`,
      description,
      url: `https://lotto.gon.ai.kr/lotto/number/${num}`,
    },
  };
}

export default async function NumberAnalysisPage({ params }: Props) {
  const num = parseInt(params.id);
  if (isNaN(num) || num < 1 || num > 45) {
    notFound();
  }

  const allData = await getAllLottoData();
  const latest = getLatestRound(allData);
  if (!latest) notFound();

  const totalRounds = allData.length;
  const frequency = LottoStatisticsAnalyzer.calculateFrequency(num, allData);
  const lastAppeared = LottoStatisticsAnalyzer.calculateLastAppeared(num, allData);
  const hotColdScore = LottoStatisticsAnalyzer.calculateHotColdScore(num, allData);
  const consecutiveCount = LottoStatisticsAnalyzer.calculateConsecutiveCount(num, allData);
  const recentFrequency = LottoStatisticsAnalyzer.calculateRecentFrequency(num, allData, 20);
  const latestRound = latest.round;

  const companionCounts: Record<number, number> = {};
  for (const round of allData) {
    const allNums = [...round.numbers, round.bonusNumber];
    if (allNums.includes(num)) {
      for (const n of round.numbers) {
        if (n !== num) {
          companionCounts[n] = (companionCounts[n] || 0) + 1;
        }
      }
    }
  }
  const topCompanions = Object.entries(companionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([n, count]) => ({ number: Number(n), count }));

  const appearedRounds = allData
    .filter(r => r.numbers.includes(num) || r.bonusNumber === num)
    .map(r => r.round)
    .sort((a, b) => a - b);

  const gaps: number[] = [];
  for (let i = 1; i < appearedRounds.length; i++) {
    gaps.push(appearedRounds[i] - appearedRounds[i - 1]);
  }
  const avgGap = gaps.length > 0 ? (gaps.reduce((a, b) => a + b, 0) / gaps.length).toFixed(1) : '0';
  const maxGap = gaps.length > 0 ? Math.max(...gaps) : 0;
  const minGap = gaps.length > 0 ? Math.min(...gaps) : 0;
  const currentGap = latestRound - lastAppeared;

  const yearlyFrequency: { year: string; count: number }[] = [];
  const yearMap = new Map<string, number>();
  for (const round of allData) {
    const year = round.drawDate.substring(0, 4);
    if (round.numbers.includes(num) || round.bonusNumber === num) {
      yearMap.set(year, (yearMap.get(year) || 0) + 1);
    }
  }
  const sortedEntries = Array.from(yearMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  for (const entry of sortedEntries) {
    yearlyFrequency.push({ year: entry[0], count: entry[1] });
  }

  const section = num <= 10 ? '1~10' : num <= 20 ? '11~20' : num <= 30 ? '21~30' : num <= 40 ? '31~40' : '41~45';
  const percentage = ((frequency / totalRounds) * 100).toFixed(1);

  const status = hotColdScore >= 20 ? '핫 번호 🔥' : hotColdScore <= -20 ? '콜드 번호 🧊' : '보통';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `로또 ${num}번 번호 분석`,
    description: `로또 6/45 번호 ${num}번의 역대 출현 빈도, 출현 간격, 최근 추세 분석 데이터입니다. 전체 추첨 회차에서의 통계와 핫/콜드 번호 판정, 동반 출현 번호 정보를 제공합니다. ${num}번은 전체 ${totalRounds}회 추첨 중 ${frequency}회 출현하여 출현율 ${percentage}%를 기록했으며, 현재 ${status}로 판정됩니다. 번호대 ${section} 구간에 속하며, 최근 출현 주기와 평균 간격 대비 현재 미출현 기간 분석, 동반 출현 빈도가 높은 번호 조합 정보를 포함합니다. 로또킹의 데이터는 동행복권 공식 추첨 결과를 기반으로 산출됩니다.`,
    url: `https://lotto.gon.ai.kr/lotto/number/${num}`,
    keywords: [`로또 ${num}번`, '로또 번호 분석', '로또 출현 빈도', '로또 통계'],
    creator: { '@type': 'Organization', name: '로또킹', url: 'https://lotto.gon.ai.kr' },
    license: 'https://creativecommons.org/licenses/by/4.0/',
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `로또 ${num}번은 몇 번 나왔나요?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `로또 ${num}번은 총 ${totalRounds}회 추첨 중 ${frequency}회 출현했습니다 (출현율 ${percentage}%).`,
        },
      },
      {
        '@type': 'Question',
        name: `로또 ${num}번은 핫 번호인가요?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `로또 ${num}번의 핫/콜드 점수는 ${hotColdScore}점으로, 현재 ${status}입니다.`,
        },
      },
      {
        '@type': 'Question',
        name: `로또 ${num}번과 같이 나오는 번호는?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `로또 ${num}번과 가장 자주 함께 출현한 번호는 ${topCompanions.map(c => `${c.number}번(${c.count}회)`).join(', ')}입니다.`,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Breadcrumb items={[
        { label: '홈', href: '/' },
        { label: '번호 분석', href: '/lotto/number/1' },
        { label: `${num}번` },
      ]} />

      <NumberAnalysisContent
        num={num}
        totalRounds={totalRounds}
        frequency={frequency}
        percentage={percentage}
        lastAppeared={lastAppeared}
        hotColdScore={hotColdScore}
        consecutiveCount={consecutiveCount}
        recentFrequency={recentFrequency}
        latestRound={latestRound}
        status={status}
        section={section}
        avgGap={avgGap}
        maxGap={maxGap}
        minGap={minGap}
        currentGap={currentGap}
        topCompanions={topCompanions}
        yearlyFrequency={yearlyFrequency}
      />
    </>
  );
}
