'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useAuthSafe } from '@/components/providers/AuthProvider';
import { Dices, Gamepad2, Moon, Clover, Calculator, BookOpen, User, ShieldCheck, ClipboardList, LogOut, Zap, Sparkles } from 'lucide-react';

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
  { name: '띠별행운', path: '/lotto/daily-fortune', desc: '매일 띠별 행운번호', Icon: Sparkles },
  { name: '시뮬레이터', path: '/lotto/simulator', desc: '매주 이 번호를 샀다면?', Icon: Gamepad2 },
  { name: '꿈번호', path: '/lotto/dream', desc: '꿈해몽 기반 번호 생성', Icon: Moon },
  { name: '행운번호', path: '/lotto/fortune', desc: '생년월일 행운번호', Icon: Clover },
  { name: '계산기', path: '/lotto/calculator', desc: '당첨금 세금 계산', Icon: Calculator },
  { name: '가이드', path: '/lotto/guide', desc: '로또 완전 가이드', Icon: BookOpen },
  { name: '연도별분석', path: `/lotto/year/${new Date().getFullYear()}`, desc: '연도별 당첨번호 통계', Icon: ClipboardList },
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [userMenuOpen]);

  useEffect(() => {
    if (!toolsOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) setToolsOpen(false);
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
      {/* Floating Glass Pill Navigation */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50',
          'transition-all duration-500',
        )}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div className={cn(
          'mx-auto mt-3 px-4',
          'max-w-5xl',
          'transition-all duration-500',
          scrolled && 'mt-2',
        )}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <div
            className={cn(
              'rounded-2xl lg:rounded-full',
              'backdrop-blur-xl',
              'border',
              'shadow-[0_8px_32px_rgba(0,0,0,0.08)]',
              'dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
              'transition-all duration-500',
              scrolled
                ? 'bg-[var(--surface)]/90 dark:bg-[var(--surface)]/80 shadow-lg'
                : 'bg-white/70 dark:bg-[#1E2030]/70',
            )}
            style={{
              borderColor: 'var(--glass-border)',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div className="flex items-center justify-between h-14 px-4 lg:px-6">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 group shrink-0">
                <Dices
                  className="w-6 h-6 text-primary transition-transform duration-500 group-hover:rotate-12"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                />
                <span className="text-lg font-bold gradient-text">로또킹</span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-0.5">
                {mainNavLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={cn(
                      'relative px-3 py-1.5 rounded-full text-[13px] font-medium',
                      'transition-all duration-300',
                      isActive(link.path)
                        ? 'text-primary bg-primary/10'
                        : 'hover:bg-[var(--surface-hover)]',
                    )}
                    style={{
                      color: isActive(link.path) ? undefined : 'var(--text-secondary)',
                      transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    {link.name}
                  </Link>
                ))}

                {/* Tools dropdown */}
                <div className="relative" ref={toolsRef}>
                  <button
                    onClick={() => setToolsOpen(!toolsOpen)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-[13px] font-medium',
                      'transition-all duration-300',
                      'hover:bg-[var(--surface-hover)]',
                      'flex items-center gap-1',
                      toolLinks.some(l => isActive(l.path)) && 'text-primary bg-primary/10',
                    )}
                    style={{
                      color: toolLinks.some(l => isActive(l.path)) ? undefined : 'var(--text-secondary)',
                      transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    도구
                    <svg
                      className={cn('w-3 h-3 transition-transform duration-300', toolsOpen && 'rotate-180')}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {toolsOpen && (
                    <div
                      className={cn(
                        'absolute top-full right-0 mt-2 w-60',
                        'rounded-2xl p-1.5',
                        'backdrop-blur-xl border',
                        'bg-white/90 dark:bg-[#1E2030]/90',
                        'shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)]',
                        'dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]',
                      )}
                      style={{
                        borderColor: 'var(--glass-border)',
                        animation: 'fadeInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    >
                      <div className="rounded-[calc(1rem-0.375rem)] overflow-hidden">
                        {toolLinks.map((link) => (
                          <Link
                            key={link.path}
                            href={link.path}
                            className={cn(
                              'flex items-start gap-3 px-3 py-2.5 rounded-xl',
                              'transition-all duration-300',
                              isActive(link.path)
                                ? 'bg-primary/10 text-primary'
                                : 'hover:bg-[var(--surface-hover)]'
                            )}
                            style={{
                              color: isActive(link.path) ? undefined : 'var(--text)',
                              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                            }}
                            onClick={() => setToolsOpen(false)}
                          >
                            <link.Icon className="w-4 h-4 mt-0.5 shrink-0 opacity-60" />
                            <div>
                              <div className="text-sm font-medium">{link.name}</div>
                              <div className="text-[11px] mt-0.5 opacity-50">{link.desc}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </nav>

              {/* Right section */}
              <div className="flex items-center gap-1.5">
                {/* Auth */}
                {auth && !auth.isLoading && (
                  auth.user ? (
                    <div className="relative" ref={userMenuRef}>
                      <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium',
                          'transition-all duration-300',
                          'hover:bg-[var(--surface-hover)]',
                          'ring-1 ring-[var(--border)]',
                        )}
                        style={{
                          color: 'var(--text)',
                          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      >
                        <User className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline max-w-[80px] truncate">{auth.user.nickname}</span>
                      </button>

                      {userMenuOpen && (
                        <div
                          className={cn(
                            'absolute top-full right-0 mt-2 w-48',
                            'rounded-2xl p-1.5',
                            'backdrop-blur-xl border',
                            'bg-white/90 dark:bg-[#1E2030]/90',
                            'shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)]',
                          )}
                          style={{
                            borderColor: 'var(--glass-border)',
                            animation: 'fadeInUp 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                        >
                          <div className="px-3 py-2.5 mb-1">
                            <p className="text-sm font-bold truncate" style={{ color: 'var(--text)' }}>
                              {auth.user.nickname}
                            </p>
                            <p className="text-[11px] mt-0.5 opacity-50">
                              {auth.user.isAdmin ? <span className="inline-flex items-center gap-1"><Zap className="w-3 h-3" /> 관리자</span> : '회원'}
                            </p>
                          </div>
                          <div className="h-px bg-[var(--border)] mx-2 mb-1" />
                          {auth.user.isAdmin && (
                            <Link
                              href="/admin"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-300 hover:bg-[var(--surface-hover)]"
                              style={{ color: '#EF4444' }}
                            >
                              <ShieldCheck className="w-4 h-4" /> 관리자
                            </Link>
                          )}
                          <Link
                            href="/mypage"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-300 hover:bg-[var(--surface-hover)]"
                            style={{ color: 'var(--text)' }}
                          >
                            <ClipboardList className="w-4 h-4" /> 마이페이지
                          </Link>
                          <button
                            onClick={() => { auth.logout(); setUserMenuOpen(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-300 hover:bg-[var(--surface-hover)]"
                            style={{ color: 'var(--text)' }}
                          >
                            <LogOut className="w-4 h-4" /> 로그아웃
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => auth.openAuthModal()}
                      className={cn(
                        'px-4 py-1.5 rounded-full text-[13px] font-semibold text-white',
                        'bg-primary hover:scale-[1.02] active:scale-[0.98]',
                        'transition-all duration-300',
                        'shadow-[0_0_20px_rgba(211,97,53,0.2)]',
                      )}
                      style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                    >
                      로그인
                    </button>
                  )
                )}

                <ThemeToggle size="sm" />

                {/* Mobile menu button */}
                <button
                  className={cn(
                    'lg:hidden p-2 rounded-full',
                    'transition-all duration-300',
                    'hover:bg-[var(--surface-hover)]',
                    'active:scale-[0.95]',
                  )}
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label={mobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
                  aria-expanded={mobileMenuOpen}
                  style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    style={{ color: 'var(--text)' }}
                    aria-hidden="true"
                  >
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20" />

      {/* Mobile Menu — Full-screen overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            style={{ animation: 'fade-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />

          <div
            className={cn(
              'absolute top-20 left-4 right-4',
              'rounded-2xl p-1.5',
              'backdrop-blur-xl border',
              'bg-white/90 dark:bg-[#1E2030]/90',
              'shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)]',
              'max-h-[calc(100dvh-6rem)] overflow-y-auto',
            )}
            style={{
              borderColor: 'var(--glass-border)',
              animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="p-2 space-y-0.5">
              {mainNavLinks.map((link, i) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl',
                    'text-[15px] font-medium',
                    'transition-all duration-300',
                    isActive(link.path)
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-[var(--surface-hover)]'
                  )}
                  style={{
                    color: isActive(link.path) ? undefined : 'var(--text)',
                    animationDelay: `${i * 40}ms`,
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {isActive(link.path) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  )}
                  {link.name}
                </Link>
              ))}

              <div className="h-px bg-[var(--border)] mx-3 my-2" />

              <div className="px-4 py-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-tertiary)' }}>
                  도구
                </span>
              </div>
              {toolLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl',
                    'text-[15px] font-medium',
                    'transition-all duration-300',
                    isActive(link.path)
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-[var(--surface-hover)]'
                  )}
                  style={{ color: isActive(link.path) ? undefined : 'var(--text)' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {isActive(link.path) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  )}
                  {link.name}
                </Link>
              ))}

              {/* Mobile auth */}
              {auth && !auth.isLoading && (
                <>
                  <div className="h-px bg-[var(--border)] mx-3 my-2" />
                  {!auth.user ? (
                    <button
                      className={cn(
                        'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
                        'text-[15px] font-semibold text-white',
                        'bg-primary hover:scale-[1.01] active:scale-[0.99]',
                        'transition-all duration-300',
                      )}
                      style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                      onClick={() => { setMobileMenuOpen(false); auth.openAuthModal(); }}
                    >
                      <User className="w-4 h-4" /> 로그인 / 회원가입
                    </button>
                  ) : (
                    <div
                      className="flex items-center justify-between px-4 py-3 rounded-xl"
                      style={{ background: 'var(--surface-hover)' }}
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{auth.user.nickname}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href="/mypage" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium px-3 py-2 rounded-lg text-primary">
                          마이페이지
                        </Link>
                        <button onClick={() => { auth.logout(); setMobileMenuOpen(false); }} className="text-sm font-medium px-3 py-2 rounded-lg" style={{ color: 'var(--text-secondary)' }}>
                          로그아웃
                        </button>
                      </div>
                    </div>
                  )}
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
