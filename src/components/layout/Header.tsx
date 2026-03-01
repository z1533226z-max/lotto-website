'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useAuthSafe } from '@/components/providers/AuthProvider';
import { Dices, Gamepad2, Moon, Clover, Calculator, BookOpen, User, ShieldCheck, ClipboardList, LogOut, Zap } from 'lucide-react';

const mainNavLinks = [
  { name: '홈', path: '/' },
  { name: '최근당첨', path: '/lotto/recent' },
  { name: '당첨조회', path: '/lotto/list' },
  { name: 'AI적중', path: '/lotto/ai-hits' },
  { name: '통계분석', path: '/lotto/statistics' },
  { name: '번호분석', path: '/lotto/number/1' },
  { name: '판매점', path: '/lotto/stores' },
  { name: '커뮤니티', path: '/community' },
];

const toolLinks = [
  { name: '시뮬레이터', path: '/lotto/simulator', desc: '매주 이 번호를 샀다면?', Icon: Gamepad2 },
  { name: '꿈번호', path: '/lotto/dream', desc: '꿈해몽 기반 번호 생성', Icon: Moon },
  { name: '행운번호', path: '/lotto/fortune', desc: '생년월일 행운번호', Icon: Clover },
  { name: '계산기', path: '/lotto/calculator', desc: '당첨금 세금 계산', Icon: Calculator },
  { name: '가이드', path: '/lotto/guide', desc: '로또 완전 가이드', Icon: BookOpen },
  { name: '연도별분석', path: `/lotto/year/${new Date().getFullYear()}`, desc: '연도별 당첨번호 통계', Icon: ClipboardList },
];

