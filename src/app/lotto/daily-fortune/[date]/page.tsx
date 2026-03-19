import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  generateDailyFortune,
  formatDateKorean,
  isValidDate,
  getTodayKST,
  ZODIAC_ANIMALS,
  type DailyFortuneItem,
} from '@/lib/dailyFortuneGenerator';
import Breadcrumb from '@/components/layout/Breadcrumb';

// ISR: 1시간 캐시 (오늘 페이지), 과거 페이지는 영구 캐시
export const revalidate = 3600;

function getBallColor(num: number): string {
  if (num <= 10) return '#FFC107';
  if (num <= 20) return '#2196F3';
  if (num <= 30) return '#FF5722';
  if (num <= 40) return '#9E9E9E';
  return '#4CAF50';
}

function getBallTextColor(num: number): string {
  if (num <= 10) return '#333333';
  return '#FFFFFF';
}

function LottoBall({ number }: { number: number }) {
  const bg = getBallColor(number);
  const text = getBallTextColor(number);
  return (
    <span
      className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full font-bold text-base sm:text-lg select-none"
      style={{
        background: `radial-gradient(circle at 35% 30%, ${bg}CC, ${bg} 50%, ${bg}99 100%)`,
        color: text,
        boxShadow: `0 3px 8px ${bg}66`,
      }}
    >
      {number}
    </span>
  );
}

function StarRating({ score }: { score: number }) {
  return (
    <span className="text-lg" aria-label={`행운지수 ${score}점`}>
      {'★'.repeat(score)}{'☆'.repeat(5 - score)}
    </span>
  );
}

function FortuneCard({ item }: { item: DailyFortuneItem }) {
  return (
    <div
      className="rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:scale-[1.01]"
      style={{
        backgroundColor: 'var(--card-bg, #ffffff)',
        border: '1px solid var(--border, #e5e7eb)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      {/* 헤더: 띠 정보 */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{item.animal.emoji}</span>
        <div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
            {item.animal.name}띠
          </h3>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {item.animal.element}
          </span>
        </div>
        <div className="ml-auto text-right">
          <div className="text-xs mb-0.5" style={{ color: 'var(--text-tertiary)' }}>행운지수</div>
          <StarRating score={item.luckyScore} />
        </div>
      </div>

      {/* 행운번호 */}
      <div className="mb-4">
        <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
          🎱 오늘의 행운번호
        </div>
        <div className="flex gap-2 flex-wrap">
          {item.numbers.map((num) => (
            <LottoBall key={num} number={num} />
          ))}
        </div>
      </div>

      {/* 운세 정보 */}
      <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
        <p>🔮 {item.fortuneMessage}</p>
        <p>💰 {item.wealthMessage}</p>
        <div className="flex flex-wrap gap-3 pt-2">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: item.luckyColor.code }}
            />
            {item.luckyColor.name}
          </span>
          <span>🧭 {item.luckyDirection}</span>
          <span>⏰ {item.luckyTime}</span>
        </div>
      </div>
    </div>
  );
}

