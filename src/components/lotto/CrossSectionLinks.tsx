'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { kstMonthDay, type FreshLinkData } from '@/lib/freshLinks';

type Section =
  | 'ending' | 'bonus' | 'sum' | 'birthday' | 'monthly'
  | 'pair' | 'dream' | 'number' | 'round' | 'statistics' | 'pattern' | 'year'
  | 'mbti' | 'zodiac' | 'blood-type' | 'frequency' | 'weekly';

interface SectionLink {
  key: Section;
  label: string;
  desc: string;
  href: string;
}

const FreshLinkContext = createContext<FreshLinkData | null>(null);

/**
 * 페이지(서버 컴포넌트)에서 getFreshLinkData(allData) 결과를 내려주면
 * 하위의 CrossSectionLinks가 최신 회차·주간분석·오늘 생일·이번 달 링크를 보여준다.
 */
export function FreshLinksProvider({ value, children }: { value: FreshLinkData | null; children: ReactNode }) {
  return <FreshLinkContext.Provider value={value}>{children}</FreshLinkContext.Provider>;
}

/** 항상 존재하는 대표 URL (404 없음). 앞쪽일수록 우선 노출 */
const EVERGREEN: SectionLink[] = [
  { key: 'statistics', label: '종합 통계', desc: '번호별 출현 빈도·패턴 분석', href: '/lotto/statistics' },
  { key: 'dream', label: '꿈번호 생성기', desc: '꿈 해몽으로 행운번호 추천', href: '/lotto/dream' },
  { key: 'pair', label: '번호 궁합 분석', desc: '두 번호의 동시출현 통계', href: '/lotto/pair/7-21' },
  { key: 'number', label: '번호별 상세 분석', desc: '1~45 개별 번호 심층 분석', href: '/lotto/number/7' },
  { key: 'pattern', label: '패턴 분석', desc: '홀짝·고저·연속번호 패턴', href: '/lotto/pattern/odd-even' },
  { key: 'frequency', label: '빈도 랭킹', desc: '핫넘버·콜드넘버·이월번호 순위', href: '/lotto/frequency/all' },
  { key: 'ending', label: '끝수 분석', desc: '끝수별 출현 빈도·트렌드', href: '/lotto/ending/3' },
  { key: 'bonus', label: '보너스번호 분석', desc: '보너스번호 출현 통계', href: '/lotto/bonus/7' },
  { key: 'sum', label: '합계 구간 분석', desc: '당첨번호 합계별 출현 분석', href: '/lotto/sum/131-145' },
  { key: 'mbti', label: 'MBTI 행운번호', desc: 'MBTI 성격유형별 번호 추천', href: '/lotto/mbti' },
  { key: 'zodiac', label: '별자리 행운번호', desc: '12별자리 맞춤 번호 추천', href: '/lotto/zodiac' },
  { key: 'blood-type', label: '혈액형 행운번호', desc: 'A·B·O·AB형 맞춤 번호', href: '/lotto/blood-type' },
];

/** 최신 데이터가 없을 때(Provider 없음) 쓰는 고정 링크 — 모두 실제 존재하는 페이지 */
const FALLBACK_DATED: SectionLink[] = [
  { key: 'birthday', label: '생일 행운번호', desc: '생년월일 기반 번호 추천', href: '/lotto/birthday/01-15' },
  { key: 'monthly', label: '월별 당첨 아카이브', desc: '연월별 당첨번호 모아보기', href: '/lotto/monthly/2026-04' },
  { key: 'year', label: '연도별 분석', desc: '연도별 당첨번호 트렌드', href: '/lotto/year/2025' },
];

function buildFreshLinks(d: FreshLinkData, todayMonthDay: string): { fresh: SectionLink[]; year: SectionLink } {
  const [y, m, day] = d.latestDrawDate.split('-');
  const [tm, td] = todayMonthDay.split('-');
  return {
    fresh: [
      { key: 'round', label: `${d.latestRound}회 당첨번호`, desc: `${Number(m)}월 ${Number(day)}일 추첨 결과`, href: `/lotto/${d.latestRound}` },
      { key: 'weekly', label: `${d.latestRound}회 주간 분석`, desc: '핫·콜드넘버와 패턴 요약', href: `/lotto/analysis/weekly/${d.latestRound}` },
      { key: 'birthday', label: `${Number(tm)}월 ${Number(td)}일 생일 번호`, desc: '생일별 맞춤 행운번호', href: `/lotto/birthday/${todayMonthDay}` },
      { key: 'monthly', label: `${y}년 ${Number(m)}월 당첨번호`, desc: '월별 추첨 결과 모아보기', href: `/lotto/monthly/${y}-${m}` },
    ],
    year: { key: 'year', label: `${y}년 당첨번호 분석`, desc: '연도별 당첨번호 트렌드', href: `/lotto/year/${y}` },
  };
}

const MAX_LINKS = 6;
const SECTION_ORDER: Section[] = [
  'statistics', 'dream', 'pair', 'number', 'pattern', 'frequency', 'ending', 'bonus', 'sum',
  'mbti', 'zodiac', 'blood-type', 'birthday', 'monthly', 'year', 'round', 'weekly',
];

interface Props {
  current: Section;
  className?: string;
  theme?: 'dark' | 'light';
}

export default function CrossSectionLinks({ current, className, theme = 'dark' }: Props) {
  const freshData = useContext(FreshLinkContext);
  const pathname = usePathname();

  // 서버 HTML은 생성 시점의 KST 날짜. ISR 캐시가 하루를 넘겨도 방문자에게는 '오늘' 생일 링크를 보여준다.
  const [todayMonthDay, setTodayMonthDay] = useState(freshData?.todayMonthDay ?? '');
  useEffect(() => {
    if (!freshData) return;
    const now = kstMonthDay();
    if (now !== freshData.todayMonthDay) setTodayMonthDay(now);
  }, [freshData]);

  const built = freshData ? buildFreshLinks(freshData, todayMonthDay) : null;
  // 최신 링크는 지금 보고 있는 그 페이지만 빼고 전부 노출
  const fresh = built ? built.fresh.filter((s) => s.href !== pathname) : [];

  const coveredKeys = new Set<Section>([current, ...fresh.map((s) => s.key)]);
  const pool = [...EVERGREEN, ...(built ? [built.year] : FALLBACK_DATED)]
    .filter((s) => !coveredKeys.has(s.key) && s.href !== pathname);
  // 섹션마다 다른 고정 링크가 보이도록 현재 섹션 위치만큼 회전 (전 페이지가 같은 2~6개만 가리키지 않게)
  const offset = pool.length > 0 ? Math.max(0, SECTION_ORDER.indexOf(current)) % pool.length : 0;
  const rotated = [...pool.slice(offset), ...pool.slice(0, offset)];
  const links = [...fresh, ...rotated].slice(0, MAX_LINKS);
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
          <a
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
          </a>
        ))}
      </div>
    </div>
  );
}
