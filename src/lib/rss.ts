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
import {
  NUMBER_BAND_LABELS,
  PRIZE_TAX_NOTE,
  PROBABILITY_NOTE,
  STORES_SOURCE_NOTE,
  STORE_TABLE_HEADERS,
  analyzeRoundNumbers,
  bandLabel,
  patternHeading,
  patternParts,
  patternStats,
  prizeText,
  roundDateLabel,
  roundTitle,
  storesFallback,
  storesHeading,
  storesSummaryParts,
  type StoreLike,
  type TextPart,
} from './roundContent';
import { formatDrawDateKo } from './utils';

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

const partsHtml = (parts: TextPart[]) =>
  parts.map(p => (typeof p === 'string' ? escapeHtml(p) : `<strong>${escapeHtml(p.strong)}</strong>`)).join('');

function prizeHtml(d: LottoResult, rank: 1 | 2): string {
  const t = prizeText(d, rank);
  const body = t.state === 'paid'
    ? `<p><strong>${escapeHtml(t.amount!)}</strong><br>${escapeHtml(t.detail!)}</p><p>세후 실수령 <strong>${escapeHtml(t.net!)}</strong><br>${escapeHtml(t.netDetail!)}</p>`
    : `<p>${escapeHtml(t.status!)}</p>`;
  return `<h3>${escapeHtml(t.heading)}</h3>${body}`;
}

function storesHtml(d: LottoResult, stores: StoreLike[] | null): string {
  const heading = `<h2>${escapeHtml(storesHeading(d.round))}</h2>`;
  let body: string;
  if (stores && stores.length > 0) {
    const rows = stores
      .map((s, i) => `<tr><td>${i + 1}</td><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.purchaseType)}</td><td>${escapeHtml(s.address)}</td></tr>`)
      .join('');
    body = `<p>${partsHtml(storesSummaryParts(d.round, d.prizeMoney.firstWinners, stores))}</p>`
      + `<table><thead><tr>${STORE_TABLE_HEADERS.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`;
  } else {
    const f = storesFallback(d.round);
    body = `<p>${escapeHtml(f.before)}<a href="${RSS_SITE_URL}/lotto/stores">${escapeHtml(f.link)}</a>${escapeHtml(f.after)}</p>`;
  }
  return `${heading}${body}<p>${escapeHtml(STORES_SOURCE_NOTE)}</p>`;
}

/**
 * 회차 페이지(/lotto/[round]) 본문 전체를 RSS item 으로 — 화면과 같은 lib/roundContent 글을 쓴다.
 * stores: 1등 판매점(조회 실패·수집 전이면 null → 화면과 같은 '순차 반영' 안내)
 */
export function roundToRssItem(d: LottoResult, stores: StoreLike[] | null = null): RssItem {
  const nums = [...d.numbers].sort((a, b) => a - b).join(', ');
  const date = formatDrawDateKo(d.drawDate);
  const a = analyzeRoundNumbers(d.numbers);
  const html = [
    `<h2>${escapeHtml(roundTitle(d))} ${escapeHtml(roundDateLabel(d))}</h2>`,
    `<p>당첨번호 <strong>${nums}</strong> + 보너스 <strong>${d.bonusNumber}</strong></p>`,
    prizeHtml(d, 1),
    prizeHtml(d, 2),
    `<p>${escapeHtml(PRIZE_TAX_NOTE)}</p>`,
    storesHtml(d, stores),
    `<h2>${escapeHtml(patternHeading(d))}</h2>`,
    `<p>${partsHtml(patternParts(d, a))}</p>`,
    `<ul>${patternStats(a).map(([label, value]) => `<li>${escapeHtml(label)}: ${escapeHtml(value)}</li>`).join('')}</ul>`,
    `<p>번호대별 분포</p><ul>${NUMBER_BAND_LABELS.map((_, i) => `<li>${escapeHtml(bandLabel(a, i))}</li>`).join('')}</ul>`,
    `<p>${escapeHtml(PROBABILITY_NOTE)}</p>`,
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
