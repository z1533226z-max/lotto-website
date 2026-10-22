const assert = require('node:assert/strict');
const { test } = require('node:test');
const { loadTs } = require('./_loadTs.cjs');

// vm 안에서 만든 객체는 프로토타입이 달라 deepStrictEqual 이 실패하므로 평범한 값으로 바꿔 비교한다
const plain = (v) => JSON.parse(JSON.stringify(v));
const same = (actual, expected, msg) => assert.deepEqual(plain(actual), expected, msg);
const KST = (y, m, d, hh, mm) => new Date(Date.UTC(y, m - 1, d, hh - 9, mm));

// ---------- A. 세후 실수령액 ----------
const tax = loadTs('@/lib/prizeTax');

test('200만원 이하는 비과세 (소득세법 제84조)', () => {
  same(tax.calculateNetPrize(2_000_000), { gross: 2_000_000, incomeTax: 0, localTax: 0, totalTax: 0, net: 2_000_000 });
  assert.equal(tax.calculateNetPrize(50_000).net, 50_000);
});

test('200만원 초과 3억 이하는 22% (소득세 20% + 지방소득세 2%)', () => {
  const r = tax.calculateNetPrize(100_000_000);
  assert.equal(r.incomeTax, 20_000_000);
  assert.equal(r.localTax, 2_000_000);
  assert.equal(r.net, 78_000_000);
  // 4등·5등 고정 당첨금은 비과세 구간
  assert.equal(tax.calculateNetPrize(2_000_001).totalTax, 400_000 + 40_000);
});

test('3억 초과분만 33% (소득세법 제129조)', () => {
  // 20억: 3억×22% + 17억×33% = 6,600만 + 5억6,100만 = 6억2,700만
  const r = tax.calculateNetPrize(2_000_000_000);
  assert.equal(r.totalTax, 627_000_000);
  assert.equal(r.net, 1_373_000_000);
  assert.equal(tax.calculateNetPrize(500_000_000).net, 368_000_000);
  assert.equal(tax.calculateNetPrize(0).net, 0);
});

// ---------- A·B. 추첨 일정 ----------
const draw = loadTs('@/lib/drawSchedule');

test('회차별 추첨 시각과 다음 추첨', () => {
  assert.equal(draw.getDrawTimeMs(1), Date.UTC(2002, 11, 7, 11, 35));
  assert.equal(draw.getDrawTimeMs(1247), KST(2026, 10, 24, 20, 35).getTime());
  same(draw.getNextDraw(KST(2026, 10, 24, 20, 34)), { round: 1247, drawTimeMs: KST(2026, 10, 24, 20, 35).getTime() });
  assert.equal(draw.getNextDraw(KST(2026, 10, 24, 20, 35)).round, 1248);
});

test('방금 발표는 추첨 후 6시간 동안만', () => {
  assert.equal(draw.isJustAnnounced(1247, KST(2026, 10, 24, 20, 34)), false);
  assert.equal(draw.isJustAnnounced(1247, KST(2026, 10, 24, 20, 35)), true);
  assert.equal(draw.isJustAnnounced(1247, KST(2026, 10, 25, 2, 34)), true);
  assert.equal(draw.isJustAnnounced(1247, KST(2026, 10, 25, 2, 35)), false);
  assert.equal(draw.isJustAnnounced(1246, KST(2026, 10, 24, 21, 0)), false);
});

// ---------- C. 내 번호 ----------
const my = loadTs('@/lib/myNumbers');
const DRAW = { round: 1247, numbers: [3, 12, 24, 33, 39, 42], bonusNumber: 7 };

test('저장소 값 파싱: 깨진 값·잘못된 번호는 버리고 예전 형식은 유지', () => {
  same(my.parseMyNumbers('not json'), []);
  same(my.parseMyNumbers('{"a":1}'), []);
  const list = my.parseMyNumbers(JSON.stringify([
    { id: 'a', numbers: [42, 3, 12, 24, 33, 39], createdAt: '2026-10-20T00:00:00.000Z', isAI: true },
    { id: 'dup', numbers: [1, 1, 2, 3, 4, 5], createdAt: '2026-10-20T00:00:00.000Z' },
    { id: 'range', numbers: [0, 1, 2, 3, 4, 46] },
    null,
  ]));
  assert.equal(list.length, 1);
  same(list[0].numbers, [3, 12, 24, 33, 39, 42]);
  // round 없는 예전 저장분(NumberGenerator 비회원 저장): 저장 시각(10/20 KST 09시) 기준 다음 추첨 1247회
  assert.equal(my.getTargetRound(list[0]), 1247);
});

test('추가: 같은 회차·같은 번호 중복 제외, 최대 개수 유지', () => {
  const now = KST(2026, 10, 22, 12, 0);
  let list = my.addMyNumbers([], [[42, 3, 12, 24, 33, 39], [3, 12, 24, 33, 39, 42], [1, 2, 3]], { isAI: false, round: 1247, now });
  assert.equal(list.length, 1);
  assert.equal(list[0].round, 1247);
  list = my.addMyNumbers(list, [[3, 12, 24, 33, 39, 42]], { isAI: false, round: 1248, now });
  assert.equal(list.length, 2);
  const many = Array.from({ length: 39 }, (_, i) => [1, 2, 3, 4, 5, 6 + i]);
  const capped = my.addMyNumbers(my.addMyNumbers([], many, { isAI: true, round: 1247, now }), many, { isAI: true, round: 1248, now });
  assert.equal(capped.length, my.MY_NUMBERS_MAX);
  // 오래된 것부터 밀려나고 가장 최근 추가분은 남는다
  assert.equal(capped[capped.length - 1].round, 1248);
});

