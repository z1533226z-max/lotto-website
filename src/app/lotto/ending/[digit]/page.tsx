import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllLottoData, getLatestRound } from '@/lib/dataFetcher';
import Breadcrumb from '@/components/layout/Breadcrumb';
import EndingDigitContent from './EndingDigitContent';

interface Props {
  params: { digit: string };
}

/** 끝수별 해당 번호 (1~45 범위) */
function getNumbersForDigit(digit: number): number[] {
  const nums: number[] = [];
  for (let n = digit === 0 ? 10 : digit; n <= 45; n += 10) {
    nums.push(n);
  }
  return nums;
}

/** 0~9 유효성 검증 */
function parseDigit(raw: string): number | null {
  const d = parseInt(raw, 10);
  if (isNaN(d) || d < 0 || d > 9 || String(d) !== raw) return null;
  return d;
}

export const revalidate = 3600;

export function generateStaticParams() {
  return Array.from({ length: 10 }, (_, i) => ({ digit: String(i) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const digit = parseDigit(params.digit);
  if (digit === null) return { title: '끝수 분석 | 로또킹' };

  const nums = getNumbersForDigit(digit);
  const allData = await getAllLottoData();
  const totalRounds = allData.length;

  let totalHits = 0;
  for (const r of allData) {
    for (const n of r.numbers) {
      if (n % 10 === digit) totalHits++;
    }
  }
  const avgPerRound = (totalHits / totalRounds).toFixed(2);

  const title = `로또 끝수 ${digit} 완벽 분석 - ${nums.join('·')}번 출현 통계 | 로또킹`;
  const description = `로또 6/45 끝수 ${digit}번(${nums.join(', ')}번)의 ${totalRounds}회 누적 출현 ${totalHits}회, 회당 평균 ${avgPerRound}개. 끝수별 출현 빈도, 최근 추세, 동반 끝수 조합을 분석합니다.`;

  return {
    title,
    description,
    alternates: { canonical: `/lotto/ending/${digit}` },
    openGraph: {
      title: `로또 끝수 ${digit} 통계 분석`,
      description,
      url: `https://lotto.gon.ai.kr/lotto/ending/${digit}`,
    },
  };
}

export default async function EndingDigitPage({ params }: Props) {
  const digit = parseDigit(params.digit);
  if (digit === null) notFound();

  const allData = await getAllLottoData();
  const latest = getLatestRound(allData);
  if (!latest) notFound();

  const totalRounds = allData.length;
  const latestRound = latest.round;
  const nums = getNumbersForDigit(digit);

  // ── 개별 번호 출현 횟수 ──
  const numberFreq: Record<number, number> = {};
  for (const n of nums) numberFreq[n] = 0;
  for (const r of allData) {
    for (const n of r.numbers) {
      if (n % 10 === digit) numberFreq[n]++;
    }
  }
  const totalHits = Object.values(numberFreq).reduce((a, b) => a + b, 0);

  // ── 최근 100회 출현 (추세 비교) ──
  const recent100 = allData.slice(-100);
  let recentHits = 0;
  for (const r of recent100) {
    for (const n of r.numbers) {
      if (n % 10 === digit) recentHits++;
    }
  }

  // ── 끝수별 전체 출현 횟수 (비교용) ──
  const allDigitHits: number[] = Array(10).fill(0);
  for (const r of allData) {
    for (const n of r.numbers) {
      allDigitHits[n % 10]++;
    }
  }
  const rank = allDigitHits
    .map((h, i) => ({ digit: i, hits: h }))
    .sort((a, b) => b.hits - a.hits)
    .findIndex(d => d.digit === digit) + 1;

  // ── 동반 끝수 분석 ──
  const companionDigitCounts: number[] = Array(10).fill(0);
  for (const r of allData) {
    const hasThisDigit = r.numbers.some(n => n % 10 === digit);
    if (hasThisDigit) {
      const otherDigits = Array.from(new Set(r.numbers.filter(n => n % 10 !== digit).map(n => n % 10)));
      for (const od of otherDigits) companionDigitCounts[od]++;
    }
  }
  const topCompanionDigits = companionDigitCounts
    .map((count, d) => ({ digit: d, count }))
    .filter(d => d.digit !== digit)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // ── 최근 20회 출현 회차 ──
  const recentRounds = allData
    .filter(r => r.numbers.some(n => n % 10 === digit))
    .sort((a, b) => b.round - a.round)
    .slice(0, 20)
    .map(r => ({
      round: r.round,
      date: r.drawDate,
      numbers: r.numbers,
      bonus: r.bonusNumber,
      digitNumbers: r.numbers.filter(n => n % 10 === digit),
    }));

  // ── 2개 이상 동시 출현 회차 비율 ──
  let multiHitRounds = 0;
  for (const r of allData) {
    if (r.numbers.filter(n => n % 10 === digit).length >= 2) multiHitRounds++;
  }

  // ── 출현 간격 통계 ──
  const hitRoundNums = allData
    .filter(r => r.numbers.some(n => n % 10 === digit))
    .map(r => r.round)
    .sort((a, b) => a - b);
  const gaps: number[] = [];
  for (let i = 1; i < hitRoundNums.length; i++) {
    gaps.push(hitRoundNums[i] - hitRoundNums[i - 1]);
  }
  const avgGap = gaps.length > 0
    ? (gaps.reduce((a, b) => a + b, 0) / gaps.length).toFixed(1)
    : '0';
  const maxGap = gaps.length > 0 ? Math.max(...gaps) : 0;

  const avgPerRound = (totalHits / totalRounds).toFixed(2);
  const recentAvg = (recentHits / Math.min(100, totalRounds)).toFixed(2);

  // ── JSON-LD: Dataset (server-generated trusted data only) ──
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `로또 끝수 ${digit} 출현 통계`,
    description: `로또 6/45 끝수 ${digit}(${nums.join(', ')}번)의 ${totalRounds}회 누적 통계. 총 출현 ${totalHits}회.`,
    url: `https://lotto.gon.ai.kr/lotto/ending/${digit}`,
    keywords: [`로또 끝수 ${digit}`, '로또 끝수 분석', '로또 끝수 통계'],
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
        name: `로또 끝수 ${digit}에 해당하는 번호는?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `로또 6/45에서 끝수 ${digit}에 해당하는 번호는 ${nums.join(', ')}번입니다 (총 ${nums.length}개).`,
        },
      },
      {
        '@type': 'Question',
        name: `로또 끝수 ${digit}은 얼마나 자주 나오나요?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${totalRounds}회 추첨 중 끝수 ${digit} 번호는 총 ${totalHits}회 출현하여 회당 평균 ${avgPerRound}개가 포함됩니다. 전체 10개 끝수 중 ${rank}위입니다.`,
        },
      },
      {
        '@type': 'Question',
        name: `끝수 ${digit}과 잘 어울리는 끝수는?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: topCompanionDigits.length > 0
            ? `끝수 ${digit}과 가장 자주 함께 출현하는 끝수는 ${topCompanionDigits[0].digit}(${topCompanionDigits[0].count}회), ${topCompanionDigits[1]?.digit ?? '-'}(${topCompanionDigits[1]?.count ?? 0}회) 순입니다.`
            : `분석할 데이터가 부족합니다.`,
        },
      },
    ],
  };

  const jsonLdScript = JSON.stringify(jsonLdData);
  const faqJsonLdScript = JSON.stringify(faqJsonLd);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLdScript }} />

      <Breadcrumb items={[
        { label: '홈', href: '/' },
        { label: '패턴 분석', href: '/lotto/pattern/ending-number' },
        { label: `끝수 ${digit} 분석` },
      ]} />

      <EndingDigitContent
        digit={digit}
        numbers={nums}
        totalRounds={totalRounds}
        latestRound={latestRound}
        numberFreq={numberFreq}
        totalHits={totalHits}
        avgPerRound={avgPerRound}
        recentHits={recentHits}
        recentAvg={recentAvg}
        rank={rank}
        allDigitHits={allDigitHits}
        topCompanionDigits={topCompanionDigits}
        recentRounds={recentRounds}
        multiHitRounds={multiHitRounds}
        avgGap={avgGap}
        maxGap={maxGap}
      />
    </>
  );
}
