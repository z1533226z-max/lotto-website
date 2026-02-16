import React from 'react';
import dynamic from 'next/dynamic';
import Breadcrumb from '@/components/layout/Breadcrumb';
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
            <span className="text-lg">📊</span>
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
    </>
  );
}
