import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { REAL_LOTTO_DATA } from '@/data/realLottoData';
import { fetchRound } from '@/lib/dataFetcher';
import { formatCurrency, formatDate } from '@/lib/utils';
import LottoRoundDetail from '@/components/lotto/LottoRoundDetail';
import Breadcrumb from '@/components/layout/Breadcrumb';

interface Props {
  params: { round: string };
}

export const revalidate = 3600; // ISR: 1시간마다 재생성
export const dynamicParams = true; // 빌드에 없는 회차도 동적 처리

export async function generateStaticParams() {
  return REAL_LOTTO_DATA.map(d => ({ round: String(d.round) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const round = parseInt(params.round);
  const result = await fetchRound(round);
  const data = result?.data;

  if (!data) {
    return { title: `${round}회 로또 당첨번호 | 로또킹` };
  }

  const numbersStr = data.numbers.join(', ');
  const title = `${round}회 로또 당첨번호 - ${numbersStr} + ${data.bonusNumber} | 로또킹`;
  const description = `로또 6/45 ${round}회 당첨번호: ${numbersStr} + 보너스 ${data.bonusNumber}. ${data.drawDate} 추첨. 1등 당첨금 ${formatCurrency(data.prizeMoney.first)}, ${data.prizeMoney.firstWinners}명 당첨.`;

  return {
    title,
    description,
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

  const result = await fetchRound(round);

  if (!result) {
    notFound();
  }

  const { data } = result;
  const maxRound = REAL_LOTTO_DATA.length > 0
    ? REAL_LOTTO_DATA[REAL_LOTTO_DATA.length - 1].round
    : round;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `로또 6/45 ${round}회 당첨번호`,
    description: `${data.drawDate} 추첨 로또 ${round}회 당첨번호 ${data.numbers.join(', ')} + ${data.bonusNumber}`,
    datePublished: data.drawDate,
    publisher: { '@type': 'Organization', name: '로또킹' },
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
