import type { MetadataRoute } from 'next';
import type { LottoResult } from '@/types/lotto';
import { DREAM_KEYWORDS } from '@/data/dreamNumbers';
import { getAllGuideSlugs } from '@/data/guideArticles';
import { MBTI_TYPES } from '@/data/mbtiLotto';
import { ZODIAC_IDS } from '@/data/zodiacLotto';
import { BLOOD_TYPE_IDS } from '@/data/bloodTypeLotto';
import { getAllUsGuideSlugs } from '@/data/usGuideArticles';
import { getTodayKST, shiftDateStr, DAILY_FORTUNE_FIRST_DATE } from '@/lib/dailyFortuneGenerator';
import { CONTENT_DATES, isIndexableWeeklyAnalysis } from '@/lib/seo';

/**
 * 사이트맵 2종
 * - /sitemap.xml        : 구글·빙에 색인시키고 싶은 URL만 (robots.txt에 등록)
 * - /sitemap-naver.xml  : 구글·빙에는 noindex(googlebot/bingbot)인 템플릿 페이지 — 네이버 서치어드바이저에 수동 제출용
 *
 * lastmod는 실제 값만 사용: 당첨 데이터 기반 페이지는 해당(또는 최신) 추첨일, 정적 콘텐츠는 CONTENT_DATES.
 */

export const BASE_URL = 'https://lotto.gon.ai.kr';

type Entry = MetadataRoute.Sitemap[number];

const FREQUENCY_PERIODS = ['all', 'recent-10', 'recent-20', 'recent-50', 'recent-100', '2026', '2025', '2024', '2023', '2022', '2021', '2020'];
const PATTERN_TYPES = ['odd-even', 'high-low', 'sum-range', 'consecutive', 'section', 'ending-number', 'gap', 'ac-value'];
const SUM_RANGE_SLUGS = ['21-70', '71-85', '86-100', '101-115', '116-130', '131-145', '146-160', '161-175', '176-190', '191-205', '206-220', '221-235', '236-255'];
const STATS_CATEGORIES: { category: string; values: string[] }[] = [
  { category: 'odd-even', values: ['0-6', '1-5', '2-4', '3-3', '4-2', '5-1', '6-0'] },
  { category: 'high-low', values: ['0-6', '1-5', '2-4', '3-3', '4-2', '5-1', '6-0'] },
  { category: 'ac', values: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] },
  { category: 'consecutive', values: ['0', '1', '2', '3', '4'] },
];

function entry(path: string, lastModified: string, changeFrequency: Entry['changeFrequency'], priority: number): Entry {
  return { url: `${BASE_URL}${path}`, lastModified, changeFrequency, priority };
}

/** 기간(접두사)별 마지막 추첨일. 예: lastDrawIn(data, '2025') / lastDrawIn(data, '2025-03') */
function lastDrawIn(allData: LottoResult[], prefix: string): string | undefined {
  for (let i = allData.length - 1; i >= 0; i--) {
    if (allData[i].drawDate.startsWith(prefix)) return allData[i].drawDate;
  }
  return undefined;
}

function dataContext(allData: LottoResult[]) {
  const latest = allData[allData.length - 1];
  const latestDraw = latest?.drawDate ?? CONTENT_DATES.tools;
  const latestRound = latest?.round ?? 0;
  const latestYear = Number(latestDraw.slice(0, 4));
  return { latestDraw, latestRound, latestYear };
}

