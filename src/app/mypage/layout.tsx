import type { Metadata } from 'next';
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: '마이페이지 - 로또킹',
  description: '나의 번호 히스토리와 배지 진행률을 확인하세요.',
  robots: { index: false, follow: false },
};

export default function MyPageLayout({ children }: { children: React.ReactNode }) {
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
