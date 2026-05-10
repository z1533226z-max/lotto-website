import type { Metadata } from 'next';
import Link from 'next/link';
import { MEGA_MILLIONS_PRIZES, MEGA_MILLIONS_OVERALL_ODDS } from '@/data/usLottoData';

export const metadata: Metadata = {
  title: 'Mega Millions Prize Odds — All 9 Prize Tiers Explained',
  description:
    'Exact Mega Millions prize-tier odds: jackpot (1 in 290M), $1M second prize, all the way down to $5 minimum prize. Built-in multiplier explained.',
  alternates: { canonical: '/us/mega-millions/odds' },
};

export default function MegaMillionsOddsPage() {
  return (
    <article className="prose prose-gray max-w-none dark:prose-invert">
      <h1>Mega Millions Prize Odds</h1>
      <p>
        Mega Millions offers 9 prize tiers. The numbers below come directly from the
        game&apos;s official rules. Overall odds of winning any prize:{' '}
        <strong>{MEGA_MILLIONS_OVERALL_ODDS}</strong>.
      </p>

      <div className="not-prose overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-gray-300 dark:border-gray-700">
              <th className="px-3 py-2 text-left">Match</th>
              <th className="px-3 py-2 text-left">Prize</th>
              <th className="px-3 py-2 text-right">Odds (1 in)</th>
            </tr>
          </thead>
          <tbody>
            {MEGA_MILLIONS_PRIZES.map((row, i) => (
              <tr
                key={row.match}
                className={
                  i === 0
                    ? 'border-b border-yellow-200 bg-yellow-50 font-semibold dark:bg-yellow-950/30'
                    : 'border-b border-gray-200 dark:border-gray-800'
                }
              >
                <td className="px-3 py-2">{row.match}</td>
                <td className="px-3 py-2">{row.prize}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {row.oddsOneIn.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>About the Built-In Multiplier (April 2025+)</h2>
      <p>
        Following the April 2025 redesign, every Mega Millions ticket now includes a
        built-in multiplier (2x, 3x, 4x, 5x, or 10x) randomly generated for each ticket.
        This applies to all <em>non-jackpot</em> prizes. The legacy Megaplier add-on is
        no longer separately offered in jurisdictions that have adopted the new format.
      </p>

      <h2>Lump Sum vs Annuity</h2>
      <p>
        The advertised jackpot is the <em>annuity</em> value, paid out as 30 graduated
        annual installments (each 5% larger than the previous). The cash lump sum is
        roughly <strong>50–55%</strong> of the advertised jackpot, paid immediately, but
        federal withholding takes 24% off the top before any state tax is calculated.
      </p>

      <p>
        <Link href="/us/mega-millions/generator">
          → Try the free Mega Millions number generator
        </Link>
      </p>
    </article>
  );
}
