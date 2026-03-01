import { MetadataRoute } from 'next';
import { REAL_LOTTO_DATA } from '@/data/realLottoData';
import { DREAM_KEYWORDS } from '@/data/dreamNumbers';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://lotto.gon.ai.kr';

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/lotto/list`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/lotto/recent`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/lotto/statistics`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/lotto/calculator`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/lotto/rankings`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },

    { url: `${baseUrl}/lotto/ai-hits`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/lotto/stores`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/community`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  const roundPages: MetadataRoute.Sitemap = REAL_LOTTO_DATA.map(d => ({
    url: `${baseUrl}/lotto/${d.round}`,
    lastModified: new Date(d.drawDate),
    changeFrequency: 'never' as const,
    priority: 0.6,
  }));

  // 번호별 분석 페이지 (1~45번)
  const numberPages: MetadataRoute.Sitemap = Array.from({ length: 45 }, (_, i) => ({
    url: `${baseUrl}/lotto/number/${i + 1}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 연도별 분석 페이지 (2002~현재)
  const currentYear = new Date().getFullYear();
  const yearPages: MetadataRoute.Sitemap = [];
  for (let y = 2002; y <= currentYear; y++) {
    yearPages.push({
      url: `${baseUrl}/lotto/year/${y}`,
      lastModified: new Date(),
      changeFrequency: y === currentYear ? 'weekly' as const : 'yearly' as const,
      priority: y === currentYear ? 0.8 : 0.6,
    });
  }

  // 꿈해몽 개별 페이지
  const dreamPages: MetadataRoute.Sitemap = DREAM_KEYWORDS.map(d => ({
    url: `${baseUrl}/lotto/dream/${encodeURIComponent(d.keyword)}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // 패턴 분석 페이지
  const patternTypes = ['odd-even', 'high-low', 'sum-range', 'consecutive', 'section', 'ending-number', 'gap', 'ac-value'];
  const patternPages: MetadataRoute.Sitemap = patternTypes.map(type => ({
    url: `${baseUrl}/lotto/pattern/${type}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...numberPages, ...yearPages, ...dreamPages, ...patternPages, ...roundPages];
}
