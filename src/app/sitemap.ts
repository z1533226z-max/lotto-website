import { MetadataRoute } from 'next';
import { getAllLottoData } from '@/lib/dataFetcher';
import { DREAM_KEYWORDS } from '@/data/dreamNumbers';

const STATIC_DATE = new Date();
const DREAM_DATE = new Date('2026-03-15');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://lotto.gon.ai.kr';
  const allData = await getAllLottoData();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/lotto/list`, lastModified: STATIC_DATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/lotto/recent`, lastModified: STATIC_DATE, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/lotto/statistics`, lastModified: STATIC_DATE, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/lotto/calculator`, lastModified: STATIC_DATE, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/lotto/rankings`, lastModified: STATIC_DATE, changeFrequency: 'weekly', priority: 0.7 },

    { url: `${baseUrl}/lotto/guide`, lastModified: STATIC_DATE, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/lotto/simulator`, lastModified: STATIC_DATE, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/lotto/fortune`, lastModified: DREAM_DATE, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/lotto/dream`, lastModified: DREAM_DATE, changeFrequency: 'monthly', priority: 0.7 },

    { url: `${baseUrl}/lotto/analysis/weekly`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/lotto/ai-hits`, lastModified: STATIC_DATE, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/lotto/stores`, lastModified: STATIC_DATE, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/community`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 },
    { url: `${baseUrl}/terms`, lastModified: STATIC_DATE, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: STATIC_DATE, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // 최신 100회차는 priority 0.8 (크롤 우선순위 강화), 나머지는 0.6
  const latestRoundForPriority = allData.length > 0 ? allData[allData.length - 1].round : 0;
  const roundPages: MetadataRoute.Sitemap = allData.map(d => ({
    url: `${baseUrl}/lotto/${d.round}`,
    lastModified: new Date(d.drawDate),
    changeFrequency: (latestRoundForPriority - d.round < 10 ? 'weekly' : 'never') as 'weekly' | 'never',
    priority: latestRoundForPriority - d.round < 100 ? 0.8 : 0.6,
  }));

  // 번호별 분석 페이지 (1~45번)
  const numberPages: MetadataRoute.Sitemap = Array.from({ length: 45 }, (_, i) => ({
    url: `${baseUrl}/lotto/number/${i + 1}`,
    lastModified: STATIC_DATE,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 연도별 분석 페이지 (2002~현재)
  const currentYear = new Date().getFullYear();
  const yearPages: MetadataRoute.Sitemap = [];
  for (let y = 2002; y <= currentYear; y++) {
    yearPages.push({
      url: `${baseUrl}/lotto/year/${y}`,
      lastModified: y === currentYear ? new Date() : STATIC_DATE,
      changeFrequency: y === currentYear ? 'weekly' as const : 'yearly' as const,
      priority: y === currentYear ? 0.8 : 0.6,
    });
  }

  // 꿈해몽 개별 페이지
  const dreamPages: MetadataRoute.Sitemap = DREAM_KEYWORDS.map(d => ({
    url: `${baseUrl}/lotto/dream/${encodeURIComponent(d.keyword)}`,
    lastModified: DREAM_DATE,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // 패턴 분석 페이지
  const patternTypes = ['odd-even', 'high-low', 'sum-range', 'consecutive', 'section', 'ending-number', 'gap', 'ac-value'];
  const patternPages: MetadataRoute.Sitemap = patternTypes.map(type => ({
    url: `${baseUrl}/lotto/pattern/${type}`,
    lastModified: STATIC_DATE,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 띠별 행운번호 페이지 (최근 30일 + 오늘)
  const dailyFortunePages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/lotto/daily-fortune`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ];
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dailyFortunePages.push({
      url: `${baseUrl}/lotto/daily-fortune/${dateStr}`,
      lastModified: i === 0 ? new Date() : d,
      changeFrequency: i === 0 ? 'daily' as const : 'never' as const,
      priority: i === 0 ? 0.9 : 0.6,
    });
  }

  // 주간분석 회차별 아카이브 (11회~최신회차 전체)
  const latestRound = allData[allData.length - 1]?.round ?? 0;
  const weeklyArchivePages: MetadataRoute.Sitemap = [];
  for (let r = latestRound; r >= 11; r--) {
    const roundData = allData.find(d => d.round === r);
    const isRecent = latestRound - r < 52;
    weeklyArchivePages.push({
      url: `${baseUrl}/lotto/analysis/weekly/${r}`,
      lastModified: roundData ? new Date(roundData.drawDate) : STATIC_DATE,
      changeFrequency: isRecent ? 'weekly' as const : 'never' as const,
      priority: isRecent ? 0.6 : 0.4,
    });
  }

  // 번호 조합(pair) 분석 페이지 (45C2 = 990개)
  const pairPages: MetadataRoute.Sitemap = [];
  for (let i = 1; i <= 44; i++) {
    for (let j = i + 1; j <= 45; j++) {
      pairPages.push({
        url: `${baseUrl}/lotto/pair/${i}-${j}`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      });
    }
  }

  // 월별 아카이브 페이지 (2002-12 ~ 현재)
  const monthSet = new Set<string>();
  for (const d of allData) {
    monthSet.add(d.drawDate.substring(0, 7));
  }
  const monthlyPages: MetadataRoute.Sitemap = Array.from(monthSet).sort().map(ym => {
    const ymYear = parseInt(ym.substring(0, 4));
    const isCurrentMonth = ym === `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    return {
      url: `${baseUrl}/lotto/monthly/${ym}`,
      lastModified: isCurrentMonth ? new Date() : STATIC_DATE,
      changeFrequency: isCurrentMonth ? 'weekly' as const : 'yearly' as const,
      priority: ymYear === currentYear ? 0.7 : 0.5,
    };
  });

  // 생일 행운번호 페이지 (366일)
  const birthdayPages: MetadataRoute.Sitemap = [];
  const daysPerMonth = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  for (let m = 1; m <= 12; m++) {
    for (let d = 1; d <= daysPerMonth[m]; d++) {
      birthdayPages.push({
        url: `${baseUrl}/lotto/birthday/${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      });
    }
  }

  // 끝수 분석 페이지 (0~9)
  const endingDigitPages: MetadataRoute.Sitemap = Array.from({ length: 10 }, (_, i) => ({
    url: `${baseUrl}/lotto/ending/${i}`,
    lastModified: STATIC_DATE,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...dailyFortunePages, ...numberPages, ...pairPages, ...birthdayPages, ...monthlyPages, ...yearPages, ...dreamPages, ...patternPages, ...endingDigitPages, ...weeklyArchivePages, ...roundPages];
}
