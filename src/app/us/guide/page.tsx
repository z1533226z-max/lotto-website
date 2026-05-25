import type { Metadata } from 'next';
import Link from 'next/link';
import { US_GUIDE_ARTICLES } from '@/data/usGuideArticles';

export const metadata: Metadata = {
  title: 'US Lottery Guides — Powerball & Mega Millions Strategy, Odds, Taxes',
  description:
    'Honest, data-grounded guides for Powerball and Mega Millions players: strategy, payouts, quick-pick vs self-pick, tax by state, and what the math really says.',
  alternates: { canonical: '/us/guide' },
};

const CATEGORY_COLOR: Record<string, string> = {
  Strategy: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
  Payouts: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  Odds: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  Compare: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
  Taxes: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
  Mechanics: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export default function UsGuideHubPage() {
  return (
    <div className="space-y-10">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">US Lottery Guides</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Honest, math-grounded guides for Powerball and Mega Millions players.
          No &ldquo;secret systems&rdquo; — just what the data actually shows.
        </p>
      </section>

      <section className="grid gap-5 sm:grid-cols-2">
        {US_GUIDE_ARTICLES.map((article) => (
          <article
            key={article.slug}
            className="rounded-xl border border-gray-200 p-6 transition hover:border-orange-500 dark:border-gray-800"
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${
                  CATEGORY_COLOR[article.category] || CATEGORY_COLOR.Mechanics
                }`}
              >
                {article.category}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {article.game === 'both'
                  ? 'Powerball + Mega Millions'
                  : article.game === 'powerball'
                  ? 'Powerball'
                  : 'Mega Millions'}
              </span>
            </div>
            <h2 className="text-xl font-semibold leading-tight">
              <Link
                href={`/us/guide/${article.slug}`}
                className="hover:text-orange-600 dark:hover:text-orange-400"
              >
                {article.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {article.metaDescription}
            </p>
            <div className="mt-4">
              <Link
                href={`/us/guide/${article.slug}`}
                className="text-sm font-medium text-orange-600 hover:underline dark:text-orange-400"
              >
                Read guide →
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-xl bg-gray-50 p-6 text-sm leading-relaxed dark:bg-gray-900">
        <h2 className="text-lg font-semibold">About these guides</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Every guide on this page is grounded in published Powerball and Mega Millions rules,
          official odds tables, and well-established statistics. We do not sell &ldquo;winning
          systems&rdquo; or recommend services that claim to predict drawings. The truth: drawings
          are random and independent, no strategy raises your per-ticket win probability, and
          the only real choices that affect outcomes are how much you spend, whether you pool,
          which numbers you avoid (to reduce split risk), and how you handle a win.
        </p>
      </section>
    </div>
  );
}
