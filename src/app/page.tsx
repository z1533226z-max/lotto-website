'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LatestResult from '@/components/lotto/LatestResult';
import NumberGenerator from '@/components/lotto/NumberGenerator';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import AIHitsBanner from '@/components/lotto/AIHitsBanner';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 lg:px-8 py-6">
        {/* AI 적중 홍보 배너 */}
        <div className="mb-6">
          <AIHitsBanner />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-8 space-y-8">
            <section id="home">
              <LatestResult />
            </section>

            <section id="generator">
              <NumberGenerator />
            </section>

            <section id="statistics">
              <AnalyticsDashboard />
            </section>
          </div>

          {/* 사이드바 */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-xl shadow-card p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">바로가기</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/lotto/list" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
                      <span>📋</span> 당첨번호 전체 조회
                    </Link>
                  </li>
                  <li>
                    <Link href="/lotto/recent" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
                      <span>🕐</span> 최근 당첨번호
                    </Link>
                  </li>
                  <li>
                    <Link href="/lotto/statistics" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
                      <span>📊</span> 번호 통계 분석
                    </Link>
                  </li>
                  <li>
                    <Link href="/lotto/calculator" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
                      <span>🧮</span> 당첨금 세금 계산기
                    </Link>
                  </li>
                  <li>
                    <Link href="/lotto/rankings" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
                      <span>🏆</span> 역대 당첨금 순위
                    </Link>
                  </li>
                  <li>
                    <Link href="/lotto/ai-hits" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
                      <span>🎯</span> AI 적중 기록
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
