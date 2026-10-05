import { Metadata } from 'next';
import { getAllLottoData, getLatestRound } from '@/lib/dataFetcher';
import { formatCurrency, formatDate, formatDrawMonthDayKo } from '@/lib/utils';
import { DEFAULT_OG_IMAGES } from '@/lib/seo';
import LottoNumbers from '@/components/lotto/LottoNumbers';
import Breadcrumb from '@/components/layout/Breadcrumb';
import SectionFrame from '@/components/ui/SectionFrame';
import Card from '@/components/ui/Card';

export const revalidate = 3600; // ISR: 1시간마다 재생성

// 제목에 데이터상 최신 회차·추첨일을 넣는다 (매주 자동 갱신)
export async function generateMetadata(): Promise<Metadata> {
  const latest = getLatestRound(await getAllLottoData());
  const latestLabel = latest
    ? ` - 최신 ${latest.round}회(${formatDrawMonthDayKo(latest.drawDate)} 추첨)`
    : '';
  return {
    title: `최근 로또 당첨번호 10회${latestLabel} | 로또킹`,
    description: '로또 6/45 최근 10회차 당첨번호를 한눈에 확인하세요. 최신 당첨번호, 보너스번호, 1등 당첨금 정보를 제공합니다.',
    alternates: {
      canonical: '/lotto/recent',
    },
    openGraph: {
      title: `최근 로또 당첨번호${latestLabel} | 로또킹`,
      url: 'https://lotto.gon.ai.kr/lotto/recent',
      images: DEFAULT_OG_IMAGES,
    },
  };
}

export default async function LottoRecentPage() {
  const allData = await getAllLottoData();
  const recentData = [...allData].reverse().slice(0, 10);

  return (
    <>
      <Breadcrumb items={[
        { label: '홈', href: '/' },
        { label: '최근 당첨번호' },
      ]} />

      <SectionFrame
        eyebrow="최근 추첨"
        title="최근 로또 당첨번호"
        subtitle="최근 10회차 당첨번호를 한눈에 확인하세요"
        size="sm"
        animate={false}
        maxWidth="full"
        headingLevel={1}
        className="px-0"
      >
        <div />
      </SectionFrame>

      <div className="space-y-4">
        {recentData.map((item) => (
          <a key={item.round} href={`/lotto/${item.round}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[70px]">
                    <span className="text-lg font-bold text-gray-800">{item.round}회</span>
                    <p className="text-xs text-gray-500">{item.drawDate}</p>
                  </div>
                  <LottoNumbers numbers={item.numbers} bonusNumber={item.bonusNumber} size="sm" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">1등 당첨금</p>
                  <p className="font-bold text-primary">{formatCurrency(item.prizeMoney.first)}</p>
                  <p className="text-xs text-gray-500">{item.prizeMoney.firstWinners}명</p>
                </div>
              </div>
            </Card>
          </a>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-3 mt-8">
        <a
          href="/lotto/list"
          className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          전체 당첨번호 보기
        </a>
        <a
          href="/lotto/analysis/weekly"
          className="inline-block px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20"
        >
          주간 분석 보기
        </a>
        <a
          href="/lotto/statistics"
          className="inline-block px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20"
        >
          번호 통계
        </a>
      </div>
    </>
  );
}
