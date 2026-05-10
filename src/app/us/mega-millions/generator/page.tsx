import type { Metadata } from 'next';
import LotteryGenerator from '@/components/us/LotteryGenerator';

export const metadata: Metadata = {
  title: 'Mega Millions Number Generator — Free Random Picker',
  description:
    'Generate random Mega Millions tickets respecting the 5/70 + 1/25 format. Pick 1 to 10 lines instantly. No signup, no clutter — just the numbers.',
  alternates: { canonical: '/us/mega-millions/generator' },
};

export default function Page() {
  return (
    <article className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Mega Millions Number Generator</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Random ticket generator following the official Mega Millions format:
          5 white balls from 1–70 plus 1 gold Mega Ball from 1–25.
        </p>
      </header>
      <LotteryGenerator game="mega-millions" mainMax={70} mainCount={5} bonusMax={25} bonusLabel="Mega Ball" />
      <section className="prose prose-sm max-w-none text-gray-600 dark:prose-invert dark:text-gray-300">
        <h2>How this generator works</h2>
        <p>
          Each line is generated independently using the cryptographically-secure
          <code> crypto.getRandomValues()</code> API. White-ball numbers are drawn
          without replacement (no duplicates within a line). The gold Mega Ball is
          drawn separately and may equal a white-ball number.
        </p>
        <p>
          Like every random draw, this tool cannot increase your odds of winning the
          jackpot (still 1 in 290,472,336). Use it for a quick decision, or as a
          starting point for your own analysis.
        </p>
      </section>
    </article>
  );
}
