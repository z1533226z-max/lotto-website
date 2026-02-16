'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/ui/ThemeToggle';

const navLinks = [
  { name: '홈', path: '/' },
  { name: '최근당첨', path: '/lotto/recent' },
  { name: '당첨조회', path: '/lotto/list' },
  { name: 'AI적중', path: '/lotto/ai-hits' },
  { name: '통계분석', path: '/lotto/statistics' },
  { name: '판매점', path: '/lotto/stores' },
  { name: '계산기', path: '/lotto/calculator' },
  { name: '순위', path: '/lotto/rankings' },
  { name: '커뮤니티', path: '/community' },
];

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Track scroll position for header background enhancement
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50',
          'glass',
          'transition-all duration-300',
          scrolled && 'shadow-lg dark:shadow-2xl'
        )}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 group"
            >
              <span className="text-2xl transition-transform duration-300 group-hover:scale-110">
                🎲
              </span>
              <div>
                <span className="text-xl font-bold gradient-text">
                  로또킹
                </span>
                <p className="text-[10px] hidden sm:block" style={{ color: 'var(--text-secondary)' }}>
                  AI가 뽑아주는 행운번호
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={cn(
                    'relative px-3 py-2 rounded-lg text-sm font-medium',
                    'transition-all duration-200',
                    isActive(link.path)
                      ? 'text-primary'
                      : 'hover:bg-[var(--surface-hover)]',
                  )}
                  style={{
                    color: isActive(link.path) ? undefined : 'var(--text-secondary)',
                  }}
                >
                  {link.name}
                  {/* Active indicator */}
                  {isActive(link.path) && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary"
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right section: Theme toggle + Mobile menu button */}
            <div className="flex items-center gap-2">
              <ThemeToggle size="sm" />

              {/* Mobile menu button */}
              <button
                className={cn(
                  'lg:hidden p-2 rounded-lg',
                  'transition-colors duration-200',
                  'hover:bg-[var(--surface-hover)]'
                )}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
                aria-expanded={mobileMenuOpen}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: 'var(--text)' }}
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
          />

          {/* Menu panel */}
          <div
            className={cn(
              'absolute top-16 left-0 right-0 mx-4 mt-2',
              'glass rounded-2xl',
              'animate-slide-down',
              'max-h-[calc(100vh-5rem)] overflow-y-auto'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="p-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl',
                    'text-base font-medium',
                    'transition-all duration-200',
                    isActive(link.path)
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-[var(--surface-hover)]'
                  )}
                  style={{
                    color: isActive(link.path) ? undefined : 'var(--text)',
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {isActive(link.path) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
