import React from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

// ============================================
// Accordion component (client-side interactive)
// ============================================
function AccordionItem({
  question,
  answer,
  defaultOpen,
}: {
  question: string;
  answer: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className={cn(
        'group rounded-xl transition-all duration-200',
        'border',
      )}
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--surface)',
      }}
      open={defaultOpen}
    >
      <summary
        className={cn(
          'flex items-center justify-between cursor-pointer',
          'px-5 py-4 font-semibold text-sm sm:text-base',
          'select-none list-none',
          '[&::-webkit-details-marker]:hidden',
        )}
        style={{ color: 'var(--text)' }}
      >
        <span>{question}</span>
        <svg
          className={cn(
            'w-5 h-5 flex-shrink-0 transition-transform duration-200',
            'group-open:rotate-180'
          )}
          style={{ color: 'var(--text-tertiary)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div
        className="px-5 pb-4 text-sm leading-relaxed"
        style={{ color: 'var(--text-secondary)' }}
      >
        {answer}
      </div>
    </details>
  );
}

// ============================================
// Section wrapper for consistent heading hierarchy
// ============================================
function GuideSection({
  id,
  title,
  icon,
  children,
}: {
  id: string;
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <Card variant="default" padding="lg" className="mb-6">
        <div className="flex items-center gap-3 mb-4 pb-3" style={{ borderBottom: '2px solid var(--border-light)' }}>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            }}
          >
            <span>{icon}</span>
          </div>
          <h2
            className="text-xl sm:text-2xl font-bold"
            style={{ color: 'var(--text)' }}
          >
            {title}
          </h2>
        </div>
        {children}
      </Card>
    </section>
  );
}

// ============================================
// Probability table data
// ============================================
const PRIZE_DATA = [
  {
    rank: '1등',
    condition: '6개 번호 일치',
    probability: '1 / 8,145,060',
    prize: '총 당첨금의 약 75%',
    badgeVariant: 'danger' as const,
  },
  {
    rank: '2등',
    condition: '5개 + 보너스 번호',
    probability: '1 / 1,357,510',
    prize: '총 당첨금의 약 12.5%',
    badgeVariant: 'warning' as const,
  },
  {
    rank: '3등',
    condition: '5개 번호 일치',
    probability: '1 / 35,724',
    prize: '총 당첨금의 약 12.5%',
    badgeVariant: 'info' as const,
  },
  {
    rank: '4등',
    condition: '4개 번호 일치',
    probability: '1 / 733',
    prize: '고정 50,000원',
    badgeVariant: 'success' as const,
  },
  {
    rank: '5등',
    condition: '3개 번호 일치',
    probability: '1 / 45',
    prize: '고정 5,000원',
    badgeVariant: 'default' as const,
  },
];

// ============================================
// FAQ data
// ============================================
const FAQ_DATA = [
  {
    question: '로또 당첨번호는 언제 발표되나요?',
    answer:
      '매주 토요일 오후 8시 45분에 MBC에서 생방송으로 추첨하며, 추첨 직후 동행복권 홈페이지에서도 확인할 수 있습니다.',
  },
  {
    question: '로또 1장에 몇 게임까지 할 수 있나요?',
    answer:
      '로또 1장(1매)에는 최대 5게임까지 할 수 있습니다. 1게임당 1,000원이므로 최대 5,000원입니다.',
  },
  {
    question: '로또 온라인 구매 한도가 있나요?',
    answer:
      '동행복권 사이트에서는 1회당 구매한도가 10만원(100게임)이며, 1주일 누적 구매한도는 개인별로 설정할 수 있습니다 (최대 10만원).',
  },
  {
    question: '당첨금 수령 기한이 있나요?',
    answer:
      '당첨금은 지급 개시일로부터 1년 이내에 수령해야 합니다. 기한이 지나면 당첨금은 복권기금으로 귀속됩니다.',
  },
  {
    question: '자동과 수동 중 어떤 것이 당첨 확률이 높나요?',
    answer:
      '자동과 수동의 당첨 확률은 수학적으로 동일합니다. 1등 당첨 확률은 어떤 방식이든 1/8,145,060입니다. 실제로 1등 당첨자의 약 70% 이상이 자동 구매입니다.',
  },
  {
    question: '미성년자도 로또를 구매할 수 있나요?',
    answer:
      '만 19세 미만의 미성년자는 복권을 구매할 수 없습니다. 판매점에서 신분증 확인을 할 수 있습니다.',
  },
  {
    question: '로또 번호를 분석하면 당첨 확률이 올라가나요?',
    answer:
      '로또는 매 추첨마다 완전히 독립적인 확률 사건입니다. 과거 데이터 분석은 재미를 위한 참고 자료일 뿐, 실제 당첨 확률에는 영향을 주지 않습니다. 모든 번호 조합의 당첨 확률은 동일합니다.',
  },
];

