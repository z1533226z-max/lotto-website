import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AIHitsBanner from '@/components/lotto/AIHitsBanner';
import type { Metadata } from 'next';

const LatestResult = dynamic(
  () => import('@/components/lotto/LatestResult'),
  {
    loading: () => (
      <div className="animate-pulse rounded-2xl p-8" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="space-y-6 text-center">
          <div className="h-6 rounded-lg w-32 mx-auto" style={{ backgroundColor: 'var(--surface-hover)' }} />
          <div className="h-10 rounded-lg w-48 mx-auto" style={{ backgroundColor: 'var(--surface-hover)' }} />
          <div className="flex justify-center gap-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="w-12 h-12 rounded-full" style={{ backgroundColor: 'var(--surface-hover)' }} />
            ))}
          </div>
        </div>
      </div>
    ),
    ssr: false,
  }
);

const AnalyticsDashboard = dynamic(
  () => import('@/components/analytics/AnalyticsDashboard'),
  {
    loading: () => (
      <div className="animate-pulse rounded-2xl p-8" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="h-8 rounded-lg w-48 mb-6" style={{ backgroundColor: 'var(--surface-hover)' }} />
        <div className="h-64 rounded-lg" style={{ backgroundColor: 'var(--surface-hover)' }} />
      </div>
    ),
    ssr: false,
  }
);

const DailyChallengeWidget = dynamic(
  () => import('@/components/gamification/DailyChallengeWidget'),
  { ssr: false }
);

const NumberGenerator = dynamic(
  () => import('@/components/lotto/NumberGenerator'),
  {
    loading: () => (
      <div className="animate-pulse rounded-2xl p-8" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="h-8 rounded-lg w-48 mx-auto mb-6" style={{ backgroundColor: 'var(--surface-hover)' }} />
        <div className="flex justify-center gap-3 mb-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-14 h-14 rounded-full" style={{ backgroundColor: 'var(--surface-hover)' }} />
          ))}
        </div>
        <div className="h-12 rounded-xl w-48 mx-auto" style={{ backgroundColor: 'var(--surface-hover)' }} />
      </div>
    ),
    ssr: false,
  }
);

export const metadata: Metadata = {
  title: '로또킹 - AI 로또번호 추천 | 당첨번호 조회 & 통계 분석',
  description: '최신 AI 기술로 분석한 로또번호 추천 서비스. 역대 전체 회차 데이터 기반 당첨번호 조회, 통계 분석, 세금 계산기까지. 매주 자동 업데이트.',
  openGraph: {
    title: '로또킹 - AI 로또번호 추천',
    description: '역대 전체 회차 데이터 분석으로 찾은 패턴으로 번호를 추천합니다. 매주 업데이트되는 AI 분석 결과를 확인해보세요!',
    url: 'https://lotto.gon.ai.kr',
  },
};

