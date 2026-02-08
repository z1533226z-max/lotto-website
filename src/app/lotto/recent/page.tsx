import { Metadata } from 'next';
import Link from 'next/link';
import { REAL_LOTTO_DATA } from '@/data/realLottoData';
import { formatCurrency, formatDate } from '@/lib/utils';
import LottoNumbers from '@/components/lotto/LottoNumbers';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Card from '@/components/ui/Card';

export const metadata: Metadata = {
  title: '최근 로또 당첨번호 - 최근 10회 추첨 결과 | 로또킹',
  description: '로또 6/45 최근 10회차 당첨번호를 한눈에 확인하세요. 최신 당첨번호, 보너스번호, 1등 당첨금 정보를 제공합니다.',
  openGraph: {
    title: '최근 로또 당첨번호 | 로또킹',
    url: 'https://lotto.gon.ai.kr/lotto/recent',
  },
};

export default function LottoRecentPage() {
  const recentData = [...REAL_LOTTO_DATA].reverse().slice(0, 10);

  return (
    <>
      <Breadcrumb items={[
        { label: '홈', href: '/' },
        { label: '최근 당첨번호' },
      ]} />

      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
        최근 로또 당첨번호
      </h1>

      <div className="space-y-4">
        {recentData.map((item) => (
          <Link key={item.round} href={`/lotto/${item.round}`}>
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
          </Link>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link
          href="/lotto/list"
          className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          전체 당첨번호 보기
        </Link>
      </div>
    </>
  );
}
