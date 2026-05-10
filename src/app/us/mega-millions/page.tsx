import type { Metadata } from 'next';
import Link from 'next/link';
import { MEGA_MILLIONS, FAQ_MEGA_MILLIONS, MEGA_MILLIONS_OVERALL_ODDS } from '@/data/usLottoData';

export const metadata: Metadata = {
  title: 'Mega Millions Guide — How to Play, Odds, and Tools',
  description:
    'Mega Millions explained: full rules (5/70 + 1/24), drawing schedule, prize tiers, jackpot minimum, lump-sum vs annuity, and free analysis tools.',
  alternates: { canonical: '/us/mega-millions' },
};

export default function MegaMillionsPage() {
  const g = MEGA_MILLIONS;
  return (
    <article className="prose prose-gray max-w-none dark:prose-invert">
      <h1>Mega Millions — Complete Guide</h1>
      <p className="lead">
        Mega Millions is a multi-jurisdictional US lottery game offered in 45 states,
        Washington D.C., and the U.S. Virgin Islands. Drawings are held twice a week,
        with a starting jackpot of ${(g.jackpotMin / 1_000_000).toFixed(0)} million that
        rolls over until won.
      </p>

      <h2>The Rules</h2>
      <ul>
        <li>
          <strong>Pick {g.mainPick.count} numbers</strong> from 1–{g.mainPick.max} (white balls)
        </li>
        <li>
          <strong>Pick 1 {g.bonusPick.label}</strong> number from 1–{g.bonusPick.max} (gold ball)
        </li>
        <li>Match all 6 to win the jackpot</li>
        <li>
          Ticket: ${g.ticketPrice} (April 2025 redesign — includes a built-in multiplier on
          non-jackpot prizes; no separate Megaplier add-on required)
        </li>
      </ul>

      <h2>Drawing Schedule</h2>
      <p>
        Drawings: <strong>{g.drawDays.join(', ')}</strong> at <strong>{g.drawTimeET}</strong>.
        Sales close 15 minutes to 1 hour before each drawing depending on the state.
      </p>

      <h2>Overall Odds</h2>
      <p>
        Overall odds of winning any prize: <strong>{MEGA_MILLIONS_OVERALL_ODDS}</strong>.
        Jackpot odds: <strong>1 in 290,472,336</strong>.
      </p>
      <p>
        See the full prize-tier breakdown:{' '}
        <Link href="/us/mega-millions/odds">Mega Millions Prize Odds →</Link>
      </p>

      <h2>Tools</h2>
      <ul>
        <li>
          <Link href="/us/mega-millions/generator">Mega Millions Number Generator</Link> — random pick respecting 5/70 + 1/24
        </li>
        <li>
          <Link href="/us/mega-millions/odds">Prize Odds & Tiers</Link> — every match level, exact odds
        </li>
      </ul>

      <h2>Frequently Asked Questions</h2>
      {FAQ_MEGA_MILLIONS.map((f) => (
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
