import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllLottoData, getLatestRound } from '@/lib/dataFetcher';
import Breadcrumb from '@/components/layout/Breadcrumb';
import BonusNumberContent from './BonusNumberContent';

interface Props {
  params: { number: string };
}

export const revalidate = 3600;

export function generateStaticParams() {
  return Array.from({ length: 45 }, (_, i) => ({ number: String(i + 1) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const num = parseInt(params.number);
  if (isNaN(num) || num < 1 || num > 45) {
    return { title: '보너스번호 분석 | 로또킹' };
  }

  const allData = await getAllLottoData();
  const totalRounds = allData.length;
  const frequency = allData.filter(d => d.bonusNumber === num).length;
  const pct = ((frequency / totalRounds) * 100).toFixed(1);

  const title = `로또 보너스번호 ${num}번 분석 - ${frequency}회 출현(${pct}%) | 로또킹`;
  const description = `로또 6/45 보너스번호 ${num}번 완전 분석. ${totalRounds}회 중 보너스로 ${frequency}회 출현(${pct}%). 출현 간격, 최근 추세, 동반 당첨번호, 본번호 비교까지 한눈에 확인하세요.`;

  return {
    title,
    description,
    alternates: { canonical: `/lotto/bonus/${num}` },
    openGraph: {
      title: `로또 보너스번호 ${num}번 통계 분석`,
      description,
      url: `https://lotto.gon.ai.kr/lotto/bonus/${num}`,
    },
  };
}

export default async function BonusNumberPage({ params }: Props) {
  const num = parseInt(params.number);
  if (isNaN(num) || num < 1 || num > 45) notFound();

  const allData = await getAllLottoData();
  const latest = getLatestRound(allData);
  if (!latest) notFound();

  const totalRounds = allData.length;
  const latestRound = latest.round;

  // ── 보너스번호 출현 빈도 ──
  const frequency = allData.filter(d => d.bonusNumber === num).length;

  // ── 본번호 출현 빈도 (비교용) ──
  const mainFrequency = allData.filter(d => d.numbers.includes(num)).length;

  // ── 최근 100회 보너스 출현 ──
  const recent100 = allData.slice(-100);
  const recentHits = recent100.filter(d => d.bonusNumber === num).length;

  // ── 출현 간격 통계 ──
  const hitRounds = allData
    .filter(d => d.bonusNumber === num)
    .map(d => d.round)
    .sort((a, b) => a - b);
  const gaps: number[] = [];
  for (let i = 1; i < hitRounds.length; i++) {
    gaps.push(hitRounds[i] - hitRounds[i - 1]);
  }
  const avgGap = gaps.length > 0
    ? (gaps.reduce((a, b) => a + b, 0) / gaps.length).toFixed(1)
    : '0';
  const maxGap = gaps.length > 0 ? Math.max(...gaps) : 0;
  const currentGap = hitRounds.length > 0 ? latestRound - hitRounds[hitRounds.length - 1] : totalRounds;

  // ── 보너스 순위 (45개 번호 중) ──
  const allBonusFreq: { number: number; freq: number }[] = [];
  for (let n = 1; n <= 45; n++) {
    allBonusFreq.push({ number: n, freq: allData.filter(d => d.bonusNumber === n).length });
  }
  allBonusFreq.sort((a, b) => b.freq - a.freq);
  const rank = allBonusFreq.findIndex(item => item.number === num) + 1;

  // ── 동반 본번호 TOP 5 ──
  const companionCounts: Record<number, number> = {};
  for (const d of allData) {
    if (d.bonusNumber === num) {
      for (const n of d.numbers) {
        companionCounts[n] = (companionCounts[n] || 0) + 1;
      }
    }
  }
  const topCompanionNumbers = Object.entries(companionCounts)
    .map(([n, count]) => ({ number: parseInt(n), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // ── 최근 보너스 출현 회차 (20개) ──
  const recentRounds = allData
    .filter(d => d.bonusNumber === num)
    .sort((a, b) => b.round - a.round)
    .slice(0, 20)
    .map(r => ({
      round: r.round,
      date: r.drawDate,
      numbers: r.numbers,
      bonus: r.bonusNumber,
    }));

  // ── JSON-LD: Dataset (server-generated trusted data only) ──
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `로또 보너스번호 ${num}번 출현 통계`,
    description: `로또 6/45 보너스번호 ${num}번의 ${totalRounds}회 누적 통계. 보너스 출현 ${frequency}회.`,
    url: `https://lotto.gon.ai.kr/lotto/bonus/${num}`,
    keywords: [`로또 보너스번호 ${num}`, '로또 보너스 분석', '로또 보너스 통계', `보너스 ${num}번`],
    creator: { '@type': 'Organization', name: '로또킹', url: 'https://lotto.gon.ai.kr' },
    license: 'https://creativecommons.org/licenses/by/4.0/',
  };

  // ── JSON-LD: FAQPage (server-generated trusted data only) ──
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `로또 보너스번호 ${num}번은 몇 번 나왔나요?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `로또 6/45에서 ${num}번은 보너스번호로 총 ${frequency}회 출현했습니다. 전체 ${totalRounds}회 추첨 중 ${((frequency / totalRounds) * 100).toFixed(1)}%의 비율입니다.`,
        },
      },
      {
        '@type': 'Question',
        name: `${num}번이 보너스번호일 때 자주 나오는 본번호는?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: topCompanionNumbers.length > 0
            ? `${num}번이 보너스번호일 때 가장 자주 함께 나온 본번호는 ${topCompanionNumbers[0].number}번(${topCompanionNumbers[0].count}회)${topCompanionNumbers[1] ? `, ${topCompanionNumbers[1].number}번(${topCompanionNumbers[1].count}회)` : ''} 순입니다.`
            : '분석할 데이터가 부족합니다.',
        },
      },
      {
        '@type': 'Question',
        name: `로또 ${num}번은 본번호와 보너스 중 어디서 더 자주 나오나요?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${num}번은 본번호로 ${mainFrequency}회, 보너스번호로 ${frequency}회 출현했습니다. ${mainFrequency > frequency ? '본번호' : mainFrequency < frequency ? '보너스번호' : '동일한 비율'}로 더 자주 나옵니다.`,
        },
      },
    ],
  };

  // Server-generated trusted JSON-LD (same pattern as ending/[digit]/page.tsx)
  const jsonLdScript = JSON.stringify(jsonLdData);
  const faqJsonLdScript = JSON.stringify(faqJsonLd);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLdScript }} />

      <Breadcrumb items={[
        { label: '홈', href: '/' },
        { label: '번호 분석', href: '/lotto/statistics' },
        { label: `보너스 ${num}번 분석` },
      ]} />

      <BonusNumberContent
        num={num}
        totalRounds={totalRounds}
        latestRound={latestRound}
        frequency={frequency}
        mainFrequency={mainFrequency}
        recentHits={recentHits}
        avgGap={avgGap}
        maxGap={maxGap}
        currentGap={currentGap}
        rank={rank}
        topCompanionNumbers={topCompanionNumbers}
        recentRounds={recentRounds}
        allBonusFreq={allBonusFreq}
      />
    </>
  );
}
