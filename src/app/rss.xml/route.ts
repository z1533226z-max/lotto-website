import { getAllLottoData } from '@/lib/dataFetcher';
import { GUIDE_ARTICLES } from '@/data/guideArticles';
import { CONTENT_DATES } from '@/lib/seo';
import { buildRssXml, guideToRssItem, roundToRssItem, RSS_ROUND_COUNT, RSS_SITE_URL } from '@/lib/rss';

// 네이버 서치어드바이저 RSS 제출용: 최신 회차 10개 + 가이드 글 전체 (본문 전체 포함)
export const revalidate = 3600;

export async function GET() {
  const allData = await getAllLottoData();
  const guideMs = Date.parse(`${CONTENT_DATES.guide}T09:00:00+09:00`);
  const items = [
    ...allData.slice(-RSS_ROUND_COUNT).map(roundToRssItem),
    ...GUIDE_ARTICLES.map(g => guideToRssItem(g, guideMs)),
  ];
  const xml = buildRssXml(
    {
      title: '로또킹 - 로또 당첨번호·당첨금·가이드',
      link: `${RSS_SITE_URL}/`,
      description: '매주 토요일 로또 6/45 당첨번호, 1·2등 당첨금과 세후 실수령액, 로또 구매·세금 가이드',
      selfUrl: `${RSS_SITE_URL}/rss.xml`,
    },
    items,
  );
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
