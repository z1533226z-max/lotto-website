import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { REAL_LOTTO_DATA } from '@/data/realLottoData';
import Breadcrumb from '@/components/layout/Breadcrumb';
import YearAnalysisContent from './YearAnalysisContent';

interface Props {
  params: { year: string };
}

export const revalidate = 3600;

const START_YEAR = 2002;
const CURRENT_YEAR = new Date().getFullYear();

export function generateStaticParams() {
  const years: { year: string }[] = [];
  for (let y = START_YEAR; y <= CURRENT_YEAR; y++) {
    years.push({ year: String(y) });
  }
  return years;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const year = parseInt(params.year);
  if (isNaN(year) || year < START_YEAR || year > CURRENT_YEAR) {
    return { title: '연도별 분석 | 로또킹' };
  }

  const yearData = REAL_LOTTO_DATA.filter(r => r.drawDate.startsWith(String(year)));
  const roundCount = yearData.length;

  const title = `${year}년 로또 당첨번호 분석 - 총 ${roundCount}회 추첨 | 로또킹`;
  const description = `${year}년 로또 6/45 당첨번호 전체 분석. ${roundCount}회 추첨 데이터로 가장 많이 나온 번호, 당첨금 통계, 번호 패턴을 확인하세요.`;

  return {
    title,
    description,
    openGraph: {
      title: `${year}년 로또 당첨번호 분석`,
      description,
      url: `https://lotto.gon.ai.kr/lotto/year/${year}`,
    },
  };
}

export default function YearAnalysisPage({ params }: Props) {
  const year = parseInt(params.year);
  if (isNaN(year) || year < START_YEAR || year > CURRENT_YEAR) {
    notFound();
  }

  const yearData = REAL_LOTTO_DATA.filter(r => r.drawDate.startsWith(String(year)));
  if (yearData.length === 0) {
    notFound();
  }

  // 번호별 출현 횟수
  const numberFrequency: Record<number, number> = {};
  for (let i = 1; i <= 45; i++) numberFrequency[i] = 0;
  for (const round of yearData) {
    for (const n of round.numbers) {
      numberFrequency[n]++;
    }
    numberFrequency[round.bonusNumber]++;
  }

  const sortedByFreq = Object.entries(numberFrequency)
    .map(([n, count]) => ({ number: Number(n), count }))
    .sort((a, b) => b.count - a.count);

  const top10 = sortedByFreq.slice(0, 10);
  const bottom10 = sortedByFreq.slice(-10).reverse();

  // 당첨금 통계
  const firstPrizes = yearData.filter(r => r.prizeMoney.first > 0).map(r => r.prizeMoney.first);
  const avgFirstPrize = firstPrizes.length > 0
    ? Math.round(firstPrizes.reduce((a, b) => a + b, 0) / firstPrizes.length)
    : 0;
  const maxFirstPrize = firstPrizes.length > 0 ? Math.max(...firstPrizes) : 0;
  const totalFirstWinners = yearData.reduce((sum, r) => sum + r.prizeMoney.firstWinners, 0);

  // 홀짝 비율
  let oddCount = 0;
  let evenCount = 0;
  for (const round of yearData) {
    for (const n of round.numbers) {
      if (n % 2 === 1) oddCount++;
      else evenCount++;
    }
  }

  // 구간별 분포
  const sections = [0, 0, 0, 0, 0]; // 1-10, 11-20, 21-30, 31-40, 41-45
  for (const round of yearData) {
    for (const n of round.numbers) {
      if (n <= 10) sections[0]++;
      else if (n <= 20) sections[1]++;
      else if (n <= 30) sections[2]++;
      else if (n <= 40) sections[3]++;
      else sections[4]++;
    }
  }

  // 회차 범위
  const firstRound = yearData[0].round;
  const lastRound = yearData[yearData.length - 1].round;

  // 모든 연도 목록
  const allYears: number[] = [];
  for (let y = START_YEAR; y <= CURRENT_YEAR; y++) {
    allYears.push(y);
  }

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${year}년 로또 당첨번호 분석`,
    description: `${year}년 로또 6/45 당첨번호 데이터 및 통계 분석`,
    url: `https://lotto.gon.ai.kr/lotto/year/${year}`,
    temporalCoverage: `${year}`,
    keywords: [`${year}년 로또`, '로또 당첨번호', '로또 통계', '연도별 분석'],
    creator: { '@type': 'Organization', name: '로또킹' },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `${year}년 로또에서 가장 많이 나온 번호는?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${year}년 로또에서 가장 많이 출현한 번호는 ${top10.slice(0, 3).map(t => `${t.number}번(${t.count}회)`).join(', ')}입니다.`,
        },
      },
      {
        '@type': 'Question',
        name: `${year}년 로또 1등 당첨금 평균은?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${year}년 로또 1등 평균 당첨금은 ${(avgFirstPrize / 100000000).toFixed(1)}억원이며, 총 ${totalFirstWinners}명이 1등에 당첨되었습니다.`,
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
        { label: '연도별 분석', href: `/lotto/year/${CURRENT_YEAR}` },
        { label: `${year}년` },
      ]} />

      <YearAnalysisContent
        year={year}
        roundCount={yearData.length}
        firstRound={firstRound}
        lastRound={lastRound}
        top10={top10}
        bottom10={bottom10}
        avgFirstPrize={avgFirstPrize}
        maxFirstPrize={maxFirstPrize}
        totalFirstWinners={totalFirstWinners}
        oddCount={oddCount}
        evenCount={evenCount}
        sections={sections}
        allYears={allYears}
        yearData={yearData.map(r => ({
          round: r.round,
          drawDate: r.drawDate,
          numbers: r.numbers,
          bonusNumber: r.bonusNumber,
          firstPrize: r.prizeMoney.first,
          firstWinners: r.prizeMoney.firstWinners,
        }))}
      />
    </>
  );
}
