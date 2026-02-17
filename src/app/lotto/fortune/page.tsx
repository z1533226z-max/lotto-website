'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Tabs from '@/components/ui/Tabs';
import { cn } from '@/lib/utils';
import { useUsageLimit, type LimitedFeature } from '@/hooks/useUsageLimit';
import { useAuthSafe } from '@/components/providers/AuthProvider';
import UsageLimitBanner from '@/components/usage/UsageLimitBanner';
import UsageLimitModal from '@/components/usage/UsageLimitModal';
import MemberGate from '@/components/auth/MemberGate';
import { getNextDrawRound } from '@/lib/lottoUtils';

// ============================================
// Seeded random number generator (deterministic)
// ============================================
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// ============================================
// Generate 6 unique lotto numbers from seed
// ============================================
function generateNumbers(seed: number): number[] {
  const rng = seededRandom(seed);
  const numbers: Set<number> = new Set();
  while (numbers.size < 6) {
    const num = Math.floor(rng() * 45) + 1;
    numbers.add(num);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

// ============================================
// Ball color helpers (matching LottoNumbers component)
// ============================================
function getBallHexColor(num: number): string {
  if (num <= 10) return '#FFC107';
  if (num <= 20) return '#2196F3';
  if (num <= 30) return '#FF5722';
  if (num <= 40) return '#9E9E9E';
  return '#4CAF50';
}

function getBallTextHexColor(num: number): string {
  if (num <= 10) return '#333333';
  return '#FFFFFF';
}

// ============================================
// Fortune / personality data
// ============================================
const PERSONALITY_TRAITS = [
  '강한 직감의 소유자입니다. 번호 선택에 자신감을 가지세요!',
  '분석적 사고가 뛰어납니다. 패턴을 잘 읽는 타입이에요.',
  '행운이 따르는 체질입니다. 자동 선택도 좋은 결과를 줄 수 있어요.',
  '인내심이 강한 타입입니다. 꾸준히 도전하면 좋은 결과가 옵니다.',
  '창의적 에너지가 넘칩니다. 남들과 다른 번호 조합을 시도해보세요.',
  '사교적인 성격의 소유자입니다. 공동구매도 좋은 방법이에요.',
  '꼼꼼한 성격입니다. 통계를 활용한 번호 선택이 잘 맞아요.',
  '대범한 성격입니다. 큰 꿈을 꾸는 만큼 행운도 클 수 있어요.',
  '균형 잡힌 감각의 소유자입니다. 홀짝 균형을 맞춰보세요.',
  '끈기가 있는 타입입니다. 같은 번호를 꾸준히 유지해보세요.',
  '호기심이 많은 탐험가 타입입니다. 새로운 번호 조합에 도전해보세요.',
  '감성이 풍부한 타입입니다. 마음이 이끄는 번호를 선택하세요.',
];

const LUCKY_COLORS = [
  { name: '빨간색', code: '#EF4444' },
  { name: '파란색', code: '#3B82F6' },
  { name: '노란색', code: '#EAB308' },
  { name: '초록색', code: '#22C55E' },
  { name: '보라색', code: '#8B5CF6' },
  { name: '주황색', code: '#F97316' },
  { name: '분홍색', code: '#EC4899' },
];

const LUCKY_DIRECTIONS = ['동쪽', '서쪽', '남쪽', '북쪽', '동남쪽', '동북쪽', '서남쪽', '서북쪽'];

const LUCKY_TIMES = [
  '오전 6시~8시',
  '오전 8시~10시',
  '오전 10시~12시',
  '오후 12시~2시',
  '오후 2시~4시',
  '오후 4시~6시',
  '오후 6시~8시',
  '오후 8시~10시',
];

const COMPATIBILITY_MESSAGES = [
  '환상의 조합! 함께 구매하면 행운이 배가됩니다.',
  '좋은 궁합이에요. 서로의 행운을 나누세요!',
  '안정적인 조합입니다. 꾸준히 함께 도전해보세요.',
  '재미있는 에너지가 느껴지는 조합이에요!',
  '서로 보완하는 타입! 부족한 번호를 채워줍니다.',
  '흥미로운 조합이에요. 예상치 못한 행운이 올 수 있어요.',
];

// ============================================
// Fortune Ball component with animation
// ============================================
function FortuneBall({
  number,
  index,
  animate,
}: {
  number: number;
  index: number;
  animate: boolean;
}) {
  const baseColor = getBallHexColor(number);
  const textColor = getBallTextHexColor(number);
  const lighterColor = baseColor + 'CC';

  return (
    <div
      className={cn(
        'w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center',
        'font-bold text-lg sm:text-xl relative select-none',
        'transition-all duration-300 hover:scale-110',
        animate && 'animate-fortune-ball'
      )}
      style={{
        background: `radial-gradient(circle at 35% 30%, ${lighterColor}, ${baseColor} 50%, ${baseColor}99 100%)`,
        color: textColor,
        boxShadow: `0 4px 12px ${baseColor}66, inset 0 -2px 4px ${baseColor}44`,
        ...(animate
          ? {
              animationDelay: `${index * 150}ms`,
              animationFillMode: 'both',
            }
          : {}),
      }}
    >
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          top: '10%',
          left: '15%',
          width: '12px',
          height: '12px',
          background:
            'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)',
        }}
      />
      <span
        className="relative z-10 font-bold"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
      >
        {number}
      </span>
    </div>
  );
}

