import React from 'react';
import Link from 'next/link';
import { Dices } from 'lucide-react';

const navLinks = [
  { name: '당첨번호', path: '/lotto/recent' },
  { name: '통계분석', path: '/lotto/statistics' },
  { name: 'AI적중', path: '/lotto/ai-hits' },
  { name: '시뮬레이터', path: '/lotto/simulator' },
  { name: '꿈해몽', path: '/lotto/dream' },
  { name: '계산기', path: '/lotto/calculator' },
  { name: '커뮤니티', path: '/community' },
];

const legalLinks = [
  { name: '이용약관', path: '/terms' },
  { name: '개인정보처리방침', path: '/privacy' },
];

const Footer: React.FC = () => {
  return (
    <footer className="mt-16 pt-12 pb-8 px-4 sm:px-6 lg:px-8" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Top: Brand + Nav */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-10">
          {/* Brand */}
          <div className="max-w-xs">
            <Link href="/" className="inline-flex items-center gap-2 mb-3 group">
              <Dices
                className="w-5 h-5 text-primary transition-transform duration-500 group-hover:rotate-12"
                style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
              />
              <span className="text-lg font-bold gradient-text">로또킹</span>
            </Link>
            <p className="text-[13px] leading-relaxed break-keep-all" style={{ color: 'var(--text-tertiary)' }}>
              역대 전체 회차 데이터를 AI로 분석하여 매주 번호를 추천합니다.
            </p>
          </div>

          {/* Navigation — horizontal wrap */}
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="text-[13px] font-medium transition-colors duration-300 hover:text-primary"
                style={{ color: 'var(--text-secondary)' }}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom: Legal + Copyright */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-4">
            {legalLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="text-[11px] font-medium transition-colors duration-300 hover:text-primary"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
            &copy; {new Date().getFullYear()} 로또킹 &middot; 당첨을 보장하지 않으며, 모든 추천은 참고용입니다.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