// 모바일 메뉴용 전체 목록
const allNavLinks = [
  ...mainNavLinks,
  { name: '시뮬레이터', path: '/lotto/simulator' },
  { name: '꿈번호', path: '/lotto/dream' },
  { name: '행운번호', path: '/lotto/fortune' },
  { name: '계산기', path: '/lotto/calculator' },
  { name: '가이드', path: '/lotto/guide' },
  { name: '번호분석', path: '/lotto/number/1' },
  { name: '연도별분석', path: `/lotto/year/${new Date().getFullYear()}` },
];

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const auth = useAuthSafe();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

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

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [userMenuOpen]);

  // Close tools dropdown on outside click
  useEffect(() => {
    if (!toolsOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [toolsOpen]);

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
              <Dices className="w-7 h-7 text-primary transition-transform duration-300 group-hover:scale-110" />
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
              {mainNavLinks.map((link) => (
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
                  {isActive(link.path) && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary"
                    />
                  )}
                </Link>
              ))}

              {/* Tools dropdown */}
              <div
                className="relative"
                ref={toolsRef}
              >
                <button
                  onClick={() => setToolsOpen(!toolsOpen)}
                  className={cn(
                    'relative px-3 py-2 rounded-lg text-sm font-medium',
                    'transition-all duration-200',
                    'hover:bg-[var(--surface-hover)]',
                    'flex items-center gap-1',
                    toolLinks.some(l => isActive(l.path)) && 'text-primary',
                  )}
                  style={{
                    color: toolLinks.some(l => isActive(l.path)) ? undefined : 'var(--text-secondary)',
                  }}
                >
                  도구
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {toolLinks.some(l => isActive(l.path)) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary" />
                  )}
                </button>

                {toolsOpen && (
                  <div className="absolute top-full right-0 mt-1 w-56 glass rounded-xl shadow-xl p-2 animate-fade-in z-50">
                    {toolLinks.map((link) => (
                      <Link
                        key={link.path}
                        href={link.path}
                        className={cn(
                          'flex items-start gap-3 px-3 py-2.5 rounded-lg',
                          'transition-all duration-200',
                          isActive(link.path)
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-[var(--surface-hover)]'
                        )}
                        style={{
                          color: isActive(link.path) ? undefined : 'var(--text)',
                        }}
                        onClick={() => setToolsOpen(false)}
                      >
                        <link.Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium">{link.name}</div>
                          <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                            {link.desc}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Right section: Auth + Theme toggle + Mobile menu button */}
            <div className="flex items-center gap-2">
              {/* Auth button */}
              {auth && !auth.isLoading && (
                auth.user ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
                        'transition-all duration-200',
                        'hover:bg-[var(--surface-hover)]',
                        'border',
                      )}
                      style={{
                        borderColor: 'var(--border)',
                        color: 'var(--text)',
                      }}
                    >
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline max-w-[80px] truncate">{auth.user.nickname}</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {userMenuOpen && (
                      <div
                        className="absolute top-full right-0 mt-1 w-48 glass rounded-xl shadow-xl overflow-hidden z-50"
                        style={{ animation: 'scaleIn 0.15s ease-out' }}
                      >
                        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                          <p className="text-sm font-bold truncate" style={{ color: 'var(--text)' }}>
                            {auth.user.nickname}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                            {auth.user.isAdmin ? <span className="inline-flex items-center gap-1"><Zap className="w-3 h-3" /> 관리자</span> : '회원'}
                          </p>
                        </div>
                        <div className="p-1">
                          {auth.user.isAdmin && (
                            <Link
                              href="/admin"
                              onClick={() => setUserMenuOpen(false)}
                              className={cn(
                                'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                                'transition-colors duration-200',
                                'hover:bg-[var(--surface-hover)]',
                              )}
                              style={{ color: '#EF4444' }}
                            >
                              <ShieldCheck className="w-4 h-4" />
                              관리자 페이지
                            </Link>
                          )}
                          <Link
                            href="/mypage"
                            onClick={() => setUserMenuOpen(false)}
                            className={cn(
                              'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                              'transition-colors duration-200',
                              'hover:bg-[var(--surface-hover)]',
                            )}
                            style={{ color: 'var(--text)' }}
                          >
                            <ClipboardList className="w-4 h-4" />
                            마이페이지
                          </Link>
                          <button
                            onClick={() => {
                              auth.logout();
                              setUserMenuOpen(false);
                            }}
                            className={cn(
                              'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                              'transition-colors duration-200',
                              'hover:bg-[var(--surface-hover)]',
                            )}
                            style={{ color: 'var(--text)' }}
                          >
                            <LogOut className="w-4 h-4" />
                            로그아웃
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => auth.openAuthModal()}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-semibold',
                      'transition-all duration-200',
                      'hover:opacity-90 active:scale-95',
                    )}
                    style={{
                      background: 'linear-gradient(135deg, #D36135, #E88A6A)',
                      color: '#fff',
                    }}
                  >
                    로그인
                  </button>
                )
              )}

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
                  aria-hidden="true"
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
              {mainNavLinks.map((link) => (
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

              {/* Tools section divider */}
              <div className="px-4 pt-3 pb-1">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                  도구
                </span>
              </div>
              {toolLinks.map((link) => (
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

              {/* Mobile auth section */}
              {auth && !auth.isLoading && !auth.user && (
                <>
                  <div className="px-4 pt-3 pb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                      계정
                    </span>
                  </div>
                  <button
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
                      'text-base font-semibold',
                      'transition-all duration-200',
                    )}
                    style={{
                      background: 'linear-gradient(135deg, #D36135, #E88A6A)',
                      color: '#fff',
                    }}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      auth.openAuthModal();
                    }}
                  >
                    <User className="w-4 h-4" /> 로그인 / 회원가입
                  </button>
                </>
              )}
              {auth && auth.user && (
                <>
                  <div className="px-4 pt-3 pb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                      계정
                    </span>
                  </div>
                  <div
                    className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background: 'var(--surface-hover)' }}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                        {auth.user.nickname}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href="/mypage"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-sm font-medium px-3 py-2 rounded-lg"
                        style={{ color: '#D36135' }}
                      >
                        마이페이지
                      </Link>
                      <button
                        onClick={() => {
                          auth.logout();
                          setMobileMenuOpen(false);
                        }}
                        className="text-sm font-medium px-3 py-2 rounded-lg"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        로그아웃
                      </button>
                    </div>
                  </div>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
