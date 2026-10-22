import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllLottoData } from '@/lib/dataFetcher';
import { getDrawTimeMs, getLatestDrawnRound } from '@/lib/drawSchedule';
import { formatKstDrawTime } from '@/lib/kstFormat';
import { checkTicket } from '@/lib/myNumbers';
import { getRankLabel } from '@/lib/lottoUtils';
import { getShareUrl, parseShareCode, SITE_URL } from '@/lib/shareCode';
import TicketBalls from '@/components/lotto/TicketBalls';
import ShareButtons from '@/components/lotto/ShareButtons';
import SaveSharedNumbers from '@/components/lotto/SaveSharedNumbers';

export const revalidate = 3600;

interface Props {
  params: { code: string };
}

/** 공유 코드 검증: 형식 + 회차는 1 ~ 다음 추첨 회차 */
function parseTicket(code: string) {
  const ticket = parseShareCode(code);
  if (!ticket || ticket.round < 1 || ticket.round > getLatestDrawnRound() + 1) return null;
  return ticket;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ticket = parseTicket(params.code);
  if (!ticket) return { title: '행운 번호 공유 | 로또킹', robots: { index: false, follow: true } };
  const nums = ticket.numbers.join(', ');
  const title = `이번 주 내 행운 번호 ${nums} (${ticket.round}회)`;
  const description = `친구가 공유한 로또 ${ticket.round}회 행운 번호 ${nums}. 로또킹에서 나도 무료로 이번 주 번호를 받아 보세요.`;
  return {
    title: `${title} | 로또킹`,
    description,
    // 사람마다 다른 번호 조합 페이지라 검색 색인 대상이 아니다 (얇은 자동 생성 페이지 방지)
    robots: { index: false, follow: true },
    alternates: { canonical: getShareUrl(ticket.round, ticket.numbers) },
    openGraph: { title, description, url: getShareUrl(ticket.round, ticket.numbers), type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function SharePage({ params }: Props) {
  const ticket = parseTicket(params.code);
  if (!ticket) notFound();

  const draw = (await getAllLottoData()).find(d => d.round === ticket.round);
  const result = draw ? checkTicket(ticket.numbers, draw) : null;
  const shareUrl = getShareUrl(ticket.round, ticket.numbers);

  return (
    <div className="max-w-xl mx-auto space-y-6 text-center">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-primary">로또 {ticket.round}회</p>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text)' }}>이번 주 내 행운 번호</h1>
      </header>

      <div className="rounded-2xl p-6 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex justify-center">
          <TicketBalls
            numbers={ticket.numbers}
            matched={result?.matchedNumbers}
            bonusMatched={result && result.matched === 5 && result.bonusMatched ? draw!.bonusNumber : null}
            size="md"
          />
        </div>
        {draw && result ? (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {ticket.round}회 당첨번호 {draw.numbers.join(', ')} + {draw.bonusNumber} 와 비교하면{' '}
            <strong style={{ color: 'var(--text)' }}>{result.matched}개 일치 · {getRankLabel(result.rank)}</strong>{' '}
            (<a href={`/lotto/${ticket.round}`} className="text-primary hover:underline">{ticket.round}회 결과 보기</a>)
          </p>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {ticket.round}회 추첨: {formatKstDrawTime(getDrawTimeMs(ticket.round))}
          </p>
        )}
        <SaveSharedNumbers round={ticket.round} numbers={ticket.numbers} />
      </div>

      <a
        href="/#generator"
        className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-sm text-white"
        style={{ background: 'linear-gradient(135deg, #D36135, #C05430)' }}
      >
        나도 이번 주 번호 무료로 받기
      </a>

      <ShareButtons
        url={shareUrl}
        title={`이번 주 내 행운 번호 (${ticket.round}회)`}
        text={`${ticket.numbers.join(', ')} — 로또킹에서 나도 번호 받기`}
        imageUrl={`${SITE_URL}/lotto/share/${params.code}/opengraph-image`}
      />

      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
        재미로 보는 번호이며 당첨을 보장하지 않습니다. 모든 번호 조합의 당첨 확률은 같습니다(1등 8,145,060분의 1).
        로또는 만 19세 이상만 구매할 수 있습니다.
      </p>
    </div>
  );
}
