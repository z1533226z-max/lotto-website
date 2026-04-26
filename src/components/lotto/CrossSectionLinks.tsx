'use client';

import Link from 'next/link';

type Section =
  | 'ending' | 'bonus' | 'sum' | 'birthday' | 'monthly'
  | 'pair' | 'dream' | 'number' | 'round' | 'statistics' | 'pattern' | 'year';

interface SectionInfo {
  key: Section;
  label: string;
  desc: string;
  href: string;
}

const ALL_SECTIONS: SectionInfo[] = [
  { key: 'statistics', label: '종합 통계', desc: '번호별 출현 빈도·패턴 분석', href: '/lotto/statistics' },
  { key: 'dream', label: '꿈번호 생성기', desc: '꿈 해몽으로 행운번호 추천', href: '/lotto/dream' },
  { key: 'pair', label: '번호 궁합 분석', desc: '두 번호의 동시출현 통계', href: '/lotto/pair/7-21' },
  { key: 'birthday', label: '생일 행운번호', desc: '생년월일 기반 번호 추천', href: '/lotto/birthday/01-15' },
  { key: 'monthly', label: '월별 당첨 아카이브', desc: '연월별 당첨번호 모아보기', href: '/lotto/monthly/2026-04' },
  { key: 'ending', label: '끝수 분석', desc: '끝수별 출현 빈도·트렌드', href: '/lotto/ending/3' },
  { key: 'bonus', label: '보너스번호 분석', desc: '보너스번호 출현 통계', href: '/lotto/bonus/7' },
  { key: 'sum', label: '합계 구간 분석', desc: '당첨번호 합계별 출현 분석', href: '/lotto/sum/101-120' },
  { key: 'number', label: '번호별 상세 분석', desc: '1~45 개별 번호 심층 분석', href: '/lotto/number/7' },
  { key: 'year', label: '연도별 분석', desc: '연도별 당첨번호 트렌드', href: '/lotto/year/2025' },
  { key: 'pattern', label: '패턴 분석', desc: '홀짝·고저·연속번호 패턴', href: '/lotto/pattern/odd-even' },
];

interface Props {
  current: Section;
  className?: string;
  theme?: 'dark' | 'light';
}

export default function CrossSectionLinks({ current, className, theme = 'dark' }: Props) {
  const links = ALL_SECTIONS.filter((s) => s.key !== current).slice(0, 6);
  const isDark = theme === 'dark';

  return (
    <div
      className={className}
      style={!isDark ? { backgroundColor: 'var(--card-bg, #ffffff)', border: '1px solid var(--border, #e5e7eb)', borderRadius: '0.75rem', padding: '1.25rem' } : undefined}
    >
      <h2
        className={isDark ? 'text-lg font-bold text-white mb-3' : 'text-lg font-bold mb-3'}
        style={!isDark ? { color: 'var(--text)' } : undefined}
      >
        다른 분석 더보기
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {links.map((s) => (
          <Link
            key={s.key}
            href={s.href}
            className={isDark
              ? 'block p-3 bg-gray-700/40 hover:bg-gray-700/70 rounded-lg transition-colors group'
              : 'block p-3 rounded-lg transition-colors group'}
            style={!isDark ? { backgroundColor: 'var(--bg-secondary, #f3f4f6)' } : undefined}
          >
            <div
              className={isDark ? 'text-sm font-medium text-blue-400 group-hover:text-blue-300' : 'text-sm font-medium'}
              style={!isDark ? { color: 'var(--primary, #2563eb)' } : undefined}
            >
              {s.label}
            </div>
            <div
              className="text-xs mt-0.5"
              style={!isDark ? { color: 'var(--text-tertiary, #9ca3af)' } : { color: 'rgb(107 114 128)' }}
            >
              {s.desc}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
