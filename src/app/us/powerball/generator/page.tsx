import type { Metadata } from 'next';
import LotteryGenerator from '@/components/us/LotteryGenerator';

export const metadata: Metadata = {
  title: 'Powerball Number Generator — Free Random Picker',
  description:
    'Generate random Powerball tickets respecting the 5/69 + 1/26 format. Pick 1 to 10 lines instantly. No signup, no ads in the way — just the numbers.',
  alternates: { canonical: '/us/powerball/generator' },
};

export default function Page() {
  return (
    <article className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Powerball Number Generator</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Random ticket generator following the official Powerball format:
          5 white balls from 1–69 plus 1 red Powerball from 1–26.
        </p>
      </header>
      <LotteryGenerator game="powerball" mainMax={69} mainCount={5} bonusMax={26} bonusLabel="Powerball" />
      <section className="prose prose-sm max-w-none text-gray-600 dark:prose-invert dark:text-gray-300">
        <h2>How this generator works</h2>
        <p>
          Each line is generated independently using the cryptographically-secure
          <code> crypto.getRandomValues()</code> API. White-ball numbers are drawn
          without replacement (no duplicates within a line). The red Powerball is
          drawn separately and may equal a white-ball number.
        </p>
        <p>
          Like every random draw, this tool cannot increase your odds of winning the
          jackpot (still 1 in 292,201,338). Use it for a quick decision, or as a
          starting point for your own analysis.
        </p>
      </section>
    </article>
  );
}
