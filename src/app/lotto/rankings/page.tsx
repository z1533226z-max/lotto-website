import { Metadata } from 'next';
import Link from 'next/link';
import { REAL_LOTTO_DATA } from '@/data/realLottoData';
import { formatCurrency } from '@/lib/utils';
import Breadcrumb from '@/components/layout/Breadcrumb';
import LottoNumbers from '@/components/lotto/LottoNumbers';

export const metadata: Metadata = {
  title: '역대 로또 최고 당첨금 순위 - 1등 당첨금 랭킹 | 로또킹',
  description: '로또 6/45 역대 최고 1등 당첨금 순위를 확인하세요. 1인당 최고 당첨금액, 당첨자수, 회차 정보를 제공합니다.',
  openGraph: {
    title: '역대 로또 최고 당첨금 순위 | 로또킹',
    url: 'https://lotto.gon.ai.kr/lotto/rankings',
  },
};

export default function LottoRankingsPage() {
  // 1인당 당첨금 기준 정렬 (총 당첨금 / 당첨자수)
  const rankings = [...REAL_LOTTO_DATA]
    .filter(d => d.prizeMoney.first > 0 && d.prizeMoney.firstWinners > 0)
    .map(d => ({
      ...d,
      perPerson: Math.floor(d.prizeMoney.first),
    }))
    .sort((a, b) => b.perPerson - a.perPerson)
    .slice(0, 50);

  return (
    <>
      <Breadcrumb items={[
        { label: '홈', href: '/' },
        { label: '역대 당첨금 순위' },
      ]} />

      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
        역대 로또 최고 당첨금 순위
      </h1>
      <p className="text-gray-600 mb-6">
        1등 1인당 당첨금 기준 TOP 50
      </p>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-center font-medium text-gray-600 w-12">순위</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">회차</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 hidden md:table-cell">추첨일</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 hidden lg:table-cell">당첨번호</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">1등 당첨금</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">당첨자</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rankings.map((item, idx) => (
                <tr key={item.round} className={`hover:bg-gray-50 transition-colors ${idx < 3 ? 'bg-yellow-50/50' : ''}`}>
                  <td className="px-4 py-3 text-center">
                    {idx < 3 ? (
                      <span className="text-lg">{['🥇', '🥈', '🥉'][idx]}</span>
                    ) : (
                      <span className="text-gray-500">{idx + 1}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/lotto/${item.round}`} className="text-primary hover:underline font-medium">
                      {item.round}회
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{item.drawDate}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <LottoNumbers numbers={item.numbers} bonusNumber={item.bonusNumber} size="xs" />
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-800">
                    {formatCurrency(item.perPerson)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {item.prizeMoney.firstWinners}명
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
