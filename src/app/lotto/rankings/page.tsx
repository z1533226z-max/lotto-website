import { Metadata } from 'next';
import Link from 'next/link';
import { getAllLottoData } from '@/lib/dataFetcher';
import { formatCurrency } from '@/lib/utils';
import Breadcrumb from '@/components/layout/Breadcrumb';
import SectionFrame from '@/components/ui/SectionFrame';
import LottoNumbers from '@/components/lotto/LottoNumbers';

export const revalidate = 3600; // ISR: 1시간마다 재생성

export const metadata: Metadata = {
  title: '역대 로또 최고 당첨금 순위 - 1등 당첨금 랭킹 | 로또킹',
  description: '로또 6/45 역대 최고 1등 당첨금 순위를 확인하세요. 1인당 최고 당첨금액, 당첨자수, 회차 정보를 제공합니다.',
  openGraph: {
    title: '역대 로또 최고 당첨금 순위 | 로또킹',
    url: 'https://lotto.gon.ai.kr/lotto/rankings',
  },
};

const rankMedals = ['🥇', '🥈', '🥉'];

export default async function LottoRankingsPage() {
  const allData = await getAllLottoData();
  const maxPrize = Math.max(
    ...allData.filter(d => d.prizeMoney.first > 0 && d.prizeMoney.firstWinners > 0).map(d => d.prizeMoney.first)
  );
  const rankings = [...allData]
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

      <SectionFrame
        eyebrow="당첨금 순위"
        title="역대 로또 최고 당첨금 순위"
        subtitle="1등 1인당 당첨금 기준 TOP 50"
        size="sm"
        animate={false}
        maxWidth="full"
        headingLevel={1}
        className="px-0"
      >
        <div />
      </SectionFrame>

      {/* Top 3 podium cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {rankings.slice(0, 3).map((item, idx) => (
          <div
            key={item.round}
            className="relative rounded-2xl p-6 border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: idx === 0 ? '#FBBF24' : idx === 1 ? '#9CA3AF' : '#D97706',
              borderWidth: '2px',
            }}
          >
            {/* Rank decoration */}
            <div className="absolute top-3 right-3 text-3xl opacity-80">
              {rankMedals[idx]}
            </div>

            <div className="space-y-3">
              <div>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: idx === 0 ? 'rgba(251, 191, 36, 0.15)' : idx === 1 ? 'rgba(156, 163, 175, 0.15)' : 'rgba(217, 119, 6, 0.15)',
                    color: idx === 0 ? '#B45309' : idx === 1 ? '#6B7280' : '#92400E',
                  }}
                >
                  {idx + 1}위
                </span>
              </div>
              <Link
                href={`/lotto/${item.round}`}
                className="text-lg font-bold hover:text-primary transition-colors block"
                style={{ color: 'var(--text)' }}
              >
                {item.round}회
              </Link>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{item.drawDate}</p>
              <div className="py-2">
                <LottoNumbers numbers={item.numbers} bonusNumber={item.bonusNumber} size="xs" />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>1등 당첨금</p>
                <p className="text-xl font-black text-primary">{formatCurrency(item.perPerson)}</p>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                당첨자 {item.prizeMoney.firstWinners}명
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Rankings table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--surface-hover)' }}>
                <th className="px-4 py-3.5 text-center font-semibold w-16" style={{ color: 'var(--text-secondary)' }}>
                  순위
                </th>
                <th className="px-4 py-3.5 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  회차
                </th>
                <th className="px-4 py-3.5 text-left font-semibold hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>
                  추첨일
                </th>
                <th className="px-4 py-3.5 text-left font-semibold hidden lg:table-cell" style={{ color: 'var(--text-secondary)' }}>
                  당첨번호
                </th>
                <th className="px-4 py-3.5 text-right font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  1등 당첨금
                </th>
                <th className="px-4 py-3.5 text-right font-semibold hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>
                  당첨자
                </th>
              </tr>
            </thead>
            <tbody>
              {rankings.slice(3).map((item, idx) => {
                const rank = idx + 4;
                const barWidth = maxPrize > 0 ? (item.perPerson / maxPrize) * 100 : 0;

                return (
                  <tr
                    key={item.round}
                    className="transition-colors duration-200 border-t"
                    style={{
                      borderColor: 'var(--border-light)',
                    }}
                  >
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: 'var(--surface-hover)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {rank}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/lotto/${item.round}`}
                        className="text-primary hover:underline font-semibold"
                      >
                        {item.round}회
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>
                      {item.drawDate}
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <LottoNumbers numbers={item.numbers} bonusNumber={item.bonusNumber} size="xs" />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="space-y-1">
                        <span className="font-bold" style={{ color: 'var(--text)' }}>
                          {formatCurrency(item.perPerson)}
                        </span>
                        {/* Progress bar */}
                        <div
                          className="h-1 rounded-full w-full max-w-[120px] ml-auto"
                          style={{ backgroundColor: 'var(--surface-hover)' }}
                        >
                          <div
                            className="h-1 rounded-full transition-all duration-500"
                            style={{
                              width: `${barWidth}%`,
                              background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>
                      {item.prizeMoney.firstWinners}명
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
