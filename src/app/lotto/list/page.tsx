import { Metadata } from 'next';
import Link from 'next/link';
import { getAllLottoData } from '@/lib/dataFetcher';
import { formatCurrency } from '@/lib/utils';
import Breadcrumb from '@/components/layout/Breadcrumb';
import LottoNumbers from '@/components/lotto/LottoNumbers';

const ITEMS_PER_PAGE = 20;

export const revalidate = 3600; // ISR: 1시간마다 재생성

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

export default async function LottoListPage({ searchParams }: Props) {
  const allData = await getAllLottoData();
  const page = Math.max(1, parseInt(searchParams.page || '1') || 1);
  const sortedData = [...allData].reverse(); // 최신순
  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageData = sortedData.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  const latestRound = allData[allData.length - 1]?.round;

  return (
    <>
      <Breadcrumb items={[
        { label: '홈', href: '/' },
        { label: '당첨번호 전체 조회' },
      ]} />

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
          로또 당첨번호 전체 조회
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          1회부터 {latestRound}회까지 역대 전체 당첨번호
        </p>
      </div>

      {/* Page info bar */}
      <div
        className="flex items-center justify-between flex-wrap gap-3 mb-6 px-4 py-3 rounded-xl"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', border: '1px solid var(--border)' }}
      >
        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          총 {sortedData.length}개 중 {startIdx + 1} - {Math.min(startIdx + ITEMS_PER_PAGE, sortedData.length)}
        </span>
        <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          페이지 {currentPage} / {totalPages}
        </span>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {pageData.map((item) => (
          <Link
            key={item.round}
            href={`/lotto/${item.round}`}
            className="block rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="space-y-3">
              {/* Round and date */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="text-lg font-bold group-hover:text-primary transition-colors"
                    style={{ color: 'var(--text)' }}
                  >
                    {item.round}회
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text-tertiary)' }}>
                    {item.drawDate}
                  </span>
                </div>
                <svg
                  className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--text-tertiary)' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Numbers */}
              <div className="py-1">
                <LottoNumbers numbers={item.numbers} bonusNumber={item.bonusNumber} size="sm" />
              </div>

              {/* Prize info */}
              <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border-light)' }}>
                <div>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>1등 당첨금</span>
                  <p className="text-sm font-bold text-primary">
                    {formatCurrency(item.prizeMoney.first)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>당첨자</span>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                    {item.prizeMoney.firstWinners}명
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 flex-wrap">
        {/* First page */}
        {currentPage > 3 && (
          <>
            <Link
              href="/lotto/list?page=1"
              className="px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              style={{ backgroundColor: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              1
            </Link>
            {currentPage > 4 && (
              <span className="px-1" style={{ color: 'var(--text-tertiary)' }}>...</span>
            )}
          </>
        )}

        {/* Previous */}
        {currentPage > 1 && (
          <Link
            href={`/lotto/list?page=${currentPage - 1}`}
            className="px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
            style={{ backgroundColor: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            ← 이전
          </Link>
        )}

        {/* Page numbers */}
        {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
          let pageNum: number;
          if (totalPages <= 7) {
            pageNum = i + 1;
          } else if (currentPage <= 4) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 3) {
            pageNum = totalPages - 6 + i;
          } else {
            pageNum = currentPage - 3 + i;
          }
          return pageNum;
        }).filter(p => p >= 1 && p <= totalPages).map(pageNum => (
          <Link
            key={pageNum}
            href={`/lotto/list?page=${pageNum}`}
            className="px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
            style={
              pageNum === currentPage
                ? {
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(211, 97, 53, 0.3)',
                  }
                : {
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                  }
            }
          >
            {pageNum}
          </Link>
        ))}

        {/* Next */}
        {currentPage < totalPages && (
          <Link
            href={`/lotto/list?page=${currentPage + 1}`}
            className="px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
            style={{ backgroundColor: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            다음 →
          </Link>
        )}

        {/* Last page */}
        {currentPage < totalPages - 2 && (
          <>
            {currentPage < totalPages - 3 && (
              <span className="px-1" style={{ color: 'var(--text-tertiary)' }}>...</span>
            )}
            <Link
              href={`/lotto/list?page=${totalPages}`}
              className="px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              style={{ backgroundColor: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              {totalPages}
            </Link>
          </>
        )}
      </div>
    </>
  );
}
