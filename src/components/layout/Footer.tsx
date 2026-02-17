import React from 'react';
import Link from 'next/link';
import { Dices } from 'lucide-react';

const serviceLinks = [
  { name: 'AI 번호 추천', path: '/#generator' },
  { name: '최근 당첨번호', path: '/lotto/recent' },
  { name: '당첨번호 조회', path: '/lotto/list' },
  { name: 'AI 적중 기록', path: '/lotto/ai-hits' },
  { name: '통계 분석', path: '/lotto/statistics' },
  { name: '세금 계산기', path: '/lotto/calculator' },
];

const toolLinks = [
  { name: '시뮬레이터', path: '/lotto/simulator' },
  { name: '꿈번호 해몽', path: '/lotto/dream' },
  { name: '행운번호', path: '/lotto/fortune' },
  { name: '로또 가이드', path: '/lotto/guide' },
];

const infoLinks = [
  { name: '이용약관', path: '/terms' },
  { name: '개인정보처리방침', path: '/privacy' },
  { name: '커뮤니티', path: '/community' },
];

const Footer: React.FC = () => {
  return (
    <footer
      className="mt-12"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      <div style={{ backgroundColor: 'var(--surface)' }}>
        <div className="container mx-auto px-4 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="inline-flex items-center gap-2 mb-3">
                <Dices className="w-5 h-5 text-primary" />
                <span className="text-lg font-bold gradient-text">로또킹</span>
              </Link>
              <p
                className="text-xs leading-relaxed"
                style={{ color: 'var(--text-tertiary)' }}
              >
                AI 기반 로또번호 분석 서비스.
                <br />
                역대 전체 데이터를 분석합니다.
              </p>
            </div>

            {/* Service */}
            <div>
              <h4
                className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: 'var(--text-secondary)' }}
              >
                서비스
              </h4>
              <ul className="space-y-0.5">
                {serviceLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      href={link.path}
                      className="text-xs py-1.5 inline-block transition-colors duration-200 hover:text-primary"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tools */}
            <div>
              <h4
                className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: 'var(--text-secondary)' }}
              >
                도구
              </h4>
              <ul className="space-y-0.5">
                {toolLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      href={link.path}
                      className="text-xs py-1.5 inline-block transition-colors duration-200 hover:text-primary"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Info */}
            <div>
              <h4
                className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: 'var(--text-secondary)' }}
              >
                정보
              </h4>
              <ul className="space-y-0.5">
                {infoLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      href={link.path}
                      className="text-xs py-1.5 inline-block transition-colors duration-200 hover:text-primary"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div
            className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
              &copy; {new Date().getFullYear()} 로또킹. All rights reserved.
            </p>
            <p className="text-[11px] text-center sm:text-right max-w-sm" style={{ color: 'var(--text-tertiary)' }}>
              로또 당첨을 보장하지 않습니다. 오락 목적 서비스이며, 모든 추천은 참고용입니다.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
