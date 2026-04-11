import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllLottoData, getEstimatedLatestRound, getLatestRound } from '@/lib/dataFetcher';
import { formatCurrency } from '@/lib/utils';
import LottoRoundDetail from '@/components/lotto/LottoRoundDetail';
import Breadcrumb from '@/components/layout/Breadcrumb';

interface Props {
  params: { round: string };
}

export const revalidate = 3600; // ISR: 1시간마다 재생성
export const dynamicParams = true; // 빌드에 없는 회차도 동적 처리

export async function generateStaticParams() {
  const data = await getAllLottoData();
  return data.map(d => ({ round: String(d.round) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const round = parseInt(params.round);

  if (isNaN(round) || round < 1) {
    return { title: '로또 당첨번호 조회 | 로또킹' };
  }

  const allData = await getAllLottoData();
  const data = allData.find(d => d.round === round);

  if (!data) {
    return { title: `${round}회 로또 당첨번호 | 로또킹` };
  }

  const numbersStr = data.numbers.join(', ');
  const title = `${round}회 로또 당첨번호 - ${numbersStr} + ${data.bonusNumber} | 로또킹`;
  const description = `로또 6/45 ${round}회 당첨번호: ${numbersStr} + 보너스 ${data.bonusNumber}. ${data.drawDate} 추첨. 1등 당첨금 ${formatCurrency(data.prizeMoney.first)}, ${data.prizeMoney.firstWinners}명 당첨.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://lotto.gon.ai.kr/lotto/${round}`,
    },
    openGraph: {
      title: `로또 ${round}회 당첨번호`,
      description,
      url: `https://lotto.gon.ai.kr/lotto/${round}`,
    },
  };
}

export default async function LottoRoundPage({ params }: Props) {
  const round = parseInt(params.round);

  if (isNaN(round) || round < 1) {
    notFound();
  }

  const allData = await getAllLottoData();
  const data = allData.find(d => d.round === round);

  if (!data) {
    notFound();
  }

  const knownMaxRound = getLatestRound(allData)?.round ?? round;
  const maxRound = Math.max(knownMaxRound, getEstimatedLatestRound());

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `로또 6/45 ${round}회 당첨번호`,
    description: `${data.drawDate} 추첨된 로또 6/45 제${round}회 당첨번호는 ${data.numbers.join(', ')} + 보너스 ${data.bonusNumber}입니다. 1등부터 5등까지의 등위별 당첨금액 및 당첨자 수 정보를 포함한 공식 추첨 결과 데이터입니다. 동행복권에서 발표한 공식 데이터를 기반으로 하며, 당첨번호 조합 분석, 번호대별 분포, 연속번호 포함 여부, 홀짝 비율, 합계 범위 등 상세 통계 정보를 함께 제공합니다. 로또 6/45는 매주 토요일에 추첨되며, 본 데이터는 회차별 역대 당첨 기록 조회 및 번호 패턴 분석에 활용할 수 있습니다.`,
    datePublished: data.drawDate,
    creator: { '@type': 'Organization', name: '로또킹', url: 'https://lotto.gon.ai.kr' },
    license: 'https://creativecommons.org/licenses/by/4.0/',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb items={[
        { label: '홈', href: '/' },
        { label: '당첨번호', href: '/lotto/list' },
        { label: `${round}회` },
      ]} />
      <LottoRoundDetail data={data} maxRound={maxRound} />
    </>
  );
}
