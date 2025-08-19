'use client';

import React from 'react';
import LatestResult from '@/components/lotto/LatestResult';
import NumberGenerator from '@/components/lotto/NumberGenerator';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 네비게이션 */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 로고 */}
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎲</span>
              <div>
                <h1 className="text-xl font-bold gradient-text">로또킹</h1>
                <p className="text-xs text-gray-500 hidden sm:block">AI가 뽑아주는 행운번호</p>
              </div>
            </div>
            
            {/* 네비게이션 */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#home" className="text-gray-700 hover:text-primary transition-colors">홈</a>
              <a href="#generator" className="text-gray-700 hover:text-primary transition-colors">AI추천</a>
              <a href="#statistics" className="text-gray-700 hover:text-primary transition-colors">통계</a>
              <a href="#about" className="text-gray-700 hover:text-primary transition-colors">소개</a>
            </nav>
            
            {/* 모바일 메뉴 버튼 */}
            <button className="md:hidden p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* 메인 컨테이너 */}
      <main className="container mx-auto px-4 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-8 space-y-8">
            {/* 최신 당첨번호 섹션 */}
            <section id="home">
              <LatestResult />
            </section>


            {/* AI 추천번호 섹션 */}
            <section id="generator">
              <NumberGenerator />
            </section>

            {/* AI 분석 대시보드 섹션 */}
            <section id="statistics">
              <AnalyticsDashboard />
            </section>
          </div>
          
          {/* 사이드바 - 데스크톱만 */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* 추가 정보 카드 */}
              <div className="bg-white rounded-xl shadow-card p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">📈 이번주 통계</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">AI 추천 생성</span>
                    <span className="font-medium">1,247회</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">누적 사용자</span>
                    <span className="font-medium">15,892명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">평균 만족도</span>
                    <span className="font-medium">★★★★☆</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">🎲</span>
                <span className="text-xl font-bold">로또킹</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI 기반 로또번호 추천 서비스<br />
                행운의 번호를 찾아드립니다
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-3">서비스</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>AI 번호 추천</li>
                <li>당첨번호 조회</li>
                <li>통계 분석</li>
                <li>번호 저장</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">정보</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>이용약관</li>
                <li>개인정보처리방침</li>
                <li>문의하기</li>
                <li>FAQ</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
            <p>&copy; 2024 로또킹. All rights reserved.</p>
            <p className="mt-2">
              본 서비스는 오락목적으로 제공되며, 실제 당첨을 보장하지 않습니다.
            </p>
          </div>
        </div>
      </footer>

      {/* 모바일 하단 고정 광고 */}
    </div>
  );
}