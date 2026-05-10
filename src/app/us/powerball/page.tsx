import type { Metadata } from 'next';
import Link from 'next/link';
import { POWERBALL, FAQ_POWERBALL, POWERBALL_OVERALL_ODDS } from '@/data/usLottoData';

export const metadata: Metadata = {
  title: 'Powerball Guide — How to Play, Odds, and Tools',
  description:
    'Everything you need to play Powerball: full rules (5/69 + 1/26), drawing schedule, prize tiers, jackpot minimum, Power Play multiplier, and free analysis tools.',
  alternates: { canonical: '/us/powerball' },
};

export default function PowerballPage() {
  const g = POWERBALL;
  return (
    <article className="prose prose-gray max-w-none dark:prose-invert">
      <h1>Powerball — Complete Guide</h1>
      <p className="lead">
        Powerball is a multi-state US lottery game offered in 45 states, Washington D.C.,
        Puerto Rico, and the U.S. Virgin Islands. Drawings are held three times a week,
        with a starting jackpot of ${(g.jackpotMin / 1_000_000).toFixed(0)} million that
        rolls until won.
      </p>

      <h2>The Rules</h2>
      <ul>
        <li>
          <strong>Pick {g.mainPick.count} numbers</strong> from 1–{g.mainPick.max} (white balls)
        </li>
        <li>
          <strong>Pick 1 {g.bonusPick.label}</strong> number from 1–{g.bonusPick.max} (red ball)
        </li>
        <li>Match all 6 to win the jackpot</li>
        <li>Ticket: ${g.ticketPrice} (Power Play multiplier: +$1, multiplies non-jackpot prizes by 2x–10x)</li>
      </ul>

      <h2>Drawing Schedule</h2>
      <p>
        Drawings: <strong>{g.drawDays.join(', ')}</strong> at <strong>{g.drawTimeET}</strong>.
        Cut-off times for ticket sales vary by state — typically 1–2 hours before the drawing.
      </p>

      <h2>Overall Odds</h2>
      <p>
        Overall odds of winning any prize: <strong>{POWERBALL_OVERALL_ODDS}</strong>.
        Jackpot odds: <strong>1 in 292,201,338</strong>.
      </p>
      <p>
        See the full prize-tier breakdown:{' '}
        <Link href="/us/powerball/odds">Powerball Prize Odds →</Link>
      </p>

      <h2>Tools</h2>
      <ul>
        <li>
          <Link href="/us/powerball/generator">Powerball Number Generator</Link> — random pick respecting 5/69 + 1/26
        </li>
        <li>
          <Link href="/us/powerball/odds">Prize Odds & Tiers</Link> — every match level, exact odds
        </li>
      </ul>

      <h2>Frequently Asked Questions</h2>
      {FAQ_POWERBALL.map((f) => (
        <section key={f.q}>
          <h3>{f.q}</h3>
          <p>{f.a}</p>
        </section>
      ))}

      <hr />
      <p className="text-sm text-gray-500">
        Source: <a href={g.officialUrl} target="_blank" rel="noopener">{g.officialUrl}</a> ·{' '}
        Authority: {g.drawingsAuthority}
      </p>
    </article>
  );
}
