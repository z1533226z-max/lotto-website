'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  DREAM_KEYWORDS,
  DREAM_CATEGORIES,
  POPULAR_KEYWORDS,
  type DreamKeyword,
  type DreamCategory,
} from '@/data/dreamNumbers';
import { cn, copyToClipboard, shuffleArray, sortNumbers } from '@/lib/utils';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { useAuthSafe } from '@/components/providers/AuthProvider';
import UsageLimitBanner from '@/components/usage/UsageLimitBanner';
import UsageLimitModal from '@/components/usage/UsageLimitModal';
import MemberGate from '@/components/auth/MemberGate';
import { getNextDrawRound } from '@/lib/lottoUtils';
import { Eye, PawPrint, Leaf, Gem, PersonStanding, Heart, User, Palette, Search, Moon } from 'lucide-react';

const MAX_KEYWORDS = 6;
const LOTTO_COUNT = 6;

/**
 * Get the ball color for a lotto number (mirrors LottoNumbers component)
 */
const getBallHexColor = (num: number): string => {
  if (num <= 10) return '#FFC107';
  if (num <= 20) return '#2196F3';
  if (num <= 30) return '#FF5722';
  if (num <= 40) return '#9E9E9E';
  return '#4CAF50';
};

const getBallTextHexColor = (num: number): string => {
  if (num <= 10) return '#333333';
  return '#FFFFFF';
};

/**
 * Single lotto ball rendered in 3D style
 */
const LottoBall: React.FC<{
  number: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  delay?: number;
}> = ({ number, size = 'md', animated = false, delay = 0 }) => {
  const baseColor = getBallHexColor(number);
  const textColor = getBallTextHexColor(number);
  const lighterColor = baseColor + 'CC';

  const sizeMap = {
    sm: { container: 'w-9 h-9', text: 'text-xs', shadow: '3px', highlight: '8px' },
    md: { container: 'w-12 h-12', text: 'text-base', shadow: '4px', highlight: '10px' },
    lg: { container: 'w-16 h-16', text: 'text-xl', shadow: '6px', highlight: '14px' },
  };
  const cfg = sizeMap[size];

  return (
    <div
      className={cn(
        cfg.container,
        cfg.text,
        'rounded-full flex items-center justify-center font-bold',
        'relative select-none',
        'transition-all duration-300 hover:scale-110',
        animated && 'animate-fade-in-up'
      )}
      style={{
        background: `radial-gradient(circle at 35% 30%, ${lighterColor}, ${baseColor} 50%, ${baseColor}99 100%)`,
        color: textColor,
        boxShadow: `0 ${cfg.shadow} ${parseInt(cfg.shadow) * 3}px ${baseColor}66, inset 0 -${parseInt(cfg.shadow) / 2}px ${parseInt(cfg.shadow)}px ${baseColor}44`,
        ...(animated ? { animationDelay: `${delay}ms`, animationFillMode: 'both' } : {}),
      }}
    >
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          top: '10%',
          left: '15%',
          width: cfg.highlight,
          height: cfg.highlight,
          background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)',
        }}
      />
      <span className="relative z-10 font-bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
        {number}
      </span>
    </div>
  );
};

/**
 * Category icon mapping
 */
const categoryIcons: Record<string, React.ReactNode> = {
  '전체': <Eye className="w-4 h-4 inline-block" />,
  '동물': <PawPrint className="w-4 h-4 inline-block" />,
  '자연': <Leaf className="w-4 h-4 inline-block" />,
  '사물': <Gem className="w-4 h-4 inline-block" />,
  '행동': <PersonStanding className="w-4 h-4 inline-block" />,
  '감정': <Heart className="w-4 h-4 inline-block" />,
  '사람': <User className="w-4 h-4 inline-block" />,
  '색깔': <Palette className="w-4 h-4 inline-block" />,
};

