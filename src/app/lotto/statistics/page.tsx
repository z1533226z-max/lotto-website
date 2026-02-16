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
      <div className="animate-pulse space-y-4 p-6 bg-white rounded-xl">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-64 bg-gray-200 rounded" />
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

      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
        로또 번호 통계 분석
      </h1>
      <p className="text-gray-600 mb-6">
        역대 전체 회차 데이터를 기반으로 한 번호별 출현 빈도, 핫/콜드 번호, 패턴 분석
      </p>

      <AnalyticsDashboard />
    </>
  );
}