// 메타데이터 동적 생성
type PageProps = { params: Promise<{ date: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { date } = await params;
  if (!isValidDate(date)) return { title: '잘못된 날짜' };

  const formatted = formatDateKorean(date);
  return {
    title: `${formatted} 띠별 로또 행운번호 - 사주 오행 분석 | 로또킹`,
    description: `${formatted} 12띠별 로또 행운번호입니다. 사주 오행 분석 기반으로 매일 자동 생성되는 행운번호와 총운, 재물운을 확인하세요.`,
    keywords: [`${date} 로또`, '띠별 행운번호', '사주 로또', '오늘의 로또번호', '띠별 운세', '로또 행운번호'],
    openGraph: {
      title: `${formatted} 띠별 로또 행운번호`,
      description: `사주 오행 분석 기반 12띠별 행운번호. 내 띠의 오늘 행운번호를 확인하세요!`,
      url: `https://lotto.gon.ai.kr/lotto/daily-fortune/${date}`,
    },
  };
}

export default async function DailyFortuneDatePage({ params }: PageProps) {
  const { date } = await params;

  if (!isValidDate(date)) {
    notFound();
  }

  // 날짜 이동 헬퍼
  const shiftDate = (d: string, offset: number) => {
    const dt = new Date(d + 'T00:00:00+09:00');
    dt.setDate(dt.getDate() + offset);
    return dt.toISOString().split('T')[0];
  };

  // 미래 날짜는 내일까지만 허용
  const today = getTodayKST();
  const tomorrowStr = shiftDate(today, 1);

  if (date > tomorrowStr) {
    notFound();
  }

  const data = generateDailyFortune(date);
  const isToday = date === today;
  const formatted = formatDateKorean(date);

  // 이전/다음 날짜 계산
  const prevStr = shiftDate(date, -1);
  const nextStr = shiftDate(date, 1);
  const canGoNext = nextStr <= tomorrowStr;

  // 생년별 띠 빠른 참조표 (최근 년도들)
  const currentYear = new Date().getFullYear();
  const yearRange = Array.from({ length: 60 }, (_, i) => currentYear - i);

  // Schema.org 구조화 데이터
  const schemaFAQ = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `${formatted} 로또 행운번호는?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${formatted} 12띠별 행운번호: ${data.fortunes.map(f => `${f.animal.name}띠 [${f.numbers.join(', ')}]`).join(', ')}`,
        },
      },
      {
        '@type': 'Question',
        name: '사주 기반 로또 번호는 어떻게 생성되나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '동양 사주학의 오행(水火木金土) 원리를 기반으로, 각 띠의 속성에 맞는 번호에 가중치를 부여하여 매일 고유한 행운번호를 생성합니다.',
        },
      },
    ],
  };

  const schemaArticle = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${formatted} 띠별 로또 행운번호`,
    description: `사주 오행 분석 기반 12띠별 행운번호`,
    datePublished: date,
    dateModified: date,
    author: { '@type': 'Organization', name: '로또킹' },
    publisher: { '@type': 'Organization', name: '로또킹', url: 'https://lotto.gon.ai.kr' },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFAQ) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaArticle) }}
      />

      <Breadcrumb
        items={[
          { label: '홈', href: '/' },
          { label: '띠별 행운번호', href: '/lotto/daily-fortune' },
          { label: formatted },
        ]}
      />

      {/* 헤더 */}
      <div className="text-center mb-8">
        <h1
          className="text-2xl sm:text-3xl font-bold mb-2"
          style={{ color: 'var(--text)' }}
        >
          🔮 {isToday ? '오늘의' : formatted} 띠별 행운번호
        </h1>
        {isToday && (
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {formatted}
          </p>
        )}
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          사주 오행 분석 기반 · 매일 자정 자동 업데이트
        </p>
      </div>

      {/* 날짜 네비게이션 */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/lotto/daily-fortune/${prevStr}`}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            backgroundColor: 'var(--card-bg)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
          }}
        >
          ← 이전
        </Link>
        {isToday ? (
          <span
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
          >
            오늘
          </span>
        ) : (
          <Link
            href="/lotto/daily-fortune"
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            오늘로
          </Link>
        )}
        {canGoNext ? (
          <Link
            href={`/lotto/daily-fortune/${nextStr}`}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            다음 →
          </Link>
        ) : (
          <span className="px-4 py-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
            다음 →
          </span>
        )}
      </div>

      {/* 12띠 행운번호 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {data.fortunes.map((item) => (
          <FortuneCard key={item.animal.key} item={item} />
        ))}
      </div>

      {/* 내 띠 찾기 */}
      <div
        className="rounded-2xl p-6 mb-8"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border)',
        }}
      >
        <h2
          className="text-lg font-bold mb-4"
          style={{ color: 'var(--text)' }}
        >
          🎯 내 띠 빠르게 찾기 (출생년도)
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 text-sm">
          {ZODIAC_ANIMALS.map((animal) => {
            const years = yearRange.filter(
              (y) => ((y - 4) % 12 + 12) % 12 === ZODIAC_ANIMALS.indexOf(animal)
            ).slice(0, 5);
            return (
              <div
                key={animal.key}
                className="rounded-lg p-2 text-center"
                style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
              >
                <div className="text-xl mb-1">{animal.emoji}</div>
                <div className="font-semibold text-xs" style={{ color: 'var(--text)' }}>
                  {animal.name}띠
                </div>
                <div className="text-[10px] leading-tight mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  {years.join(', ')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 안내 */}
      <div
        className="rounded-2xl p-6 mb-8 text-sm"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border)',
          color: 'var(--text-secondary)',
        }}
      >
        <h2 className="font-bold mb-3" style={{ color: 'var(--text)' }}>
          💡 사주 기반 행운번호란?
        </h2>
        <div className="space-y-2">
          <p>
            동양 사주학의 <strong>오행(水·火·木·金·土)</strong> 원리를 기반으로 합니다.
            12띠 각각의 오행 속성에 맞는 번호에 가중치를 부여하여,
            날짜별로 고유한 행운번호를 생성합니다.
          </p>
          <p>
            예를 들어 쥐띠(水)는 1, 6, 11 등 수(水) 계열 번호가,
            호랑이띠(木)는 3, 8, 13 등 목(木) 계열 번호가 우선 배정됩니다.
          </p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            ※ 본 서비스는 재미와 참고용이며, 실제 당첨을 보장하지 않습니다.
          </p>
        </div>
      </div>

      {/* 관련 페이지 링크 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { href: '/lotto/fortune', label: '🎂 생일 행운번호', desc: '생년월일 기반' },
          { href: '/lotto/dream', label: '🌙 꿈해몽 번호', desc: '꿈 키워드 기반' },
          { href: '/lotto/ai-hits', label: '🤖 AI 추천번호', desc: '패턴 분석 기반' },
          { href: '/lotto/statistics', label: '📊 번호 통계', desc: '역대 전체 분석' },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl p-3 text-center transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="text-lg mb-1">{link.label.split(' ')[0]}</div>
            <div className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
              {link.label.split(' ').slice(1).join(' ')}
            </div>
            <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
              {link.desc}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
