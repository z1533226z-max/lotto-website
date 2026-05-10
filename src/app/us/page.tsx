import type { Metadata } from 'next';
import Link from 'next/link';
import { POWERBALL, MEGA_MILLIONS } from '@/data/usLottoData';

export const metadata: Metadata = {
  title: 'US Lottery Hub — Powerball & Mega Millions Tools',
  description:
    'One place for Powerball and Mega Millions analysis: prize-odds breakdown, free number generator, and how-to guides. No signup, no ads in your face — just the numbers.',
  alternates: { canonical: '/us' },
};

export default function USHubPage() {
  const games = [POWERBALL, MEGA_MILLIONS];

  return (
    <div className="space-y-10">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          US Lottery Hub
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Free Powerball and Mega Millions analysis, number generator, and prize-odds breakdown.
        </p>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        {games.map((g) => (
          <article
            key={g.key}
            className="rounded-xl border border-gray-200 p-6 transition hover:border-orange-500 dark:border-gray-800"
          >
            <h2 className="text-2xl font-semibold">
              <Link href={`/us/${g.key}`}>{g.displayName}</Link>
            </h2>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <dt className="text-gray-500">Format</dt>
              <dd>
                {g.mainPick.count}/{g.mainPick.max} + {g.bonusPick.count}/{g.bonusPick.max}
              </dd>
              <dt className="text-gray-500">Ticket</dt>
              <dd>${g.ticketPrice}</dd>
              <dt className="text-gray-500">Drawings</dt>
              <dd>{g.drawDays.join(', ')}</dd>
              <dt className="text-gray-500">Time</dt>
              <dd>{g.drawTimeET}</dd>
              <dt className="text-gray-500">Min Jackpot</dt>
              <dd>${(g.jackpotMin / 1_000_000).toFixed(0)}M</dd>
            </dl>
            <div className="mt-6 flex flex-wrap gap-2 text-sm">
              <Link
                href={`/us/${g.key}`}
                className="rounded-md bg-orange-600 px-3 py-1.5 font-medium text-white hover:bg-orange-700"
              >
                Overview
              </Link>
              <Link
                href={`/us/${g.key}/odds`}
                className="rounded-md border border-gray-300 px-3 py-1.5 font-medium hover:border-orange-500 dark:border-gray-700"
              >
                Prize Odds
              </Link>
              <Link
                href={`/us/${g.key}/generator`}
                className="rounded-md border border-gray-300 px-3 py-1.5 font-medium hover:border-orange-500 dark:border-gray-700"
              >
                Number Generator
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-xl bg-gray-50 p-6 text-sm leading-relaxed dark:bg-gray-900">
        <h2 className="text-lg font-semibold">About Lotto.Gon US</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          We publish free, ad-supported analysis tools for the two largest US multi-state
          lottery games. No registration, no email collection, no &quot;guaranteed winners&quot;
          gimmicks. Numbers are pulled from official lottery sources where applicable, and
          all prize-odds figures are taken directly from the games&apos; official rules.
        </p>
        <p className="mt-3 text-gray-600 dark:text-gray-300">
          Lotto.Gon also operates a Korean lottery analytics service for the Korean 6/45 game.
          Looking for that?{' '}
          <Link href="/" className="font-medium text-orange-600 hover:underline">
            Visit the Korean site →
          </Link>
        </p>
      </section>
    </div>
  );
}
