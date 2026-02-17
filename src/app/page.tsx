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

const LeaderboardWidget = dynamic(
  () => import('@/components/gamification/LeaderboardWidget'),
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
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Animated gradient background */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, #7C3AED 50%, var(--secondary) 100%)',
            }}
          />
          {/* Decorative floating elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute top-10 left-[10%] w-20 h-20 rounded-full opacity-20 animate-float"
              style={{ background: 'radial-gradient(circle, #83BCA9 0%, transparent 70%)', animationDelay: '0s' }}
            />
            <div
              className="absolute top-20 right-[15%] w-16 h-16 rounded-full opacity-15 animate-float"
              style={{ background: 'radial-gradient(circle, #2196F3 0%, transparent 70%)', animationDelay: '1s' }}
            />
            <div
              className="absolute bottom-16 left-[20%] w-12 h-12 rounded-full opacity-20 animate-float"
              style={{ background: 'radial-gradient(circle, #FF5722 0%, transparent 70%)', animationDelay: '0.5s' }}
            />
            <div
              className="absolute bottom-10 right-[25%] w-24 h-24 rounded-full opacity-10 animate-float"
              style={{ background: 'radial-gradient(circle, #4CAF50 0%, transparent 70%)', animationDelay: '1.5s' }}
            />
            <div
              className="absolute top-1/2 left-[50%] w-14 h-14 rounded-full opacity-15 animate-float"
              style={{ background: 'radial-gradient(circle, #9E9E9E 0%, transparent 70%)', animationDelay: '2s' }}
            />
          </div>

          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-black/10" />

          <div className="relative z-10 container mx-auto px-4 lg:px-8 py-16 md:py-24 text-center">
            <div className="animate-fadeInUp">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-sm font-medium mb-6 border border-white/20">
                AI 기반 로또 분석 서비스
              </span>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
                AI가 분석한
                <br />
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #E88A6A, #D36135)' }}>
                  이번주 로또번호
                </span>
              </h1>
              <p className="text-base md:text-lg text-white/80 mb-8 max-w-xl mx-auto">
                역대 전체 회차 데이터를 AI가 분석하여
                <br className="hidden sm:block" />
                통계 기반 추천번호를 제공합니다
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="#generator"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-bold text-base transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl bg-white text-gray-900 hover:bg-gray-50"
                >
                  AI 번호 받기
                </Link>
                <Link
                  href="#statistics"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-bold text-base transition-all duration-300 hover:-translate-y-0.5 bg-white/15 backdrop-blur-sm text-white border border-white/25 hover:bg-white/25"
                >
                  통계 분석 보기
                </Link>
              </div>
            </div>
          </div>

          {/* Wave bottom border */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path
                d="M0 60V20C240 0 480 40 720 20C960 0 1200 40 1440 20V60H0Z"
                style={{ fill: 'var(--bg)' }}
              />
            </svg>
          </div>
        </section>

        <div className="container mx-auto px-4 lg:px-8 py-6">
          {/* AI Hits Banner */}
          <div className="mb-8 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            <AIHitsBanner />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main content */}
            <div className="lg:col-span-8 space-y-10">
              {/* Latest Result */}
              <section id="home" className="animate-fadeInUp" style={{ animationDelay: '300ms' }}>
                <LatestResult />
              </section>

              {/* Number Generator */}
              <section id="generator" className="animate-fadeInUp" style={{ animationDelay: '400ms' }}>
                <NumberGenerator />
              </section>

              {/* Statistics Dashboard */}
              <section id="statistics" className="animate-fadeInUp" style={{ animationDelay: '500ms' }}>
                <AnalyticsDashboard />
              </section>
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                {/* Daily Challenge */}
                <DailyChallengeWidget />

                {/* Leaderboard */}
                <LeaderboardWidget />

                {/* Quick Links Card */}
                <div
                  className="rounded-2xl p-6 border backdrop-blur-sm"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <h3 className="text-lg font-bold mb-5" style={{ color: 'var(--text)' }}>
                    바로가기
                  </h3>
                  <ul className="space-y-1">
                    {quickLinks.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          <span className="text-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                            {link.icon}
                          </span>
                          <div className="min-w-0">
                            <span className="block text-sm font-medium group-hover:text-primary transition-colors" style={{ color: 'var(--text)' }}>
                              {link.label}
                            </span>
                            <span className="block text-xs" style={{ color: 'var(--text-tertiary)' }}>
                              {link.desc}
                            </span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quick Stats Card */}
                <div
                  className="rounded-2xl p-6 border"
                  style={{
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    borderColor: 'transparent',
                  }}
                >
                  <h3 className="text-lg font-bold mb-4 text-white">
                    서비스 현황
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/15 backdrop-blur-sm">
                      <span className="text-sm text-white/80">AI 분석 엔진</span>
                      <span className="flex items-center gap-1.5 text-sm font-bold text-white">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        가동 중
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/15 backdrop-blur-sm">
                      <span className="text-sm text-white/80">데이터 업데이트</span>
                      <span className="text-sm font-bold text-white">매주 자동</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/15 backdrop-blur-sm">
                      <span className="text-sm text-white/80">분석 비용</span>
                      <span className="text-sm font-bold text-yellow-300">무료</span>
                    </div>
                  </div>
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