// ============================================
// Tab 1: Birthday Fortune Numbers
// ============================================
function BirthdayTab({ canUse, recordUsage, auth, onShowLimitModal }: { canUse: (f: LimitedFeature) => boolean; recordUsage: (f: LimitedFeature) => boolean; auth: ReturnType<typeof useAuthSafe>; onShowLimitModal: () => void }) {
  const [birthday, setBirthday] = useState('');
  const [name, setName] = useState('');
  const [result, setResult] = useState<{
    numbers: number[];
    personality: string;
  } | null>(null);
  const [animating, setAnimating] = useState(false);

  const handleGenerate = useCallback(() => {
    if (!birthday) return;

    // Usage limit check
    if (!canUse('fortune')) {
      onShowLimitModal();
      return;
    }

    const dateParts = birthday.replace(/-/g, '');
    let seed = parseInt(dateParts, 10);

    if (name.trim()) {
      seed += hashString(name.trim());
    }

    const numbers = generateNumbers(seed);
    const personalityIndex =
      (parseInt(dateParts.slice(-2), 10) + (name.length || 0)) %
      PERSONALITY_TRAITS.length;

    setAnimating(true);
    setResult({ numbers, personality: PERSONALITY_TRAITS[personalityIndex] });

    setTimeout(() => setAnimating(false), 1500);

    // Record usage
    recordUsage('fortune');

    // 게임화 배지 카운터
    if (typeof window !== 'undefined' && (window as any).__trackAction) {
      (window as any).__trackAction('fortuneGeneration');
    }

    // Server save for members
    if (auth?.user) {
      try {
        fetch('/api/user/numbers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            numbers: [numbers],
            source: 'fortune',
            roundTarget: getNextDrawRound(),
          }),
        });
      } catch (e) {
        console.error('번호 저장 실패:', e);
      }
    }
  }, [birthday, name, canUse, recordUsage, auth, onShowLimitModal]);

  return (
    <div className="space-y-6">
      <Card variant="glass" padding="lg">
        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--text)' }}
            >
              생년월일
            </label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className={cn(
                'w-full px-4 py-3 rounded-xl text-base',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary/50'
              )}
              style={{
                backgroundColor: 'var(--bg)',
                color: 'var(--text)',
                border: '2px solid var(--border)',
              }}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--text)' }}
            >
              이름{' '}
              <span
                className="font-normal text-xs"
                style={{ color: 'var(--text-tertiary)' }}
              >
                (선택사항 - 입력하면 번호에 변화를 줍니다)
              </span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              className={cn(
                'w-full px-4 py-3 rounded-xl text-base',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary/50'
              )}
              style={{
                backgroundColor: 'var(--bg)',
                color: 'var(--text)',
                border: '2px solid var(--border)',
              }}
            />
          </div>

          <Button
            variant="gradient"
            size="lg"
            fullWidth
            onClick={handleGenerate}
            disabled={!birthday}
            icon={<span>&#x2728;</span>}
          >
            행운번호 생성
          </Button>
        </div>
      </Card>

      {result && (
        <div className="space-y-4 animate-fadeInUp">
          <Card
            variant="gradient"
            padding="lg"
            className="text-center"
          >
            <p
              className="text-sm font-medium mb-4"
              style={{ color: 'var(--text-secondary)' }}
            >
              {name ? `${name}님의` : '나의'} 행운번호
            </p>
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-6">
              {result.numbers.map((num, i) => (
                <FortuneBall
                  key={num}
                  number={num}
                  index={i}
                  animate={animating}
                />
              ))}
            </div>
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: 'var(--surface-hover)' }}
            >
              <Badge variant="warning" size="md" className="mb-2">
                운세 분석
              </Badge>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                {result.personality}
              </p>
            </div>
          </Card>

          <Card variant="outlined" padding="sm">
            <p
              className="text-xs text-center"
              style={{ color: 'var(--text-tertiary)' }}
            >
              * 같은 생년월일은 항상 동일한 기본 번호를 생성합니다. 이름을
              입력하면 번호에 변화가 생깁니다.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}

