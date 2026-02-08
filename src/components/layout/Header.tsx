'use client';

import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🎲</span>
            <div>
              <h1 className="text-xl font-bold gradient-text">로또킹</h1>
              <p className="text-xs text-gray-500 hidden sm:block">AI가 뽑아주는 행운번호</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-primary transition-colors">홈</Link>
            <Link href="/lotto/list" className="text-gray-700 hover:text-primary transition-colors">당첨번호</Link>
            <Link href="/lotto/statistics" className="text-gray-700 hover:text-primary transition-colors">통계</Link>
            <Link href="/lotto/calculator" className="text-gray-700 hover:text-primary transition-colors">계산기</Link>
            <Link href="/lotto/ai-hits" className="text-gray-700 hover:text-primary transition-colors">AI적중</Link>
          </nav>

          <button className="md:hidden p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
