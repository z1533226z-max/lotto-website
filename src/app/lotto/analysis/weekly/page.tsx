import React from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/layout/Breadcrumb';
import SectionFrame from '@/components/ui/SectionFrame';
import { BarChart3, TrendingUp, Flame, Snowflake, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { getAllLottoData } from '@/lib/dataFetcher';
import { generateWeeklyAnalysis } from '@/lib/weeklyAnalysisGenerator';

export const metadata: Metadata = {
  title: '주간 로또 분석 - 매주 업데이트 | 로또킹',
  description: '매주 자동 업데이트되는 로또 당첨번호 심층 분석. 핫넘버, 콜드넘버, 홀짝비, 연속번호 패턴, 구간 분포까지. AI 데이터 기반 주간 트렌드 분석!',
  openGraph: {
    title: '주간 로또 분석 - 매주 업데이트 | 로또킹',
    description: '매주 자동 업데이트되는 로또 당첨번호 심층 분석. 핫넘버, 콜드넘버, 패턴 분석!',
  },
};

// ISR: 1시간마다 재생성
export const revalidate = 3600;

function LottoBall({ number, size = 'md' }: { number: number; size?: 'sm' | 'md' }) {
  const getColor = (n: number) => {
    if (n <= 10) return 'var(--lotto-yellow, #FDB813)';
    if (n <= 20) return 'var(--lotto-blue, #69C8F2)';
    if (n <= 30) return 'var(--lotto-red, #FF7272)';
    if (n <= 40) return 'var(--lotto-gray, #AAAAAA)';
    return 'var(--lotto-green, #B0D840)';
  };
  const dim = size === 'sm' ? '32px' : '42px';
  const fontSize = size === 'sm' ? '13px' : '16px';

  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: dim, height: dim, borderRadius: '50%',
        background: getColor(number), color: '#fff', fontWeight: 700,
        fontSize, textShadow: '0 1px 2px rgba(0,0,0,0.3)',
      }}
    >
      {number}
    </span>
  );
}

export default async function WeeklyAnalysisPage() {
  const allData = await getAllLottoData();
  const analysis = generateWeeklyAnalysis(allData);

  if (!analysis) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>분석 데이터를 생성할 수 없습니다.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Breadcrumb
        items={[
          { label: '홈', href: '/' },
          { label: '주간 분석', href: '/lotto/analysis/weekly' },
        ]}
      />

      <h1 className="text-2xl md:text-3xl font-bold mt-4 mb-2" style={{ color: 'var(--text-primary)' }}>
        {analysis.round}회 주간 로또 분석
      </h1>
      <p className="mb-6" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
        추첨일: {analysis.drawDate} | 매주 자동 업데이트
      </p>

      {/* 당첨 결과 */}
      <SectionFrame>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <BarChart3 size={20} /> 당첨 결과
        </h2>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {analysis.winningNumbers.map(n => <LottoBall key={n} number={n} />)}
          <span style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', margin: '0 4px' }}>+</span>
          <LottoBall number={analysis.bonusNumber} />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4" style={{ fontSize: '0.9rem' }}>
          <div style={{ color: 'var(--text-secondary)' }}>
            1등 당첨금: <strong style={{ color: 'var(--text-primary)' }}>{analysis.firstPrize}</strong>
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>
            1등 당첨자: <strong style={{ color: 'var(--text-primary)' }}>{analysis.firstWinners}명</strong>
          </div>
        </div>
      </SectionFrame>

      {/* 번호 분석 */}
      <SectionFrame>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <TrendingUp size={20} /> 번호 분석
        </h2>
        <div className="space-y-3" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <div className="flex justify-between">
            <span>홀짝비</span>
            <strong style={{ color: 'var(--text-primary)' }}>{analysis.oddEvenRatio}</strong>
          </div>
          <div className="flex justify-between">
            <span>고저비</span>
            <strong style={{ color: 'var(--text-primary)' }}>{analysis.highLowRatio}</strong>
          </div>
          <div className="flex justify-between">
            <span>번호 총합</span>
            <strong style={{ color: 'var(--text-primary)' }}>{analysis.sumRange}</strong>
          </div>
          <div className="flex justify-between">
            <span>연속번호</span>
            <strong style={{ color: 'var(--text-primary)' }}>{analysis.consecutivePattern}</strong>
          </div>
          <div className="flex justify-between flex-wrap">
            <span>구간 분포</span>
            <strong style={{ color: 'var(--text-primary)' }}>{analysis.sectionDistribution}</strong>
          </div>
        </div>
      </SectionFrame>

      {/* 핫넘버 / 콜드넘버 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionFrame>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--accent)' }}>
            <Flame size={20} /> 핫넘버 (최근 10회)
          </h2>
          <div className="flex flex-wrap gap-2">
            {analysis.hotNumbers.map(n => <LottoBall key={n} number={n} size="sm" />)}
          </div>
          <p className="mt-2" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            최근 10회 동안 가장 자주 출현한 번호
          </p>
        </SectionFrame>

        <SectionFrame>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--info, #69C8F2)' }}>
            <Snowflake size={20} /> 콜드넘버 (최근 10회)
          </h2>
          <div className="flex flex-wrap gap-2">
            {analysis.coldNumbers.map(n => <LottoBall key={n} number={n} size="sm" />)}
          </div>
          <p className="mt-2" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            최근 10회 동안 출현하지 않았거나 적게 나온 번호
          </p>
        </SectionFrame>
      </div>

      {/* 주간 트렌드 */}
      <SectionFrame>
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          주간 트렌드
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
          {analysis.weeklyTrend}
        </p>
      </SectionFrame>

      {/* 관련 링크 */}
      <div className="flex flex-wrap gap-3 mt-6 mb-4">
        <Link
          href={`/lotto/${analysis.round}`}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium"
          style={{ background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
        >
          {analysis.round}회 상세보기 <ArrowRight size={14} />
        </Link>
        <Link
          href="/lotto/statistics"
          className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium"
          style={{ background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
        >
          전체 통계 <ArrowRight size={14} />
        </Link>
        <Link
          href="/lotto/ai-hits"
          className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium"
          style={{ background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
        >
          AI 예측 <ArrowRight size={14} />
        </Link>
      </div>

      {/* JSON-LD 구조화 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: analysis.seoTitle,
            description: analysis.seoDescription,
            datePublished: analysis.drawDate,
            dateModified: analysis.generatedAt,
            author: { '@type': 'Organization', name: '로또킹' },
            publisher: { '@type': 'Organization', name: '로또킹', url: 'https://lotto.gon.ai.kr' },
          }),
        }}
      />
    </div>
  );
}
