import { MetadataRoute } from 'next';
import { getAllLottoData } from '@/lib/dataFetcher';
import { getGoogleSitemapEntries } from '@/lib/sitemapEntries';

// 구글·빙 색인 대상 URL만 포함. 템플릿 페이지(번호조합·생일·월별 등)는 /sitemap-naver.xml 참고.
export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allData = await getAllLottoData();
  return getGoogleSitemapEntries(allData);
}