/** 구글·빙 색인 대상 URL (/sitemap.xml) */
export function getGoogleSitemapEntries(allData: LottoResult[], today: string = getTodayKST()): MetadataRoute.Sitemap {
  const { latestDraw, latestRound, latestYear } = dataContext(allData);
  const D = CONTENT_DATES;

  const hubs: Entry[] = [
    entry('', latestDraw, 'daily', 1.0),
    entry('/lotto/list', latestDraw, 'weekly', 0.9),
    entry('/lotto/recent', latestDraw, 'weekly', 0.8),
    entry('/lotto/statistics', latestDraw, 'weekly', 0.8),
    entry('/lotto/frequency', latestDraw, 'weekly', 0.7),
    entry('/lotto/rankings', latestDraw, 'weekly', 0.7),
    entry('/lotto/analysis/weekly', latestDraw, 'weekly', 0.8),
    entry('/lotto/ai-hits', latestDraw, 'weekly', 0.7),
    entry('/lotto/guide', D.guide, 'monthly', 0.6),
    entry('/lotto/dream', D.dream, 'monthly', 0.7),
    entry('/lotto/fortune', D.tools, 'monthly', 0.7),
    entry('/lotto/calculator', D.tools, 'monthly', 0.7),
    entry('/lotto/simulator', D.tools, 'monthly', 0.6),
    entry('/lotto/stores', D.tools, 'weekly', 0.7),
    entry('/lotto/mbti', D.mbti, 'monthly', 0.7),
    entry('/lotto/zodiac', D.zodiac, 'monthly', 0.7),
    entry('/lotto/blood-type', D.bloodType, 'monthly', 0.7),
    entry('/community', D.tools, 'daily', 0.6),
    entry('/terms', D.legal, 'yearly', 0.3),
    entry('/privacy', D.legal, 'yearly', 0.3),
  ];

  // 띠별 행운번호: 오늘 날짜만. 허브(/lotto/daily-fortune)는 오늘 날짜로 리다이렉트만 하므로 제외,
  // 지난 날짜는 구글·빙 noindex라 네이버 사이트맵에 둔다.
  const dailyFortune = entry(`/lotto/daily-fortune/${today}`, today, 'daily', 0.9);

  const guides = getAllGuideSlugs().map(slug => entry(`/lotto/guide/${slug}`, D.guide, 'monthly', 0.7));

  const dreams = DREAM_KEYWORDS.map(d =>
    entry(`/lotto/dream/${encodeURIComponent(d.keyword)}`, D.dream, 'monthly', 0.6)
  );

  const numbers = Array.from({ length: 45 }, (_, i) => entry(`/lotto/number/${i + 1}`, latestDraw, 'weekly', 0.7));

  const years: Entry[] = [];
  for (let y = 2002; y <= latestYear; y++) {
    const isCurrent = y === latestYear;
    years.push(entry(`/lotto/year/${y}`, lastDrawIn(allData, String(y)) ?? latestDraw, isCurrent ? 'weekly' : 'yearly', isCurrent ? 0.8 : 0.6));
  }

  const frequency = FREQUENCY_PERIODS.map(period => {
    const isYear = /^\d{4}$/.test(period);
    const isPastYear = isYear && Number(period) < latestYear;
    const lastmod = isYear ? (lastDrawIn(allData, period) ?? latestDraw) : latestDraw;
    return entry(`/lotto/frequency/${period}`, lastmod, isPastYear ? 'yearly' : 'weekly', period === 'all' ? 0.8 : 0.7);
  });

  const patterns = PATTERN_TYPES.map(type => entry(`/lotto/pattern/${type}`, latestDraw, 'weekly', 0.7));

  const mbti = MBTI_TYPES.map(type => entry(`/lotto/mbti/${type.toLowerCase()}`, D.mbti, 'monthly', 0.6));
  const zodiac = ZODIAC_IDS.map(sign => entry(`/lotto/zodiac/${sign}`, D.zodiac, 'monthly', 0.6));
  const bloodType = BLOOD_TYPE_IDS.map(type => entry(`/lotto/blood-type/${type}`, D.bloodType, 'monthly', 0.6));

  // 주간분석: 최신 52회만
  const weekly: Entry[] = [];
  for (let i = allData.length - 1; i >= 0; i--) {
    const d = allData[i];
    if (d.round < 11 || !isIndexableWeeklyAnalysis(d.round, latestRound)) break;
    weekly.push(entry(`/lotto/analysis/weekly/${d.round}`, d.drawDate, 'never', 0.6));
  }

  // 회차별 당첨번호 (최신 100회 우선순위 강화)
  const rounds = allData.map(d =>
    entry(
      `/lotto/${d.round}`,
      d.drawDate,
      latestRound - d.round < 10 ? 'weekly' : 'never',
      latestRound - d.round < 100 ? 0.8 : 0.6
    )
  );

  const us: Entry[] = [
    entry('/us', D.us, 'weekly', 0.9),
    entry('/us/powerball', D.us, 'weekly', 0.85),
    entry('/us/powerball/odds', D.us, 'monthly', 0.7),
    entry('/us/powerball/generator', D.us, 'monthly', 0.75),
    entry('/us/mega-millions', D.us, 'weekly', 0.85),
    entry('/us/mega-millions/odds', D.us, 'monthly', 0.7),
    entry('/us/mega-millions/generator', D.us, 'monthly', 0.75),
    entry('/us/privacy', D.us, 'yearly', 0.3),
    entry('/us/terms', D.us, 'yearly', 0.3),
    entry('/us/responsible-gambling', D.us, 'yearly', 0.5),
    entry('/us/guide', D.us, 'weekly', 0.85),
    ...getAllUsGuideSlugs().map(slug => entry(`/us/guide/${slug}`, D.us, 'monthly', 0.75)),
  ];

  return [
    ...hubs, dailyFortune, ...guides, ...dreams, ...numbers, ...years, ...frequency, ...patterns,
    ...mbti, ...zodiac, ...bloodType, ...weekly, ...rounds, ...us,
  ];
}