const quickLinks = [
  { href: '/lotto/list', icon: '📋', label: '당첨번호 전체 조회', desc: '1회부터 최신 회차까지' },
  { href: '/lotto/recent', icon: '🕐', label: '최근 당첨번호', desc: '최근 회차 결과 확인' },
  { href: '/lotto/statistics', icon: '📊', label: '번호 통계 분석', desc: '빈도, 패턴, 트렌드' },
  { href: '/lotto/calculator', icon: '🧮', label: '세금 계산기', desc: '실수령액 즉시 계산' },
  { href: '/lotto/rankings', icon: '🏆', label: '당첨금 순위', desc: '역대 최고 당첨금' },
  { href: '/lotto/ai-hits', icon: '🎯', label: 'AI 적중 기록', desc: 'AI 예측 성과 확인' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <Header />

      <main>
        {/* Hero Section - Clean, minimal design */}
        <section
          className="relative overflow-hidden"
          style={{ background: 'var(--surface)' }}
        >
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center py-12 md:py-20">
              {/* Left: Text content */}
              <div className="space-y-6">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: 'rgba(211, 97, 53, 0.08)',
                    color: 'var(--primary)',
                    border: '1px solid rgba(211, 97, 53, 0.15)',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  AI 분석 엔진 가동 중
                </div>

                <h1
                  className="text-3xl md:text-4xl lg:text-5xl font-black leading-[1.15] tracking-tight"
                  style={{ color: 'var(--text)' }}
                >
                  데이터가 말하는
                  <br />
                  <span className="gradient-text">이번주 번호</span>
                </h1>

                <p
                  className="text-base md:text-lg leading-relaxed max-w-md"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  역대 전체 회차 데이터를 AI가 분석하여
                  통계 기반 추천번호를 제공합니다.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link
                    href="#generator"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                    style={{ background: 'linear-gradient(135deg, #D36135, #C05430)' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                    AI 번호 받기
                  </Link>
                  <Link
                    href="#statistics"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:opacity-80"
                    style={{
                      color: 'var(--text)',
                      border: '1px solid var(--border)',
                      backgroundColor: 'transparent',
                    }}
                  >
                    통계 분석 보기
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                  </Link>
                </div>

                {/* Trust indicators */}
                <div className="flex items-center gap-6 pt-2">
                  {[
                    { value: '1,200+', label: '분석 회차' },
                    { value: '무료', label: '이용 비용' },
                    { value: '매주', label: '자동 업데이트' },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{stat.value}</p>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Visual element - Latest result preview */}
              <div className="relative hidden lg:flex justify-center">
                <div
                  className="relative w-full max-w-sm rounded-2xl p-8 space-y-5"
                  style={{
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 24px 48px -12px rgba(0,0,0,0.08)',
                  }}
                >
                  {/* Decorative accent bar */}
                  <div
                    className="absolute top-0 left-6 right-6 h-1 rounded-b-full"
                    style={{ background: 'linear-gradient(90deg, #D36135, #3E5641)' }}
                  />

                  <div className="text-center space-y-1">
                    <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>최신 당첨 결과</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>이번주 당첨번호 확인하기</p>
                  </div>

                  {/* Placeholder balls */}
                  <div className="flex justify-center gap-2.5">
                    {[3, 12, 24, 33, 39, 42].map((n, i) => {
                      const colors = ['#FFC107', '#2196F3', '#FF5722', '#9E9E9E', '#9E9E9E', '#4CAF50'];
                      return (
                        <div
                          key={i}
                          className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white"
                          style={{
                            background: colors[i],
                            boxShadow: `0 2px 8px ${colors[i]}44`,
                          }}
                        >
                          {n}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>매주 토요일 자동 업데이트</span>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: 'rgba(211, 97, 53, 0.1)', color: '#D36135' }}
                    >
                      LIVE
                    </span>
                  </div>

                  {/* Quick stats row */}
                  <div
                    className="grid grid-cols-3 gap-3 pt-3"
                    style={{ borderTop: '1px solid var(--border)' }}
                  >
                    {[
                      { icon: '🎯', label: 'AI 적중', value: '활성' },
                      { icon: '📊', label: '통계', value: '실시간' },
                      { icon: '💾', label: '저장', value: '자동' },
                    ].map((item) => (
                      <div key={item.label} className="text-center">
                        <span className="text-lg">{item.icon}</span>
                        <p className="text-[10px] font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subtle divider */}
          <div className="h-px" style={{ background: 'var(--border)' }} />
        </section>

        {/* Quick Links Bar - Horizontal scrollable on mobile */}
        <section
          className="border-b"
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
        >
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex gap-1 py-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0 hover:scale-[1.02]"
                  style={{
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <span className="text-base">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 lg:px-8 py-8">
          {/* AI Hits Banner */}
          <div className="mb-8">
            <AIHitsBanner />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main content */}
            <div className="lg:col-span-8 space-y-8">
              {/* Latest Result */}
              <section id="home">
                <LatestResult />
              </section>

              {/* Number Generator */}
              <section id="generator">
                <NumberGenerator />
              </section>

              {/* Statistics Dashboard */}
              <section id="statistics">
                <AnalyticsDashboard />
              </section>
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                {/* Daily Challenge */}
                <DailyChallengeWidget />

                {/* Quick Links Card */}
                <div
                  className="rounded-2xl p-5 border"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text)' }}>
                    바로가기
                  </h3>
                  <ul className="space-y-0.5">
                    {quickLinks.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          <span className="text-base flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                            {link.icon}
                          </span>
                          <div className="min-w-0 flex-1">
                            <span className="block text-sm font-medium group-hover:text-primary transition-colors" style={{ color: 'var(--text)' }}>
                              {link.label}
                            </span>
                          </div>
                          <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
