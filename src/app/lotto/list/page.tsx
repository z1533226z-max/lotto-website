import { Metadata } from 'next';
import Link from 'next/link';
import { REAL_LOTTO_DATA } from '@/data/realLottoData';
import { formatCurrency, formatDate } from '@/lib/utils';
import Breadcrumb from '@/components/layout/Breadcrumb';
import LottoNumbers from '@/components/lotto/LottoNumbers';

const ITEMS_PER_PAGE = 20;

export const metadata: Metadata = {
  title: '로또 당첨번호 전체 조회 - 역대 당첨번호 목록 | 로또킹',
  description: '로또 6/45 1회부터 최신 회차까지 역대 전체 당첨번호를 조회하세요. 회차별 당첨번호, 보너스번호, 1등 당첨금, 당첨자수 정보를 제공합니다.',
  openGraph: {
    title: '로또 당첨번호 전체 조회 | 로또킹',
    description: '역대 전체 로또 당첨번호 목록',
    url: 'https://lotto.gon.ai.kr/lotto/list',
  },
};

interface Props {
  searchParams: { page?: string };
}

export default function LottoListPage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page || '1') || 1);
  const sortedData = [...REAL_LOTTO_DATA].reverse(); // 최신순
  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageData = sortedData.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  return (
    <>
      <Breadcrumb items={[
        { label: '홈', href: '/' },
        { label: '당첨번호 전체 조회' },
      ]} />

      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
        로또 당첨번호 전체 조회
      </h1>
      <p className="text-gray-600 mb-6">
        1회부터 {REAL_LOTTO_DATA[REAL_LOTTO_DATA.length - 1]?.round}회까지 역대 전체 당첨번호
      </p>

      {/* 테이블 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">회차</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">추첨일</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">당첨번호</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600 hidden md:table-cell">1등 당첨금</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600 hidden md:table-cell">당첨자</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">상세</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageData.map((item) => (
                <tr key={item.round} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{item.round}회</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{item.drawDate}</td>
                  <td className="px-4 py-3">
                    <LottoNumbers numbers={item.numbers} bonusNumber={item.bonusNumber} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-right text-gray-800 hidden md:table-cell">
                    {formatCurrency(item.prizeMoney.first)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 hidden md:table-cell">
                    {item.prizeMoney.firstWinners}명
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/lotto/${item.round}`}
                      className="text-primary hover:underline text-xs"
                    >
                      보기
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
        {currentPage > 1 && (
          <Link
            href={`/lotto/list?page=${currentPage - 1}`}
            className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            이전
          </Link>
        )}

        {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
          let pageNum: number;
          if (totalPages <= 10) {
            pageNum = i + 1;
          } else if (currentPage <= 5) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 4) {
            pageNum = totalPages - 9 + i;
          } else {
            pageNum = currentPage - 4 + i;
          }
          return pageNum;
        }).map(pageNum => (
          <Link
            key={pageNum}
            href={`/lotto/list?page=${pageNum}`}
            className={`px-3 py-2 rounded-lg transition-colors ${
              pageNum === currentPage
                ? 'bg-primary text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {pageNum}
          </Link>
        ))}

        {currentPage < totalPages && (
          <Link
            href={`/lotto/list?page=${currentPage + 1}`}
            className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            다음
          </Link>
        )}
      </div>
    </>
  );
}
