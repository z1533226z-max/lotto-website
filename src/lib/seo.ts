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

/**
 * 하위 페이지 기본 OG 이미지 (루트 app/opengraph-image.tsx가 만드는 1200x630 PNG, CDN 캐시됨).
 * Next.js는 페이지·레이아웃이 openGraph를 새로 정의하면 상위의 images를 물려주지 않으므로
 * openGraph를 정의하는 곳마다 images에 이 값을 넣는다. (상대 경로는 루트 metadataBase로 절대 URL이 됨)
 */
export const DEFAULT_OG_IMAGES = [
  { url: '/opengraph-image', width: 1200, height: 630, alt: '로또킹 - AI 로또번호 추천 서비스' },
];

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

/**
 * 구글에서만 색인 제외(noindex, follow). 네이버(Yeti)·빙 등 나머지 로봇과 방문자에게는 그대로 노출한다.
 * 2026-10-22 마스터 승인(안건2 ③): 꿈해몽(선정 30개 제외)·MBTI·별자리·혈액형 상세는 구글 대상에서만 뺀다.
 */
export const GOOGLE_NOINDEX_ROBOTS: Pick<Metadata, 'robots'> = {
  robots: {
    index: true,
    follow: true,
    googleBot: { index: false, follow: true },
  },
};

/**
 * 구글 색인·구글 사이트맵에 남기는 꿈해몽 키워드 (≤30, 나머지는 GOOGLE_NOINDEX_ROBOTS + 네이버 사이트맵).
 * 선정 기준 (2026-10-22, review177):
 *  1) 상황별 풀이·전용 FAQ로 심화한 고유 본문 (사과·할머니·잉어 — 각 1,200자 이상, 나머지는 약 200자 틀)
 *  2) 실제 수요 기록 (daily_history 상위 페이지 PV: 고양이·감옥 / GSC 노출 키워드: 문어·오리)
 *  3) 사이트가 대표로 내세우는 POPULAR_KEYWORDS 중 본문이 긴 순 23개
 * 여기서 빼고 넣는 것만으로 구글 대상 여부와 두 사이트맵 배치가 함께 바뀐다.
 */
export const GOOGLE_INDEXED_DREAM_KEYWORDS: ReadonlySet<string> = new Set([
  '사과', '할머니', '잉어',
  '고양이', '감옥', '문어', '오리',
  '날다', '돼지', '무지개', '뱀', '돈', '금', '용', '바다', '태양', '물', '보석', '호랑이',
  '아기', '물고기', '불', '꽃', '화장실', '죽음', '결혼하다', '이빨', '도둑', '복권', '임신',
]);

/** 주간분석 회차가 구글/빙 색인 대상(최신 52회)인지 */
export function isIndexableWeeklyAnalysis(round: number, latestRound: number): boolean {
  return latestRound - round < WEEKLY_ANALYSIS_INDEXABLE_COUNT;
}

/** FAQ 한 항목 (화면 표시와 FAQPage JSON-LD가 같은 배열을 쓰도록 공유) */
export interface FaqItem {
  q: string;
  a: string;
}

/** 화면에 보이는 FAQ 목록 그대로 FAQPage JSON-LD를 만든다 (마크업 = 표시 내용) */
export function buildFaqPageJsonLd(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}
