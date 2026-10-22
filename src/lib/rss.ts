/**
 * RSS 2.0 피드 (네이버 서치어드바이저 제출용)
 *
 * 네이버 규격 (https://searchadvisor.naver.com/guide/request-feed):
 *  - RSS 2.0: channel(title·link·description) + item(title·link·description·pubDate·guid)
 *  - 모든 URL 은 소유 확인한 사이트와 같은 도메인, item 1개 이상, 10MB 미만
 *  - item 본문은 "일부가 아닌 모든 내용(본문 전체 공개)" → description 에 페이지 본문 전체를 넣는다
 */
import type { LottoResult } from '@/types/lotto';
import type { GuideArticle } from '@/data/guideArticles';
import { getDrawTimeMs } from './drawSchedule';
import { calculateNetPrize } from './prizeTax';
import { formatDrawDateKo, formatNumber } from './utils';

export const RSS_SITE_URL = 'https://lotto.gon.ai.kr';
export const RSS_ROUND_COUNT = 10;

export interface RssItem {
  title: string;
  link: string;
  /** HTML 본문 (CDATA 로 감쌈) */
  html: string;
  pubDateMs: number;
  category?: string;
}

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// CDATA 안에 ']]>' 가 있으면 끊어서 이어 붙인다
const cdata = (s: string) => `<![CDATA[${s.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;

export function buildRssXml(channel: { title: string; link: string; description: string; selfUrl: string }, items: RssItem[]): string {
  const sorted = [...items].sort((a, b) => b.pubDateMs - a.pubDateMs);
  const lastBuild = sorted[0]?.pubDateMs ?? Date.now();
  const body = sorted
    .map(item => [
      '    <item>',
      `      <title>${escapeXml(item.title)}</title>`,
      `      <link>${escapeXml(item.link)}</link>`,
      `      <description>${cdata(item.html)}</description>`,
      item.category ? `      <category>${escapeXml(item.category)}</category>` : '',
      `      <pubDate>${new Date(item.pubDateMs).toUTCString()}</pubDate>`,
      `      <guid isPermaLink="true">${escapeXml(item.link)}</guid>`,
      '    </item>',
    ].filter(Boolean).join('\n'))
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(channel.title)}</title>
    <link>${escapeXml(channel.link)}</link>
    <description>${escapeXml(channel.description)}</description>
    <language>ko-KR</language>
    <lastBuildDate>${new Date(lastBuild).toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(channel.selfUrl)}" rel="self" type="application/rss+xml" />
${body}
  </channel>
</rss>
`;
}

/** 회차 페이지(/lotto/[round]) 본문을 RSS item 으로 */
export function roundToRssItem(d: LottoResult): RssItem {
  const nums = [...d.numbers].sort((a, b) => a - b).join(', ');
  const date = formatDrawDateKo(d.drawDate);
  const first = calculateNetPrize(d.prizeMoney.first);
  const second = calculateNetPrize(d.prizeMoney.second);
  const sum = d.numbers.reduce((a, b) => a + b, 0);
  const odd = d.numbers.filter(n => n % 2 === 1).length;
  const prizeLine = (rank: number, gross: number, winners: number, net: number) =>
    gross > 0
      ? `<li>${rank}등: 1인 ${formatNumber(gross)}원 · ${formatNumber(winners)}명 당첨 · 세후 실수령 약 ${formatNumber(net)}원</li>`
      : `<li>${rank}등: ${rank === 1 && winners === 0 ? '당첨자 없음(이월)' : '당첨금 집계 중'}</li>`;
  const html = [
    `<p>${escapeHtml(date)} 추첨된 로또 6/45 제${d.round}회 당첨번호는 <strong>${nums}</strong>, 보너스 번호는 <strong>${d.bonusNumber}</strong>입니다.</p>`,
    '<ul>',
    prizeLine(1, d.prizeMoney.first, d.prizeMoney.firstWinners, first.net),
    prizeLine(2, d.prizeMoney.second, d.prizeMoney.secondWinners, second.net),
    '</ul>',
    `<p>번호 합계 ${sum}, 홀수 ${odd}개·짝수 ${6 - odd}개. 세후 금액은 200만원 이하 비과세, 3억 이하 22%, 3억 초과분 33% 원천징수 기준 추정치입니다.</p>`,
    '<p>모든 번호 조합의 당첨 확률은 같습니다(1등 8,145,060분의 1). 정확한 결과는 동행복권 공식 발표로 확인하세요.</p>',
  ].join('');
  return {
    title: `로또 ${d.round}회 당첨번호 ${nums} + ${d.bonusNumber} (${date})`,
    link: `${RSS_SITE_URL}/lotto/${d.round}`,
    html,
    pubDateMs: getDrawTimeMs(d.round),
    category: '당첨번호',
  };
}

/** 가이드 글(/lotto/guide/[slug]) 본문 전체를 RSS item 으로 */
export function guideToRssItem(g: GuideArticle, publishedMs: number): RssItem {
  const sections = g.sections.map(s => `<h2>${escapeHtml(s.heading)}</h2><p>${escapeHtml(s.content)}</p>`).join('');
  const faqs = g.faqs.length
    ? `<h2>자주 묻는 질문</h2>${g.faqs.map(f => `<h3>${escapeHtml(f.question)}</h3><p>${escapeHtml(f.answer)}</p>`).join('')}`
    : '';
  return {
    title: g.title,
    link: `${RSS_SITE_URL}/lotto/guide/${g.slug}`,
    html: `<p>${escapeHtml(g.metaDescription)}</p>${sections}${faqs}`,
    pubDateMs: publishedMs,
    category: `가이드·${g.category}`,
  };
}
