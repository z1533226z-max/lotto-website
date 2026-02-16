import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: '로또 커뮤니티 - 자유게시판 | 로또킹',
  description: '로또 당첨 후기, 번호 예측, 분석 팁 등을 공유하는 커뮤니티입니다. 다른 사용자들과 로또 관련 이야기를 나눠보세요.',
  keywords: ['로또 커뮤니티', '로또 게시판', '당첨 후기', '번호 예측', '로또 팁'],
  openGraph: {
    title: '로또 커뮤니티 - 자유게시판 | 로또킹',
    description: '로또 당첨 후기, 번호 예측, 분석 팁을 공유하는 커뮤니티',
    url: 'https://lotto.gon.ai.kr/community',
    siteName: '로또킹',
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <Header />
      <main className="container mx-auto px-4 lg:px-8 py-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}