/** 구글·빙 noindex 템플릿 페이지 (/sitemap-naver.xml, 네이버 서치어드바이저 수동 제출용) */
export function getNaverSitemapEntries(allData: LottoResult[], today: string = getTodayKST()): MetadataRoute.Sitemap {
  const { latestDraw, latestRound } = dataContext(allData);

  const pairs: Entry[] = [];
  for (let i = 1; i <= 44; i++) {
    for (let j = i + 1; j <= 45; j++) {
      pairs.push(entry(`/lotto/pair/${i}-${j}`, latestDraw, 'weekly', 0.6));
    }
  }

  const birthdays: Entry[] = [];
  const daysPerMonth = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  for (let m = 1; m <= 12; m++) {
    for (let d = 1; d <= daysPerMonth[m]; d++) {
      const md = `${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      birthdays.push(entry(`/lotto/birthday/${md}`, latestDraw, 'monthly', 0.6));
    }
  }

  const months = Array.from(new Set(allData.map(d => d.drawDate.substring(0, 7)))).sort();
  const monthly = months.map(ym => {
    const lastmod = lastDrawIn(allData, ym) ?? latestDraw;
    const isLatestMonth = latestDraw.startsWith(ym);
    return entry(`/lotto/monthly/${ym}`, lastmod, isLatestMonth ? 'weekly' : 'yearly', 0.5);
  });

  // 주간분석 아카이브: 최신 52회 이전 회차
  const weeklyArchive = allData
    .filter(d => d.round >= 11 && !isIndexableWeeklyAnalysis(d.round, latestRound))
    .reverse()
    .map(d => entry(`/lotto/analysis/weekly/${d.round}`, d.drawDate, 'never', 0.4));

  const endings = Array.from({ length: 10 }, (_, i) => entry(`/lotto/ending/${i}`, latestDraw, 'weekly', 0.6));
  const bonuses = Array.from({ length: 45 }, (_, i) => entry(`/lotto/bonus/${i + 1}`, latestDraw, 'weekly', 0.6));
  const sums = SUM_RANGE_SLUGS.map(slug => entry(`/lotto/sum/${slug}`, latestDraw, 'weekly', 0.6));
  const stats = STATS_CATEGORIES.flatMap(sc =>
    sc.values.map(v => entry(`/lotto/stats/${sc.category}/${v}`, latestDraw, 'weekly', 0.6))
  );

  // 띠별 행운번호 지난 날짜 전체 (DAILY_FORTUNE_FIRST_DATE ~ 어제, 최신순)
  const pastFortunes: Entry[] = [];
  for (let date = shiftDateStr(today, -1); date >= DAILY_FORTUNE_FIRST_DATE; date = shiftDateStr(date, -1)) {
    pastFortunes.push(entry(`/lotto/daily-fortune/${date}`, date, 'never', 0.5));
  }

  return [...pairs, ...birthdays, ...monthly, ...weeklyArchive, ...endings, ...bonuses, ...sums, ...stats, ...pastFortunes];
}

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

/** MetadataRoute.Sitemap → sitemap XML 문자열 (route handler용) */
export function renderSitemapXml(entries: MetadataRoute.Sitemap): string {
  const body = entries
    .map(e => {
      const lastmod = e.lastModified instanceof Date ? e.lastModified.toISOString() : e.lastModified;
      return [
        '<url>',
        `<loc>${escapeXml(e.url)}</loc>`,
        lastmod ? `<lastmod>${escapeXml(lastmod)}</lastmod>` : '',
        e.changeFrequency ? `<changefreq>${e.changeFrequency}</changefreq>` : '',
        e.priority !== undefined ? `<priority>${e.priority}</priority>` : '',
        '</url>',
      ].join('');
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}