test('당첨 판정: 1·2·3·5등과 미당첨', () => {
  assert.equal(my.checkTicket([3, 12, 24, 33, 39, 42], DRAW).rank, 1);
  const second = my.checkTicket([3, 12, 24, 33, 39, 7], DRAW);
  same([second.matched, second.bonusMatched, second.rank], [5, true, 2]);
  assert.equal(my.checkTicket([3, 12, 24, 33, 39, 1], DRAW).rank, 3);
  const fifth = my.checkTicket([3, 12, 24, 1, 2, 4], DRAW);
  same([fifth.matched, fifth.rank, fifth.matchedNumbers], [3, 5, [3, 12, 24]]);
  assert.equal(my.checkTicket([1, 2, 4, 5, 6, 7], DRAW).rank, 0);
});

// ---------- D. 공유 주소 ----------
const share = loadTs('@/lib/shareCode');

test('공유 코드: 정렬된 하나의 주소만 유효', () => {
  assert.equal(share.encodeShareCode(1248, [42, 3, 12, 24, 33, 39]), '1248-3-12-24-33-39-42');
  same(share.parseShareCode('1248-3-12-24-33-39-42'), { round: 1248, numbers: [3, 12, 24, 33, 39, 42] });
  for (const bad of ['1248-42-3-12-24-33-39', '1248-3-3-12-24-33-39', '1248-3-12-24-33-39-46', '0-1-2-3-4-5-6', '1248-01-2-3-4-5-6', '1248-1-2-3-4-5', 'abc']) {
    assert.equal(share.parseShareCode(bad), null, bad);
  }
  assert.equal(share.getShareUrl(1248, [3, 12, 24, 33, 39, 42]), 'https://lotto.gon.ai.kr/lotto/share/1248-3-12-24-33-39-42');
});

// ---------- E. RSS ----------
const rss = loadTs('@/lib/rss');

test('RSS: 네이버 규격 필드·본문 전체·특수문자 처리', () => {
  const item = rss.roundToRssItem({
    round: 1247, drawDate: '2026-10-24', numbers: [42, 3, 12, 24, 33, 39], bonusNumber: 7,
    prizeMoney: { first: 2_000_000_000, firstWinners: 12, second: 60_000_000, secondWinners: 80 },
  });
  assert.equal(item.link, 'https://lotto.gon.ai.kr/lotto/1247');
  assert.match(item.title, /1247회 당첨번호 3, 12, 24, 33, 39, 42 \+ 7/);
  assert.match(item.html, /세후 실수령 <strong>13억 7300만원<\/strong><br>1,373,000,000원/);
  const xml = rss.buildRssXml(
    { title: 'A & B', link: 'https://lotto.gon.ai.kr/', description: '<desc>', selfUrl: 'https://lotto.gon.ai.kr/rss.xml' },
    [{ title: 'x', link: 'https://lotto.gon.ai.kr/g', html: 'evil ]]> end', pubDateMs: 0 }, item],
  );
  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>\n<rss version="2.0"/);
  assert.match(xml, /<title>A &amp; B<\/title>/);
  assert.match(xml, /<description>&lt;desc&gt;<\/description>/);
  assert.ok(!xml.includes('evil ]]> end'));
  assert.match(xml, /<pubDate>Sat, 24 Oct 2026 11:35:00 GMT<\/pubDate>/);
  assert.equal((xml.match(/<item>/g) || []).length, 2);
  // 최신 글이 먼저
  assert.ok(xml.indexOf('1247회') < xml.indexOf('<title>x</title>'));
  // 모든 링크는 사이트 도메인
  for (const m of xml.matchAll(/<link>([^<]+)<\/link>/g)) assert.ok(m[1].startsWith('https://lotto.gon.ai.kr/'));
});

// ---------- B. 재생성 대상 ----------
const targets = loadTs('@/lib/revalidateTargets');

test('회차 재생성 대상: 최신·직전·예상 회차', () => {
  same(targets.getRoundPathsToRevalidate(1246, 1247), ['/lotto/1247', '/lotto/1246', '/lotto/1245']);
  same(targets.getRoundPathsToRevalidate(1247, 1247), ['/lotto/1247', '/lotto/1246']);
  same(targets.getRoundPathsToRevalidate(0, 0), []);
  assert.ok(targets.DRAW_REVALIDATE_PATHS.includes('/rss.xml'));
  assert.ok(targets.DRAW_REVALIDATE_PATHS.includes('/lotto/my-numbers'));
});

// ---------- A. 1등 판매점 목록 (서버 HTML) ----------
test('1등 판매점: 자동·수동·반자동 구분과 개수가 HTML 에 나온다', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const RoundWinningStores = loadTs('@/components/lotto/RoundWinningStores').default;
  const stores = [
    { name: '행운복권방', address: '서울 강남구 테헤란로 1', purchaseType: '자동' },
    { name: '대박마트', address: '경기 수원시 팔달구 2', purchaseType: '수동' },
    { name: '<b>로또</b>', address: '부산 해운대구 3', purchaseType: '반자동' },
  ];
  const html = renderToStaticMarkup(React.createElement(RoundWinningStores, { round: 1247, firstWinners: 4, stores }));
  assert.match(html, /1247회 1등 당첨 판매점/);
  assert.match(html, /<strong>3곳<\/strong>/);
  assert.match(html, /\(자동 1 · 수동 1 · 반자동 1\)/);
  assert.match(html, /서울 강남구 테헤란로 1/);
  assert.match(html, /&lt;b&gt;로또&lt;\/b&gt;/); // 수집한 상호명은 글자로만 출력
  assert.match(html, /온라인\(인터넷\) 구매/);
  const empty = renderToStaticMarkup(React.createElement(RoundWinningStores, { round: 1247, firstWinners: 4, stores: null }));
  assert.match(empty, /순차 반영/);
});
