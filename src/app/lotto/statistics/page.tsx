'use client';

import React from 'react';
import Breadcrumb from '@/components/layout/Breadcrumb';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

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
