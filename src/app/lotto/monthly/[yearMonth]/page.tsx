import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllLottoData } from '@/lib/dataFetcher';
import Breadcrumb from '@/components/layout/Breadcrumb';
import MonthlyArchiveContent from './MonthlyArchiveContent';

interface Props {
  params: { yearMonth: string };
}

export const revalidate = 3600;

const MONTH_NAMES = ['', '1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

function parseYearMonth(ym: string): { year: number; month: number } | null {
  const m = ym.match(/^(\d{4})-(\d{2})$/);
  if (!m) return null;
  const year = parseInt(m[1]);
  const month = parseInt(m[2]);
  if (year < 2002 || year > new Date().getFullYear() + 1 || month < 1 || month > 12) return null;
  return { year, month };
}

function ymPrefix(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export async function generateStaticParams() {
  const allData = await getAllLottoData();
  const monthSet = new Set<string>();
  for (const d of allData) {
    monthSet.add(d.drawDate.substring(0, 7));
  }
  return Array.from(monthSet).map(ym => ({ yearMonth: ym }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const parsed = parseYearMonth(params.yearMonth);
  if (!parsed) return { title: '월별 당첨번호 | 로또킹' };

  const { year, month } = parsed;
  const allData = await getAllLottoData();
  const prefix = ymPrefix(year, month);
  const monthData = allData.filter(r => r.drawDate.startsWith(prefix));

  if (monthData.length === 0) return { title: '월별 당첨번호 | 로또킹' };

  const roundCount = monthData.length;
  const title = `${year}년 ${month}월 로또 당첨번호 ${roundCount}회 전체 결과 조회 | 로또킹`;
  const description = `${year}년 ${month}월 로또 6/45 당첨번호를 한눈에! ${roundCount}회 추첨 결과, 이달의 최다 출현 번호, 1등 당첨금 추이를 확인하세요.`;

  return {
    title,
    description,
    alternates: { canonical: `/lotto/monthly/${params.yearMonth}` },
    openGraph: {
      title: `${year}년 ${month}월 로또 당첨번호 분석`,
      description,
      url: `https://lotto.gon.ai.kr/lotto/monthly/${params.yearMonth}`,
    },
  };
}

export default async function MonthlyArchivePage({ params }: Props) {
  const parsed = parseYearMonth(params.yearMonth);
  if (!parsed) notFound();

  const { year, month } = parsed;
  const allData = await getAllLottoData();
  const prefix = ymPrefix(year, month);
  const monthData = allData.filter(r => r.drawDate.startsWith(prefix));

  if (monthData.length === 0) notFound();

  // Number frequency (1~45)
  const numberFrequency: { number: number; count: number }[] = [];
  for (let i = 1; i <= 45; i++) {
    let count = 0;
    for (const round of monthData) {
      if (round.numbers.includes(i)) count++;
    }
    numberFrequency.push({ number: i, count });
  }

  // Prize stats
  const firstPrizes = monthData.filter(r => r.prizeMoney.first > 0).map(r => r.prizeMoney.first);
  const avgFirstPrize = firstPrizes.length > 0
    ? Math.round(firstPrizes.reduce((a, b) => a + b, 0) / firstPrizes.length)
    : 0;
  const maxFirstPrize = firstPrizes.length > 0 ? Math.max(...firstPrizes) : 0;
  const totalFirstWinners = monthData.reduce((sum, r) => sum + r.prizeMoney.firstWinners, 0);

  // Odd/even
  let oddCount = 0;
  let evenCount = 0;
  for (const round of monthData) {
    for (const n of round.numbers) {
      if (n % 2 === 1) oddCount++;
      else evenCount++;
    }
  }

  // Adjacent months for navigation
  const allMonths = new Set<string>();
  for (const d of allData) allMonths.add(d.drawDate.substring(0, 7));
  const sortedMonths = Array.from(allMonths).sort();
  const currentIdx = sortedMonths.indexOf(params.yearMonth);
  const prevMonth = currentIdx > 0 ? sortedMonths[currentIdx - 1] : null;
  const nextMonth = currentIdx < sortedMonths.length - 1 ? sortedMonths[currentIdx + 1] : null;

  // Serializable round data
  const rounds = monthData.map(r => ({
    round: r.round,
    drawDate: r.drawDate,
    numbers: r.numbers,
    bonusNumber: r.bonusNumber,
    firstPrize: r.prizeMoney.first,
    firstWinners: r.prizeMoney.firstWinners,
  }));

  const sortedFreq = [...numberFrequency].sort((a, b) => b.count - a.count);
  const top3 = sortedFreq.filter(x => x.count > 0).slice(0, 3);

  // JSON-LD: Dataset (server-generated from trusted lotto draw data, not user input)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${year}년 ${month}월 로또 당첨번호`,
    description: `${year}년 ${month}월 로또 6/45 추첨 결과 ${monthData.length}회분. 당첨번호, 1등 당첨금, 번호 출현 빈도 등 월별 종합 통계를 제공합니다. 동행복권 공식 추첨 결과 기반.`,
    url: `https://lotto.gon.ai.kr/lotto/monthly/${params.yearMonth}`,
    temporalCoverage: `${year}-${String(month).padStart(2, '0')}`,
    keywords: [`${year}년 ${month}월 로또`, '로또 당첨번호', '월별 로또 통계', `${year}년 로또`],
    creator: { '@type': 'Organization', name: '로또킹', url: 'https://lotto.gon.ai.kr' },
    license: 'https://creativecommons.org/licenses/by/4.0/',
  };

  // JSON-LD: FAQPage (server-generated from trusted lotto draw data, not user input)
  const lastRound = rounds[rounds.length - 1];
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `${year}년 ${month}월 로또 당첨번호는?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${year}년 ${month}월에는 총 ${monthData.length}회 추첨이 있었습니다.${lastRound ? ` 마지막 ${lastRound.round}회차 당첨번호: ${lastRound.numbers.join(', ')}+${lastRound.bonusNumber}` : ''}`,
        },
      },
      {
        '@type': 'Question',
        name: `${year}년 ${month}월 가장 많이 나온 로또 번호는?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${year}년 ${month}월 가장 많이 출현한 번호는 ${top3.map(t => `${t.number}번(${t.count}회)`).join(', ')}입니다.`,
        },
      },
      ...(avgFirstPrize > 0 ? [{
        '@type': 'Question',
        name: `${year}년 ${month}월 로또 1등 당첨금은 얼마였나요?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${year}년 ${month}월 1등 평균 당첨금은 약 ${(avgFirstPrize / 100000000).toFixed(1)}억원이며, 총 ${totalFirstWinners}명이 당첨되었습니다.`,
        },
      }] : []),
    ],
  };

  // All JSON-LD values are derived from server-side lotto data (numbers, dates, prizes)
  // which is fetched from the trusted data source — no user input is involved
  const jsonLdHtml = JSON.stringify(jsonLd);
  const faqJsonLdHtml = JSON.stringify(faqJsonLd);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLdHtml }} />

      <Breadcrumb items={[
        { label: '홈', href: '/' },
        { label: `${year}년 분석`, href: `/lotto/year/${year}` },
        { label: `${MONTH_NAMES[month]}` },
      ]} />

      <MonthlyArchiveContent
        year={year}
        month={month}
        roundCount={monthData.length}
        rounds={rounds}
        numberFrequency={numberFrequency}
        avgFirstPrize={avgFirstPrize}
        maxFirstPrize={maxFirstPrize}
        totalFirstWinners={totalFirstWinners}
        oddCount={oddCount}
        evenCount={evenCount}
        prevMonth={prevMonth}
        nextMonth={nextMonth}
      />
    </>
  );
}
