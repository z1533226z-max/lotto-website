import { getAllLottoData } from '@/lib/dataFetcher';
import { getNaverSitemapEntries, renderSitemapXml } from '@/lib/sitemapEntries';

// 네이버 서치어드바이저 수동 제출용 사이트맵 (robots.txt에는 등록하지 않음).
// 구글·빙에는 noindex(googlebot/bingbot)로 내려가는 템플릿 페이지 목록.
export const revalidate = 3600;

export async function GET() {
  const allData = await getAllLottoData();
  const xml = renderSitemapXml(getNaverSitemapEntries(allData));
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
