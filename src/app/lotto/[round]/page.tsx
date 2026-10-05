import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllLottoData, getEstimatedLatestRound, getLatestRound } from '@/lib/dataFetcher';
import { formatCurrency, formatDrawDateKo } from '@/lib/utils';
import LottoRoundDetail from '@/components/lotto/LottoRoundDetail';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { DEFAULT_OG_IMAGES } from '@/lib/seo';

interface Props {
  params: { round: string };
}

export const revalidate = 3600; // ISR: 1시간마다 재생성
export const dynamicParams = true; // 빌드에 없는 회차도 동적 처리

export async function generateStaticParams() {
  const data = await getAllLottoData();
  return data.map(d => ({ round: String(d.round) }));
}

/**
 * URL 회차 파라미터 검증: 앞자리 0·문자·소수 없는 양의 정수만 허용하고,
 * 아직 추첨하지 않은 회차(KST 토요일 20:35 기준)는 null → notFound()로 실제 404를 낸다.
 * (예: /lotto/012, /lotto/12abc 가 parseInt로 12회 페이지를 중복 노출하던 문제 포함)
 */
function parseRoundParam(raw: string): number | null {
  if (!/^[1-9]\d{0,4}$/.test(raw)) return null;
  const round = Number(raw);
  if (round > getEstimatedLatestRound()) return null;
  return round;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const round = parseRoundParam(params.round);

  if (round === null) {
    return { title: '로또 당첨번호 조회 | 로또킹' };
  }

  const allData = await getAllLottoData();
  const data = allData.find(d => d.round === round);

  if (!data) {
    return { title: `${round}회 로또 당첨번호 | 로또킹` };
  }

  const numbersStr = data.numbers.join(', ');
  const drawDateKo = formatDrawDateKo(data.drawDate);
  const title = `로또 ${round}회 당첨번호 (${drawDateKo} 추첨) · 당첨금 | 로또킹`;
  const description = `로또 ${round}회 당첨번호 ${numbersStr}+${data.bonusNumber} (${drawDateKo} 추첨). 1등 ${formatCurrency(data.prizeMoney.first)} · ${data.prizeMoney.firstWinners}명 당첨. 홀짝 비율·번호 합계·고저·연속수 등 당첨번호 패턴 분석을 한눈에 확인하세요.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://lotto.gon.ai.kr/lotto/${round}`,
    },
    openGraph: {
      title: `로또 ${round}회 당첨번호 (${drawDateKo} 추첨)`,
      description,
      url: `https://lotto.gon.ai.kr/lotto/${round}`,
      images: DEFAULT_OG_IMAGES,
    },
  };
}

export default async function LottoRoundPage({ params }: Props) {
  const round = parseRoundParam(params.round);

  if (round === null) {
    notFound();
  }

  const allData = await getAllLottoData();
  const data = allData.find(d => d.round === round);

  if (!data) {
    notFound();
  }

  // '다음 회차' 링크는 실제 데이터가 있는 회차까지만 (추첨 전·데이터 반영 전 회차로 가는 404 링크 방지)
  const maxRound = getLatestRound(allData)?.round ?? round;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `로또 6/45 ${round}회 당첨번호`,
    description: `${formatDrawDateKo(data.drawDate)} 추첨된 로또 6/45 제${round}회 당첨번호는 ${data.numbers.join(', ')} + 보너스 ${data.bonusNumber}입니다. 1등·2등 당첨금액 및 당첨자 수 정보를 포함한 공식 추첨 결과 데이터입니다. 동행복권에서 발표한 공식 데이터를 기반으로 하며, 당첨번호 조합 분석, 번호대별 분포, 연속번호 포함 여부, 홀짝 비율, 합계 범위 등 상세 통계 정보를 함께 제공합니다. 로또 6/45는 매주 토요일에 추첨되며, 본 데이터는 회차별 역대 당첨 기록 조회 및 번호 패턴 분석에 활용할 수 있습니다.`,
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