export default function DreamNumberPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<DreamCategory>('전체');
  const [selectedKeywords, setSelectedKeywords] = useState<DreamKeyword[]>([]);
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [animateKey, setAnimateKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const { canUse, recordUsage } = useUsageLimit();
  const auth = useAuthSafe();

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter keywords based on search query and category
  const filteredKeywords = useMemo(() => {
    let results = DREAM_KEYWORDS;
    if (activeCategory !== '전체') {
      results = results.filter((k) => k.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      results = results.filter(
        (k) =>
          k.keyword.includes(q) ||
          k.description.includes(q) ||
          k.category.includes(q)
      );
    }
    return results;
  }, [searchQuery, activeCategory]);

  // Autocomplete suggestions
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim().toLowerCase();
    return DREAM_KEYWORDS.filter(
      (k) =>
        k.keyword.includes(q) &&
        !selectedKeywords.some((s) => s.keyword === k.keyword)
    ).slice(0, 8);
  }, [searchQuery, selectedKeywords]);

  // Generate final 6 numbers from selected keywords
  const generateNumbers = useCallback(
    (keywords: DreamKeyword[]) => {
      if (keywords.length === 0) {
        setGeneratedNumbers([]);
        return;
      }

      // Usage limit check
      if (!canUse('dream')) {
        setShowLimitModal(true);
        return;
      }

      // Count frequency of each number across all selected keywords
      const freq: Record<number, number> = {};
      keywords.forEach((kw) => {
        kw.numbers.forEach((n) => {
          freq[n] = (freq[n] || 0) + 1;
        });
      });

      // Collect all unique numbers
      const allNumbers = Object.keys(freq).map(Number);

      let selected: number[];

      if (allNumbers.length <= LOTTO_COUNT) {
        // Not enough numbers, use all we have
        selected = sortNumbers(allNumbers);
      } else {
        // Sort by frequency (desc), then shuffle within same frequency for variety
        const grouped: Record<number, number[]> = {};
        allNumbers.forEach((n) => {
          const f = freq[n];
          if (!grouped[f]) grouped[f] = [];
          grouped[f].push(n);
        });

        const freqs = Object.keys(grouped)
          .map(Number)
          .sort((a, b) => b - a);

        const prioritized: number[] = [];
        for (const f of freqs) {
          prioritized.push(...shuffleArray(grouped[f]));
        }

        selected = sortNumbers(prioritized.slice(0, LOTTO_COUNT));
      }

      setGeneratedNumbers(selected);
      setAnimateKey((prev) => prev + 1);

      // Record usage
      recordUsage('dream');

      // 게임화 배지 카운터
      if (typeof window !== 'undefined' && window.__trackAction) {
        window.__trackAction('dreamGeneration');
      }

      // Server save for members
      if (auth?.user) {
        try {
          fetch('/api/user/numbers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              numbers: [selected],
              source: 'dream',
              roundTarget: getNextDrawRound(),
            }),
          });
        } catch {
          // 번호 저장 실패 시 무시
        }
      }
    },
    [canUse, recordUsage, auth]
  );

  // Add keyword
  const addKeyword = useCallback(
    (kw: DreamKeyword) => {
      if (selectedKeywords.length >= MAX_KEYWORDS) return;
      if (selectedKeywords.some((s) => s.keyword === kw.keyword)) return;
      const updated = [...selectedKeywords, kw];
      setSelectedKeywords(updated);
      setSearchQuery('');
      setShowSuggestions(false);
      generateNumbers(updated);
    },
    [selectedKeywords, generateNumbers]
  );

  // Remove keyword
  const removeKeyword = useCallback(
    (keyword: string) => {
      const updated = selectedKeywords.filter((s) => s.keyword !== keyword);
      setSelectedKeywords(updated);
      generateNumbers(updated);
    },
    [selectedKeywords, generateNumbers]
  );

  // Reshuffle (re-randomize when > 6 candidates)
  const reshuffle = useCallback(() => {
    generateNumbers(selectedKeywords);
  }, [selectedKeywords, generateNumbers]);

  // Total candidate count
  const totalCandidates = useMemo(() => {
    const allNums = new Set<number>();
    selectedKeywords.forEach((kw) => kw.numbers.forEach((n) => allNums.add(n)));
    return allNums.size;
  }, [selectedKeywords]);

  // Copy numbers
  const handleCopy = useCallback(async () => {
    if (generatedNumbers.length === 0) return;
    const text = generatedNumbers.join(', ');
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [generatedNumbers]);

  // Clear all
  const clearAll = useCallback(() => {
    setSelectedKeywords([]);
    setGeneratedNumbers([]);
    setSearchQuery('');
  }, []);

  return (
    <MemberGate featureName="꿈번호 해몽" featureIcon={<Moon className="w-10 h-10 mx-auto" />} featureDesc="꿈 키워드로 행운 번호를 뽑아봐요">
      <Breadcrumb
        items={[
          { label: '홈', href: '/' },
          { label: '꿈번호 생성기' },
        ]}
      />

      <div className="max-w-2xl mx-auto">
        {/* ─── Page Header ─── */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, #7C3AED, #A855F7, #C084FC)',
              boxShadow: '0 8px 24px rgba(124, 58, 237, 0.35)',
            }}
          >
            <Eye className="w-8 h-8 text-white" />
          </div>
          <h1
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{ color: 'var(--text)' }}
          >
            꿈번호 생성기
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            어젯밤 꿈을 로또 번호로 바꿔보세요
          </p>
        </div>

        <UsageLimitBanner feature="dream" />

        {/* ─── Search Section ─── */}
        <Card variant="glass" padding="lg" className="mb-6">
          <div className="space-y-5">
            {/* Search Input */}
            <div className="relative">
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: 'var(--text)' }}
              >
                꿈 키워드 검색
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Search className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="꿈에서 본 것을 입력하세요 (예: 돼지, 용, 물)"
                  disabled={selectedKeywords.length >= MAX_KEYWORDS}
                  className={cn(
                    'w-full pl-11 pr-5 py-4 rounded-xl text-base font-medium',
                    'transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-purple-400/50',
                    selectedKeywords.length >= MAX_KEYWORDS && 'opacity-50 cursor-not-allowed'
                  )}
                  style={{
                    backgroundColor: 'var(--bg)',
                    color: 'var(--text)',
                    border: '2px solid var(--border)',
                  }}
                />
              </div>

              {/* Autocomplete Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-50 w-full mt-2 rounded-xl overflow-hidden shadow-xl"
                  style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {suggestions.map((kw) => (
                    <button
                      key={kw.keyword}
                      className={cn(
                        'w-full px-4 py-3 text-left flex items-center gap-3',
                        'transition-colors duration-150',
                        'hover:bg-purple-50 dark:hover:bg-purple-500/10'
                      )}
                      style={{ color: 'var(--text)' }}
                      onClick={() => addKeyword(kw)}
                    >
                      <span>{categoryIcons[kw.category] || <Eye className="w-4 h-4 inline-block" />}</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold">{kw.keyword}</span>
                        <span
                          className="ml-2 text-xs"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          {kw.category}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {kw.numbers.map((n) => (
                          <span
                            key={n}
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold"
                            style={{
                              backgroundColor: getBallHexColor(n) + '22',
                              color: getBallHexColor(n),
                            }}
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedKeywords.length >= MAX_KEYWORDS && (
                <p className="text-xs mt-2 font-medium" style={{ color: '#A855F7' }}>
                  최대 {MAX_KEYWORDS}개 키워드까지 선택할 수 있습니다.
                </p>
              )}
            </div>

            {/* Category Filter Tabs */}
            <div>
              <p
                className="text-xs font-medium mb-2"
                style={{ color: 'var(--text-tertiary)' }}
              >
                카테고리
              </p>
              <div className="flex flex-wrap gap-2">
                {DREAM_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium',
                      'transition-all duration-200',
                      'flex items-center gap-1'
                    )}
                    style={{
                      backgroundColor:
                        activeCategory === cat
                          ? '#7C3AED'
                          : 'var(--surface-hover)',
                      color:
                        activeCategory === cat
                          ? 'white'
                          : 'var(--text-secondary)',
                      border:
                        activeCategory === cat
                          ? '1px solid #7C3AED'
                          : '1px solid var(--border)',
                    }}
                  >
                    <span>{categoryIcons[cat]}</span>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Keywords Tag Cloud */}
            <div>
              <p
                className="text-xs font-medium mb-2"
                style={{ color: 'var(--text-tertiary)' }}
              >
                인기 키워드
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_KEYWORDS.map((kw) => {
                  const data = DREAM_KEYWORDS.find((d) => d.keyword === kw);
                  if (!data) return null;
                  const isSelected = selectedKeywords.some(
                    (s) => s.keyword === kw
                  );
                  return (
                    <button
                      key={kw}
                      onClick={() => !isSelected && addKeyword(data)}
                      disabled={
                        isSelected ||
                        selectedKeywords.length >= MAX_KEYWORDS
                      }
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium',
                        'transition-all duration-200',
                        'hover:-translate-y-0.5 hover:shadow-sm',
                        'active:scale-95',
                        'disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none'
                      )}
                      style={{
                        backgroundColor: isSelected
                          ? '#7C3AED'
                          : 'var(--surface-hover)',
                        color: isSelected ? 'white' : 'var(--text-secondary)',
                        border: isSelected
                          ? '1px solid #7C3AED'
                          : '1px solid var(--border)',
                      }}
                    >
                      {categoryIcons[data.category]} {kw}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* ─── Selected Keywords Section ─── */}
        {selectedKeywords.length > 0 && (
          <Card variant="glass" padding="lg" className="mb-6 animate-fadeInUp">
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-sm font-semibold"
                style={{ color: 'var(--text)' }}
              >
                선택한 키워드 ({selectedKeywords.length}/{MAX_KEYWORDS})
              </h3>
              <Button variant="ghost" size="xs" onClick={clearAll}>
                전체 삭제
              </Button>
            </div>

            <div className="space-y-3">
              {selectedKeywords.map((kw) => (
                <div
                  key={kw.keyword}
                  className="flex items-start gap-3 p-3 rounded-xl transition-colors duration-200"
                  style={{
                    backgroundColor: 'var(--surface-hover)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <span className="mt-0.5">{categoryIcons[kw.category]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="font-bold text-sm"
                        style={{ color: 'var(--text)' }}
                      >
                        {kw.keyword}
                      </span>
                      <Badge variant="secondary" size="sm">
                        {kw.category}
                      </Badge>
                    </div>
                    <p
                      className="text-xs leading-relaxed mb-2"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {kw.description}
                    </p>
                    <div className="flex gap-1.5">
                      {kw.numbers.map((n) => (
                        <LottoBall key={n} number={n} size="sm" />
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => removeKeyword(kw.keyword)}
                    className={cn(
                      'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center',
                      'transition-all duration-200',
                      'hover:bg-red-100 hover:text-red-600',
                      'dark:hover:bg-red-500/20 dark:hover:text-red-400'
                    )}
                    style={{ color: 'var(--text-tertiary)' }}
                    aria-label={`${kw.keyword} 제거`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ─── Generated Numbers Section ─── */}
        {generatedNumbers.length > 0 && (
          <div className="space-y-4 animate-fadeInUp" key={`gen-${animateKey}`}>
            {/* Hero card with generated numbers */}
            <div
              className="rounded-2xl p-8 text-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #A855F7, #C084FC)',
              }}
            >
              {/* Decorative circles */}
              <div
                className="absolute -top-10 -right-10 w-36 h-36 rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }}
              />
              <div
                className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }}
              />
              <div
                className="absolute top-4 left-4 w-2 h-2 rounded-full opacity-30"
                style={{ backgroundColor: 'white' }}
              />
              <div
                className="absolute top-12 right-16 w-1.5 h-1.5 rounded-full opacity-20"
                style={{ backgroundColor: 'white' }}
              />
              <div
                className="absolute bottom-6 right-8 w-1 h-1 rounded-full opacity-40"
                style={{ backgroundColor: 'white' }}
              />

              <div className="relative z-10 space-y-4">
                <p className="text-sm text-white/80 font-medium">
                  꿈이 알려준 행운의 번호
                </p>

                <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                  {generatedNumbers.map((num, idx) => (
                    <LottoBall
                      key={`${animateKey}-${num}`}
                      number={num}
                      size="lg"
                      animated
                      delay={idx * 120}
                    />
                  ))}
                </div>

                {generatedNumbers.length < LOTTO_COUNT && (
                  <p className="text-xs text-white/60">
                    {generatedNumbers.length}개 번호 생성됨 (키워드를 더 추가하면 6개까지 채울 수 있습니다)
                  </p>
                )}

                {totalCandidates > LOTTO_COUNT && (
                  <Badge
                    variant="default"
                    className="bg-white/20 text-white border-white/30"
                  >
                    후보 {totalCandidates}개 중 {generatedNumbers.length}개 선택
                  </Badge>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              {totalCandidates > LOTTO_COUNT && (
                <Button
                  variant="outline"
                  onClick={reshuffle}
                  fullWidth
                  icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1 4 1 10 7 10" />
                      <polyline points="23 20 23 14 17 14" />
                      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                    </svg>
                  }
                  className="border-purple-400 text-purple-600 hover:bg-purple-500 hover:text-white dark:border-purple-400 dark:text-purple-300 dark:hover:bg-purple-500 dark:hover:text-white"
                >
                  다시 생성
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={handleCopy}
                fullWidth
                className={totalCandidates <= LOTTO_COUNT ? 'col-span-2' : ''}
                icon={
                  copied ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )
                }
              >
                {copied ? '복사 완료!' : '번호 복사하기'}
              </Button>
            </div>
          </div>
        )}

        {/* ─── Dream Interpretation Section ─── */}
        {selectedKeywords.length > 0 && (
          <Card variant="glass" padding="lg" className="mt-6 mb-6">
            <h3
              className="text-sm font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--text)' }}
            >
              <Moon className="w-4 h-4 inline-block" /> 꿈 해몽 해석
            </h3>
            <div className="space-y-3">
              {selectedKeywords.map((kw, idx) => (
                <div
                  key={kw.keyword}
                  className="flex items-start gap-3 py-3 border-b last:border-b-0"
                  style={{ borderColor: 'var(--border-light)' }}
                >
                  <span
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #7C3AED22, #A855F722)',
                      color: '#7C3AED',
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span
                      className="font-bold text-sm"
                      style={{ color: 'var(--text)' }}
                    >
                      {categoryIcons[kw.category]} {kw.keyword}
                    </span>
                    <p
                      className="text-xs leading-relaxed mt-1"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {kw.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ─── Keyword Browse Section (when nothing selected) ─── */}
        {selectedKeywords.length === 0 && (
          <div className="space-y-4">
            {/* Category filtered keywords */}
            <Card variant="glass" padding="lg">
              <h3
                className="text-sm font-semibold mb-4 flex items-center gap-2"
                style={{ color: 'var(--text)' }}
              >
                <span>{categoryIcons[activeCategory]}</span>
                {activeCategory === '전체' ? '전체 키워드' : `${activeCategory} 키워드`}
                <span
                  className="text-xs font-normal"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  ({filteredKeywords.length}개)
                </span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filteredKeywords.map((kw) => (
                  <button
                    key={kw.keyword}
                    onClick={() => addKeyword(kw)}
                    className={cn(
                      'p-3 rounded-xl text-left',
                      'transition-all duration-200',
                      'hover:-translate-y-0.5 hover:shadow-md',
                      'active:scale-95',
                      'group'
                    )}
                    style={{
                      backgroundColor: 'var(--surface-hover)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span>{categoryIcons[kw.category]}</span>
                      <span
                        className="font-semibold text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors"
                        style={{ color: 'var(--text)' }}
                      >
                        {kw.keyword}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {kw.numbers.map((n) => (
                        <span
                          key={n}
                          className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold"
                          style={{
                            backgroundColor: getBallHexColor(n) + '22',
                            color: getBallHexColor(n),
                          }}
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ─── Empty State ─── */}
        {selectedKeywords.length === 0 && filteredKeywords.length === 0 && (
          <Card variant="glass" className="text-center py-12">
            <div className="space-y-3">
              <span className="block"><Moon className="w-12 h-12 mx-auto" /></span>
              <p
                className="text-lg font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                검색 결과가 없습니다
              </p>
              <p
                className="text-sm"
                style={{ color: 'var(--text-tertiary)' }}
              >
                다른 키워드로 검색해보세요
              </p>
            </div>
          </Card>
        )}

        {/* ─── Info Note ─── */}
        <Card variant="outlined" padding="sm" className="mt-6">
          <div className="space-y-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            <p>* 꿈해몽 번호는 전통 해몽을 참고한 재미 요소입니다.</p>
            <p>* 로또 당첨을 보장하지 않으며, 오락 목적으로 사용하세요.</p>
            <p>* 키워드를 여러 개 선택하면 중복되는 번호에 높은 우선순위가 부여됩니다.</p>
          </div>
        </Card>
      </div>

      <UsageLimitModal
        feature="dream"
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
      />
    </MemberGate>
  );
}
