import type { Metadata } from 'next';

/**
 * 정적 콘텐츠 기준일 (sitemap lastmod용, YYYY-MM-DD).
 * 요청 시각(new Date())을 lastmod로 쓰면 검색엔진이 lastmod 자체를 불신하므로,
 * 해당 페이지 내용을 실제로 고쳤을 때만 값을 갱신한다.
 * 당첨 데이터로 만들어지는 페이지는 이 값 대신 실제 추첨일을 쓴다.
 */
export const CONTENT_DATES = {
  guide: '2026-05-01',
  dream: '2026-07-04',
  zodiac: '2026-05-03',
  mbti: '2026-05-02',
  bloodType: '2026-05-03',
  us: '2026-06-18',
  tools: '2026-03-22', // 계산기·시뮬레이터·운세·판매점·AI적중·커뮤니티
  legal: '2026-03-22', // 이용약관·개인정보처리방침
} as const;

/** 구글/빙 색인을 유지할 최신 주간분석 회차 수 */
export const WEEKLY_ANALYSIS_INDEXABLE_COUNT = 52;

/**
 * 템플릿형 대량 페이지용: Google·Bing에서만 색인 제외(noindex, follow)하고
 * 네이버(Yeti) 등 나머지 검색엔진에는 색인을 그대로 허용한다.
 *
 * 주의: 일반 <meta name="robots" content="noindex">는 네이버 유입까지 끊는다
 * (2026-07 사주 사이트에서 네이버 유입 92% 감소). 반드시 크롤러별 태그만 사용할 것.
 */
export const NAVER_ONLY_ROBOTS: Pick<Metadata, 'robots' | 'other'> = {
  robots: {
    index: true,
    follow: true,
    googleBot: { index: false, follow: true },
  },
  other: { bingbot: 'noindex, follow' },
};

/** 주간분석 회차가 구글/빙 색인 대상(최신 52회)인지 */
export function isIndexableWeeklyAnalysis(round: number, latestRound: number): boolean {
  return latestRound - round < WEEKLY_ANALYSIS_INDEXABLE_COUNT;
}