// ============================================
// Tab 2: Today's Fortune Numbers
// ============================================
function TodayTab() {
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const todaySeed = useMemo(() => parseInt(todayStr, 10), [todayStr]);
  const todayNumbers = useMemo(() => generateNumbers(todaySeed), [todaySeed]);

  const tomorrowSeed = useMemo(() => todaySeed + 1, [todaySeed]);
  const tomorrowNumbers = useMemo(
    () => generateNumbers(tomorrowSeed),
    [tomorrowSeed]
  );

  const rng = useMemo(() => seededRandom(todaySeed + 777), [todaySeed]);
  const luckyColor = useMemo(
    () => LUCKY_COLORS[Math.floor(rng() * LUCKY_COLORS.length)],
    [rng]
  );
  const luckyDirection = useMemo(
    () => LUCKY_DIRECTIONS[Math.floor(rng() * LUCKY_DIRECTIONS.length)],
    [rng]
  );
  const luckyTime = useMemo(
    () => LUCKY_TIMES[Math.floor(rng() * LUCKY_TIMES.length)],
    [rng]
  );

  const formattedDate = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  }, []);

  return (
    <div className="space-y-4">
      {/* Today's numbers */}
      <Card variant="gradient" padding="lg" className="text-center">
        <Badge variant="primary" size="md" className="mb-3">
          {formattedDate}
        </Badge>
        <h3
          className="text-lg font-bold mb-4"
          style={{ color: 'var(--text)' }}
        >
          오늘의 운세번호
        </h3>
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-4">
          {todayNumbers.map((num, i) => (
            <FortuneBall key={num} number={num} index={i} animate={false} />
          ))}
        </div>
        <p
          className="text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          매일 자정에 새로운 번호로 변경됩니다
        </p>
      </Card>

      {/* Lucky info */}
      <div className="grid grid-cols-3 gap-3">
        <Card variant="glass" className="text-center">
          <p
            className="text-xs font-medium mb-1"
            style={{ color: 'var(--text-tertiary)' }}
          >
            행운의 색
          </p>
          <div
            className="w-6 h-6 rounded-full mx-auto mb-1"
            style={{ backgroundColor: luckyColor.code }}
          />
          <p
            className="text-sm font-bold"
            style={{ color: 'var(--text)' }}
          >
            {luckyColor.name}
          </p>
        </Card>
        <Card variant="glass" className="text-center">
          <p
            className="text-xs font-medium mb-1"
            style={{ color: 'var(--text-tertiary)' }}
          >
            행운의 방향
          </p>
          <div className="text-xl mb-1">&#x1F9ED;</div>
          <p
            className="text-sm font-bold"
            style={{ color: 'var(--text)' }}
          >
            {luckyDirection}
          </p>
        </Card>
        <Card variant="glass" className="text-center">
          <p
            className="text-xs font-medium mb-1"
            style={{ color: 'var(--text-tertiary)' }}
          >
            행운의 시간
          </p>
          <div className="text-xl mb-1">&#x23F0;</div>
          <p
            className="text-sm font-bold"
            style={{ color: 'var(--text)' }}
          >
            {luckyTime}
          </p>
        </Card>
      </div>

      {/* Tomorrow preview (blurred) */}
      <Card variant="glass" padding="lg" className="text-center relative overflow-hidden">
        <h3
          className="text-base font-bold mb-4"
          style={{ color: 'var(--text)' }}
        >
          내일의 번호 미리보기
        </h3>
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap relative">
          {tomorrowNumbers.map((num) => (
            <div
              key={num}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-bold text-lg"
              style={{
                backgroundColor: 'var(--surface-hover)',
                color: 'var(--text)',
                filter: 'blur(8px)',
                userSelect: 'none',
              }}
            >
              {num}
            </div>
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <Badge variant="warning" size="md">
              내일 자정에 공개됩니다
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ============================================
// Tab 3: Compatibility Numbers
// ============================================
function CompatibilityTab({ canUse, recordUsage, auth, onShowLimitModal }: { canUse: (f: LimitedFeature) => boolean; recordUsage: (f: LimitedFeature) => boolean; auth: ReturnType<typeof useAuthSafe>; onShowLimitModal: () => void }) {
  const [myBirthday, setMyBirthday] = useState('');
  const [partnerBirthday, setPartnerBirthday] = useState('');
  const [result, setResult] = useState<{
    numbers: number[];
    compatibility: number;
    message: string;
  } | null>(null);
  const [animating, setAnimating] = useState(false);

  const handleGenerate = useCallback(() => {
    if (!myBirthday || !partnerBirthday) return;

    // Usage limit check
    if (!canUse('fortune')) {
      onShowLimitModal();
      return;
    }

    const myDate = parseInt(myBirthday.replace(/-/g, ''), 10);
    const partnerDate = parseInt(partnerBirthday.replace(/-/g, ''), 10);

    // Combine both seeds
    const combinedSeed = myDate * 7 + partnerDate * 13;
    const numbers = generateNumbers(combinedSeed);

    // Compatibility percentage (fun, deterministic)
    const rng = seededRandom(combinedSeed + 42);
    const compatibility = Math.floor(rng() * 31) + 70; // 70-100

    const messageIndex =
      (myDate + partnerDate) % COMPATIBILITY_MESSAGES.length;

    setAnimating(true);
    setResult({
      numbers,
      compatibility,
      message: COMPATIBILITY_MESSAGES[messageIndex],
    });

    setTimeout(() => setAnimating(false), 1500);

    // Record usage
    recordUsage('fortune');

    // 게임화 배지 카운터
    if (typeof window !== 'undefined' && (window as any).__trackAction) {
      (window as any).__trackAction('fortuneGeneration');
    }

    // Server save for members
    if (auth?.user) {
      try {
        fetch('/api/user/numbers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            numbers: [numbers],
            source: 'fortune',
            roundTarget: getNextDrawRound(),
          }),
        });
      } catch (e) {
        console.error('번호 저장 실패:', e);
      }
    }
  }, [myBirthday, partnerBirthday, canUse, recordUsage, auth, onShowLimitModal]);

  return (
    <div className="space-y-6">
      <Card variant="glass" padding="lg">
        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--text)' }}
            >
              나의 생일
            </label>
            <input
              type="date"
              value={myBirthday}
              onChange={(e) => setMyBirthday(e.target.value)}
              className={cn(
                'w-full px-4 py-3 rounded-xl text-base',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary/50'
              )}
              style={{
                backgroundColor: 'var(--bg)',
                color: 'var(--text)',
                border: '2px solid var(--border)',
              }}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="flex items-center justify-center">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                color: 'white',
              }}
            >
              &#x2764;
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--text)' }}
            >
              상대방 생일
            </label>
            <input
              type="date"
              value={partnerBirthday}
              onChange={(e) => setPartnerBirthday(e.target.value)}
              className={cn(
                'w-full px-4 py-3 rounded-xl text-base',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary/50'
              )}
              style={{
                backgroundColor: 'var(--bg)',
                color: 'var(--text)',
                border: '2px solid var(--border)',
              }}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <Button
            variant="gradient"
            size="lg"
            fullWidth
            onClick={handleGenerate}
            disabled={!myBirthday || !partnerBirthday}
            icon={<span>&#x1F496;</span>}
          >
            궁합번호 생성
          </Button>
        </div>
      </Card>

      {result && (
        <div className="space-y-4 animate-fadeInUp">
          {/* Compatibility gauge */}
          <div
            className="rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden"
            style={{
              background:
                'linear-gradient(135deg, #D36135, #FF4081)',
            }}
          >
            <div
              className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10"
              style={{
                background:
                  'radial-gradient(circle, white 0%, transparent 70%)',
              }}
            />
            <div className="relative z-10">
              <p className="text-sm text-white/80 font-medium mb-2">
                번호 궁합도
              </p>
              <p className="text-5xl sm:text-6xl font-black text-white mb-2">
                {result.compatibility}%
              </p>
              <p className="text-sm text-white/90">{result.message}</p>
            </div>
          </div>

          {/* Combined numbers */}
          <Card
            variant="gradient"
            padding="lg"
            className="text-center"
          >
            <p
              className="text-sm font-medium mb-4"
              style={{ color: 'var(--text-secondary)' }}
            >
              궁합 행운번호
            </p>
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              {result.numbers.map((num, i) => (
                <FortuneBall
                  key={num}
                  number={num}
                  index={i}
                  animate={animating}
                />
              ))}
            </div>
          </Card>

          <Card variant="outlined" padding="sm">
            <p
              className="text-xs text-center"
              style={{ color: 'var(--text-tertiary)' }}
            >
              * 궁합번호는 재미를 위한 것이며, 실제 당첨과는 관련이
              없습니다.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}

// ============================================
// Main Fortune Page
// ============================================
const TABS = [
  { id: 'birthday', label: '생년월일 행운번호', icon: <span>&#x1F382;</span> },
  { id: 'today', label: '오늘의 운세번호', icon: <span>&#x2B50;</span> },
  { id: 'compatibility', label: '궁합번호', icon: <span>&#x1F495;</span> },
];

export default function FortunePage() {
  const [activeTab, setActiveTab] = useState('birthday');
  const [showLimitModal, setShowLimitModal] = useState(false);
  const { canUse, recordUsage } = useUsageLimit();
  const auth = useAuthSafe();

  return (
    <MemberGate featureName="행운번호 생성기" featureIcon="🍀" featureDesc="생년월일로 나만의 행운 번호를 확인해요">
      <style jsx global>{`
        @keyframes fortuneBallPop {
          0% {
            opacity: 0;
            transform: scale(0.3) rotate(-20deg);
          }
          50% {
            transform: scale(1.15) rotate(5deg);
          }
          70% {
            transform: scale(0.95) rotate(-2deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }
        .animate-fortune-ball {
          animation: fortuneBallPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>

      <Breadcrumb
        items={[
          { label: '홈', href: '/' },
          { label: '행운번호 생성기' },
        ]}
      />

      <div className="max-w-2xl mx-auto">
        {/* Page header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, #E88A6A, #D36135)',
              boxShadow: '0 8px 24px rgba(211, 97, 53, 0.3)',
            }}
          >
            <span className="text-3xl">&#x1F52E;</span>
          </div>
          <h1
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{ color: 'var(--text)' }}
          >
            행운번호 생성기
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            나만의 특별한 행운번호를 만들어보세요
          </p>
        </div>

        <UsageLimitBanner feature="fortune" />

        {/* Tab navigation */}
        <div className="mb-6">
          <Tabs
            tabs={TABS}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="default"
            fullWidth
          />
        </div>

        {/* Tab content */}
        <div role="tabpanel" id={`tabpanel-${activeTab}`}>
          {activeTab === 'birthday' && <BirthdayTab canUse={canUse} recordUsage={recordUsage} auth={auth} onShowLimitModal={() => setShowLimitModal(true)} />}
          {activeTab === 'today' && <TodayTab />}
          {activeTab === 'compatibility' && <CompatibilityTab canUse={canUse} recordUsage={recordUsage} auth={auth} onShowLimitModal={() => setShowLimitModal(true)} />}
        </div>
      </div>

      <UsageLimitModal
        feature="fortune"
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
      />
    </MemberGate>
  );
}