// ============================================
// Guide Page (Server Component)
// ============================================
export default function GuidePage() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: '홈', href: '/' },
          { label: '로또 완전 가이드' },
        ]}
      />

      <div className="max-w-3xl mx-auto">
        {/* Page header */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              boxShadow: '0 8px 24px rgba(255, 107, 53, 0.3)',
            }}
          >
            <span className="text-3xl">&#x1F4D6;</span>
          </div>
          <h1
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{ color: 'var(--text)' }}
          >
            로또 6/45 완전 가이드
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            구매 방법부터 당첨금 수령까지, 로또에 대한 모든 것
          </p>
        </div>

        {/* Quick navigation */}
        <Card variant="glass" padding="md" className="mb-8">
          <p
            className="text-sm font-semibold mb-3"
            style={{ color: 'var(--text)' }}
          >
            바로가기
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: '#what-is-lotto', label: '로또란?' },
              { href: '#how-to-buy', label: '구매 방법' },
              { href: '#probability', label: '당첨 확률' },
              { href: '#tax', label: '당첨금과 세금' },
              { href: '#claim', label: '수령 방법' },
              { href: '#faq', label: 'FAQ' },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium',
                  'transition-all duration-200',
                  'hover:-translate-y-0.5'
                )}
                style={{
                  backgroundColor: 'var(--surface-hover)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </Card>

        {/* Section 1: What is Lotto */}
        <GuideSection id="what-is-lotto" title="로또 6/45란?" icon="&#x1F3B0;">
          <div
            className="space-y-3 text-sm sm:text-base leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            <p>
              로또 6/45는 1부터 45까지의 숫자 중 6개를 선택하여 추첨 번호와 일치하는 개수에 따라 당첨금을 받는 대한민국 대표 복권입니다.
            </p>
            <p>
              2002년 12월에 처음 출시되어, 매주 토요일 오후 8시 45분에 MBC 스튜디오에서 생방송으로 추첨합니다.
            </p>
            <div
              className="rounded-xl p-4 mt-4"
              style={{ backgroundColor: 'var(--surface-hover)' }}
            >
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p
                    className="text-xs font-medium mb-1"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    추첨일
                  </p>
                  <p
                    className="font-bold"
                    style={{ color: 'var(--text)' }}
                  >
                    매주 토요일
                  </p>
                </div>
                <div>
                  <p
                    className="text-xs font-medium mb-1"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    추첨 시간
                  </p>
                  <p
                    className="font-bold"
                    style={{ color: 'var(--text)' }}
                  >
                    오후 8시 45분
                  </p>
                </div>
                <div>
                  <p
                    className="text-xs font-medium mb-1"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    가격
                  </p>
                  <p
                    className="font-bold"
                    style={{ color: 'var(--text)' }}
                  >
                    1,000원 / 1게임
                  </p>
                </div>
                <div>
                  <p
                    className="text-xs font-medium mb-1"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    번호 범위
                  </p>
                  <p
                    className="font-bold"
                    style={{ color: 'var(--text)' }}
                  >
                    1 ~ 45
                  </p>
                </div>
              </div>
            </div>
          </div>
        </GuideSection>

        {/* Section 2: How to Buy */}
        <GuideSection id="how-to-buy" title="구매 방법" icon="&#x1F6D2;">
          <div
            className="space-y-5 text-sm sm:text-base leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {/* Offline */}
            <div>
              <h3
                className="text-base sm:text-lg font-bold mb-2 flex items-center gap-2"
                style={{ color: 'var(--text)' }}
              >
                <Badge variant="primary" size="md">오프라인</Badge>
                복권 판매점에서 구매
              </h3>
              <p className="mb-2">
                전국 복권 판매점에서 직접 구매할 수 있습니다. 1게임당 1,000원이며, 1장에 최대 5게임까지 가능합니다.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2" style={{ color: 'var(--text-tertiary)' }}>
                <li>판매 시간: 매일 06:00 ~ 24:00 (매장별 상이)</li>
                <li>추첨일(토요일)은 오후 8시까지 구매 가능</li>
              </ul>
            </div>

            {/* Online */}
            <div>
              <h3
                className="text-base sm:text-lg font-bold mb-2 flex items-center gap-2"
                style={{ color: 'var(--text)' }}
              >
                <Badge variant="secondary" size="md">온라인</Badge>
                동행복권 사이트에서 구매
              </h3>
              <p className="mb-2">
                동행복권 공식 사이트(dhlottery.co.kr)에 가입 후 예치금을 충전하여 온라인으로 구매할 수 있습니다.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2" style={{ color: 'var(--text-tertiary)' }}>
                <li>구매 시간: 06:00 ~ 24:00</li>
                <li>추첨일(토요일)은 오후 8시까지 구매 가능</li>
                <li>1회 최대 10만원(100게임) 구매 가능</li>
              </ul>
            </div>

            {/* Types */}
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: 'var(--surface-hover)' }}
            >
              <h3
                className="text-sm font-bold mb-3"
                style={{ color: 'var(--text)' }}
              >
                구매 방식
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  className="rounded-lg p-3 text-center"
                  style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <p
                    className="font-bold mb-1"
                    style={{ color: 'var(--text)' }}
                  >
                    자동
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    컴퓨터가 무작위로 6개 번호를 자동 선택
                  </p>
                </div>
                <div
                  className="rounded-lg p-3 text-center"
                  style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <p
                    className="font-bold mb-1"
                    style={{ color: 'var(--text)' }}
                  >
                    수동
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    직접 6개 번호를 선택하여 구매
                  </p>
                </div>
                <div
                  className="rounded-lg p-3 text-center"
                  style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <p
                    className="font-bold mb-1"
                    style={{ color: 'var(--text)' }}
                  >
                    반자동
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    일부 번호를 선택하고 나머지는 자동
                  </p>
                </div>
              </div>
            </div>
          </div>
        </GuideSection>

        {/* Section 3: Probability */}
        <GuideSection id="probability" title="당첨 등수와 확률" icon="&#x1F4CA;">
          <div className="space-y-4">
            <p
              className="text-sm sm:text-base leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              로또 6/45는 1등부터 5등까지 총 5개 등수가 있으며, 각 등수별 당첨 조건과 확률은 다음과 같습니다.
            </p>

            {/* Prize table */}
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-[500px] px-4 sm:px-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      style={{
                        borderBottom: '2px solid var(--border)',
                      }}
                    >
                      <th
                        className="py-3 px-3 text-left font-bold"
                        style={{ color: 'var(--text)' }}
                      >
                        등수
                      </th>
                      <th
                        className="py-3 px-3 text-left font-bold"
                        style={{ color: 'var(--text)' }}
                      >
                        당첨 조건
                      </th>
                      <th
                        className="py-3 px-3 text-left font-bold"
                        style={{ color: 'var(--text)' }}
                      >
                        확률
                      </th>
                      <th
                        className="py-3 px-3 text-left font-bold"
                        style={{ color: 'var(--text)' }}
                      >
                        당첨금
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {PRIZE_DATA.map((row) => (
                      <tr
                        key={row.rank}
                        style={{
                          borderBottom: '1px solid var(--border-light)',
                        }}
                      >
                        <td className="py-3 px-3">
                          <Badge variant={row.badgeVariant} size="md">
                            {row.rank}
                          </Badge>
                        </td>
                        <td
                          className="py-3 px-3"
                          style={{ color: 'var(--text)' }}
                        >
                          {row.condition}
                        </td>
                        <td
                          className="py-3 px-3 font-mono text-xs"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {row.probability}
                        </td>
                        <td
                          className="py-3 px-3 text-xs"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {row.prize}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Card variant="outlined" padding="sm">
              <p
                className="text-xs"
                style={{ color: 'var(--text-tertiary)' }}
              >
                * 1~3등 당첨금은 해당 회차 총 판매액과 당첨자 수에 따라 변동됩니다. 4등(50,000원)과 5등(5,000원)은 고정 당첨금입니다.
              </p>
            </Card>
          </div>
        </GuideSection>

        {/* Section 4: Tax */}
        <GuideSection id="tax" title="당첨금과 세금" icon="&#x1F4B0;">
          <div
            className="space-y-4 text-sm sm:text-base leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            <p>
              로또 당첨금에는 소득세와 지방소득세가 부과됩니다. 당첨금 규모에 따라 세율이 달라집니다.
            </p>

            {/* Tax tiers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                className="rounded-xl p-4 text-center"
                style={{
                  backgroundColor: 'var(--surface-hover)',
                  border: '1px solid var(--border)',
                }}
              >
                <Badge variant="success" size="md" className="mb-2">
                  비과세
                </Badge>
                <p
                  className="font-bold text-lg mb-1"
                  style={{ color: 'var(--text)' }}
                >
                  5만원 이하
                </p>
                <p
                  className="text-xs"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  세금 없음
                </p>
              </div>
              <div
                className="rounded-xl p-4 text-center"
                style={{
                  backgroundColor: 'var(--surface-hover)',
                  border: '1px solid var(--border)',
                }}
              >
                <Badge variant="warning" size="md" className="mb-2">
                  22%
                </Badge>
                <p
                  className="font-bold text-lg mb-1"
                  style={{ color: 'var(--text)' }}
                >
                  5만원 ~ 3억원
                </p>
                <p
                  className="text-xs"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  소득세 20% + 지방소득세 2%
                </p>
              </div>
              <div
                className="rounded-xl p-4 text-center"
                style={{
                  backgroundColor: 'var(--surface-hover)',
                  border: '1px solid var(--border)',
                }}
              >
                <Badge variant="danger" size="md" className="mb-2">
                  33%
                </Badge>
                <p
                  className="font-bold text-lg mb-1"
                  style={{ color: 'var(--text)' }}
                >
                  3억원 초과
                </p>
                <p
                  className="text-xs"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  소득세 30% + 지방소득세 3%
                </p>
              </div>
            </div>

            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: 'var(--surface-hover)' }}
            >
              <p
                className="text-sm font-semibold mb-2"
                style={{ color: 'var(--text)' }}
              >
                예시: 10억원 당첨 시
              </p>
              <div className="space-y-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                <p>3억원까지: 3억 x 22% = 6,600만원</p>
                <p>3억 초과분(7억): 7억 x 33% = 2억 3,100만원</p>
                <p className="font-bold" style={{ color: 'var(--text)' }}>
                  총 세금: 2억 9,700만원 / 실수령액: 7억 300만원
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <Link
                href="/lotto/calculator"
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl',
                  'text-sm font-semibold text-white',
                  'transition-all duration-200',
                  'hover:-translate-y-0.5 hover:shadow-lg',
                )}
                style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                }}
              >
                <span>&#x1F9EE;</span>
                세금 계산기로 직접 계산해보기
              </Link>
            </div>
          </div>
        </GuideSection>

        {/* Section 5: How to Claim */}
        <GuideSection id="claim" title="당첨금 수령 방법" icon="&#x1F3E6;">
          <div
            className="space-y-4 text-sm sm:text-base leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            <p>
              당첨금액에 따라 수령 장소가 다릅니다. 당첨금은 지급 개시일로부터 1년 이내에 수령해야 합니다.
            </p>

            <div className="space-y-3">
              {/* Tier 1: Small */}
              <div
                className="rounded-xl p-4 flex items-start gap-4"
                style={{
                  backgroundColor: 'var(--surface-hover)',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: 'var(--surface)' }}
                >
                  <span>&#x1F3EA;</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="success" size="sm">5만원 이하</Badge>
                  </div>
                  <h3
                    className="font-bold mb-1"
                    style={{ color: 'var(--text)' }}
                  >
                    복권 판매점
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    가까운 복권 판매점에서 즉시 수령 가능합니다. 신분증이 필요하지 않습니다.
                  </p>
                </div>
              </div>

              {/* Tier 2: Medium */}
              <div
                className="rounded-xl p-4 flex items-start gap-4"
                style={{
                  backgroundColor: 'var(--surface-hover)',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: 'var(--surface)' }}
                >
                  <span>&#x1F3E6;</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="warning" size="sm">5만원 ~ 200만원</Badge>
                  </div>
                  <h3
                    className="font-bold mb-1"
                    style={{ color: 'var(--text)' }}
                  >
                    농협은행 지점
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    전국 농협은행 지점에서 수령 가능합니다. 당첨 복권과 신분증을 지참하세요.
                  </p>
                </div>
              </div>

              {/* Tier 3: Large */}
              <div
                className="rounded-xl p-4 flex items-start gap-4"
                style={{
                  backgroundColor: 'var(--surface-hover)',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: 'var(--surface)' }}
                >
                  <span>&#x1F3E2;</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="danger" size="sm">200만원 초과</Badge>
                  </div>
                  <h3
                    className="font-bold mb-1"
                    style={{ color: 'var(--text)' }}
                  >
                    동행복권 본사
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    서울시 강남구 테헤란로 동행복권 본사를 방문하여 수령합니다. 당첨 복권, 신분증, 통장 사본이 필요합니다.
                  </p>
                </div>
              </div>
            </div>

            <Card variant="outlined" padding="sm">
              <p
                className="text-xs"
                style={{ color: 'var(--text-tertiary)' }}
              >
                * 온라인 구매 당첨금은 200만원 이하까지 동행복권 계좌로 자동 입금되며, 200만원 초과 시 본사 방문이 필요합니다.
              </p>
            </Card>
          </div>
        </GuideSection>

        {/* Section 6: FAQ */}
        <GuideSection id="faq" title="자주 묻는 질문 (FAQ)" icon="&#x2753;">
          <div className="space-y-3">
            {FAQ_DATA.map((item, index) => (
              <AccordionItem
                key={index}
                question={item.question}
                answer={item.answer}
                defaultOpen={index === 0}
              />
            ))}
          </div>
        </GuideSection>

        {/* Bottom CTA */}
        <Card variant="gradient" padding="lg" className="text-center mb-8">
          <h2
            className="text-lg font-bold mb-2"
            style={{ color: 'var(--text)' }}
          >
            이제 직접 번호를 만들어볼까요?
          </h2>
          <p
            className="text-sm mb-4"
            style={{ color: 'var(--text-secondary)' }}
          >
            AI 추천, 행운번호 생성기 등 다양한 방법으로 번호를 생성해보세요.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl',
                'text-sm font-semibold text-white',
                'transition-all duration-200',
                'hover:-translate-y-0.5 hover:shadow-lg',
              )}
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              }}
            >
              번호 생성하기
            </Link>
            <Link
              href="/lotto/fortune"
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl',
                'text-sm font-semibold',
                'transition-all duration-200',
                'hover:-translate-y-0.5',
              )}
              style={{
                backgroundColor: 'var(--surface-hover)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
            >
              행운번호 생성기
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
}
