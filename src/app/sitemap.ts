import { MetadataRoute } from 'next';
import { REAL_LOTTO_DATA } from '@/data/realLottoData';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://lotto.gon.ai.kr';

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/lotto/list`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/lotto/recent`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/lotto/statistics`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/lotto/calculator`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/lotto/rankings`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/lotto/numbers`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/lotto/ai-hits`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  const roundPages: MetadataRoute.Sitemap = REAL_LOTTO_DATA.map(d => ({
    url: `${baseUrl}/lotto/${d.round}`,
    lastModified: new Date(d.drawDate),
    changeFrequency: 'never' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...roundPages];
}
