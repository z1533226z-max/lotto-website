import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const serviceLinks = [
  { name: 'AI 번호 추천', path: '/#generator' },
  { name: '최근 당첨번호', path: '/lotto/recent' },
  { name: '당첨번호 조회', path: '/lotto/list' },
  { name: 'AI 적중 기록', path: '/lotto/ai-hits' },
  { name: '통계 분석', path: '/lotto/statistics' },
  { name: '세금 계산기', path: '/lotto/calculator' },
  { name: '역대 당첨금 순위', path: '/lotto/rankings' },
];

const infoLinks = [
  { name: '이용약관', path: '/terms' },
  { name: '개인정보처리방침', path: '/privacy' },
];

const Footer: React.FC = () => {
  return (
    <footer className="mt-16 relative">
      {/* Gradient top border */}
      <div
        className="h-px w-full"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--primary), var(--accent), var(--secondary), transparent)',
        }}
      />

      <div
        style={{
          backgroundColor: 'var(--surface)',
          color: 'var(--text)',
        }}
      >
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Brand section */}
            <div>
              <Link href="/" className="inline-flex items-center gap-2 group mb-4">
                <span className="text-2xl transition-transform duration-300 group-hover:scale-110">
                  🎲
                </span>
                <span className="text-xl font-bold gradient-text">
                  로또킹
                </span>
              </Link>
              <p
                className="text-sm leading-relaxed mt-3"
                style={{ color: 'var(--text-secondary)' }}
              >
                AI 기반 로또번호 추천 서비스
                <br />
                역대 전체 회차 데이터를 분석하여
                <br />
                행운의 번호를 찾아드립니다.
              </p>
            </div>

            {/* Service links */}
            <div>
              <h4
                className="font-semibold mb-4 text-sm uppercase tracking-wider"
                style={{ color: 'var(--text)' }}
              >
                서비스
              </h4>
              <ul className="space-y-2.5">
                {serviceLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      href={link.path}
                      className={cn(
                        'text-sm transition-colors duration-200',
                        'hover:text-primary'
                      )}
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Info links */}
            <div>
              <h4
                className="font-semibold mb-4 text-sm uppercase tracking-wider"
                style={{ color: 'var(--text)' }}
              >
                정보
              </h4>
              <ul className="space-y-2.5">
                {infoLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      href={link.path}
                      className={cn(
                        'text-sm transition-colors duration-200',
                        'hover:text-primary'
                      )}
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom section */}
          <div
            className="mt-10 pt-8 text-center text-sm"
            style={{
              borderTop: '1px solid var(--border)',
              color: 'var(--text-tertiary)',
            }}
          >
            <p>&copy; {new Date().getFullYear()} 로또킹. All rights reserved.</p>
            <p className="mt-2 max-w-lg mx-auto leading-relaxed">
              이 서비스는 로또 당첨을 보장하지 않습니다.
              본 서비스는 오락 목적으로 제공되며, 모든 번호 추천은 참고용입니다.
              로또 구매는 본인의 판단과 책임 하에 이루어져야 합니다.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
