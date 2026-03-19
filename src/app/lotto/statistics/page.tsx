import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { BarChart3, TrendingUp, Hash, BookOpen, Calendar } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '로또 번호 통계 분석 - 로또킹',
  description: '역대 전체 회차 데이터 기반 로또번호 출현 빈도, 핫/콜드 번호, 구간별 분포, 홀짝 패턴 등 종합 통계 분석.',
  openGraph: {
    title: '로또 번호 통계 분석 - 로또킹',
    description: '역대 전체 회차 데이터 기반 로또번호 종합 통계 분석',
  },
};

const AnalyticsDashboard = dynamic(
  () => import('@/components/analytics/AnalyticsDashboard'),
  {
    loading: () => (
      <div className="space-y-4">
        {/* Tab skeleton */}
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-10 rounded-xl animate-pulse"
              style={{
                backgroundColor: 'var(--surface-hover)',
                width: i === 0 ? '100px' : '80px',
              }}
            />
          ))}
        </div>
        {/* Content skeleton */}
        <div
          className="rounded-2xl p-8 animate-pulse"
          style={{ backgroundColor: 'var(--surface)' }}
        >
          <div className="h-8 rounded-lg w-48 mb-6" style={{ backgroundColor: 'var(--surface-hover)' }} />
          <div className="h-64 rounded-lg" style={{ backgroundColor: 'var(--surface-hover)' }} />
        </div>
      </div>
    ),
    ssr: false,
  }
);

export default function LottoStatisticsPage() {
  return (
    <>
      <Breadcrumb items={[
        { label: '홈', href: '/' },
        { label: '통계 분석' },
      ]} />

      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            }}
          >
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text)' }}>
            로또 번호 통계 분석
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>
          역대 전체 회차 데이터를 기반으로 한 번호별 출현 빈도, 핫/콜드 번호, 패턴 분석
        </p>
      </div>

      <AnalyticsDashboard />

      {/* 관련 분석 페이지 링크 */}
      <section className="mt-12">
        <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>
          더 깊이 분석하기
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/lotto/pattern/odd-even"
            className="group rounded-2xl p-5 transition-all hover:scale-[1.02]"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              <span className="font-semibold" style={{ color: 'var(--text)' }}>패턴 분석</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              홀짝, 고저, 연속번호, AC값 등 8가지 패턴 분석
            </p>
          </Link>

          <Link
            href="/lotto/number/1"
            className="group rounded-2xl p-5 transition-all hover:scale-[1.02]"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Hash className="w-5 h-5" style={{ color: 'var(--secondary)' }} />
              <span className="font-semibold" style={{ color: 'var(--text)' }}>번호별 분석</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              1~45번 각 번호의 출현 빈도, 동반 출현, 미출현 간격
            </p>
          </Link>

          <Link
            href="/lotto/dream"
            className="group rounded-2xl p-5 transition-all hover:scale-[1.02]"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-5 h-5" style={{ color: 'var(--accent, var(--primary))' }} />
              <span className="font-semibold" style={{ color: 'var(--text)' }}>꿈해몽 번호</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              꿈 키워드로 행운의 로또 번호 찾기
            </p>
          </Link>

          <Link
            href={`/lotto/year/${new Date().getFullYear()}`}
            className="group rounded-2xl p-5 transition-all hover:scale-[1.02]"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5" style={{ color: 'var(--warning, #f59e0b)' }} />
              <span className="font-semibold" style={{ color: 'var(--text)' }}>연도별 분석</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              연도별 당첨번호 트렌드와 변화 추이
            </p>
          </Link>
        </div>

        {/* 패턴 분석 전체 목록 */}
        <div className="mt-6 rounded-2xl p-5" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h3 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>패턴 분석 전체 보기</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { href: '/lotto/pattern/odd-even', label: '홀짝 비율' },
              { href: '/lotto/pattern/high-low', label: '고저 비율' },
              { href: '/lotto/pattern/sum-range', label: '합계 구간' },
              { href: '/lotto/pattern/consecutive', label: '연속번호' },
              { href: '/lotto/pattern/section', label: '구간별 분포' },
              { href: '/lotto/pattern/ending-number', label: '끝수 분석' },
              { href: '/lotto/pattern/gap', label: '번호 간격' },
              { href: '/lotto/pattern/ac-value', label: 'AC값 분석' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 rounded-lg text-sm transition-colors hover:opacity-80"
                style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text-secondary)' }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* 인기 번호 분석 바로가기 */}
        <div className="mt-4 rounded-2xl p-5" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h3 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>번호별 분석 바로가기</h3>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 45 }, (_, i) => i + 1).map((num) => (
              <Link
                key={num}
                href={`/lotto/number/${num}`}
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors hover:opacity-80"
                style={{
                  backgroundColor: num <= 10 ? '#fbbf24' : num <= 20 ? '#60a5fa' : num <= 30 ? '#f87171' : num <= 40 ? '#a78bfa' : '#34d399',
                  color: '#1a1a2e',
                }}
              >
                {num}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
