import type { Metadata } from 'next';
import Link from 'next/link';
import { POWERBALL_PRIZES, POWERBALL_OVERALL_ODDS } from '@/data/usLottoData';

export const metadata: Metadata = {
  title: 'Powerball Prize Odds — All 9 Prize Tiers Explained',
  description:
    'Exact Powerball prize-tier odds: jackpot (1 in 292M), $1M second prize, all the way down to $4 minimum prize. Power Play breakdown included.',
  alternates: { canonical: '/us/powerball/odds' },
};

export default function PowerballOddsPage() {
  return (
    <article className="prose prose-gray max-w-none dark:prose-invert">
      <h1>Powerball Prize Odds</h1>
      <p>
        Powerball offers 9 prize tiers. The numbers below come directly from the
        game&apos;s official rules. Overall odds of winning any prize:{' '}
        <strong>{POWERBALL_OVERALL_ODDS}</strong>.
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
            {POWERBALL_PRIZES.map((row, i) => (
              <tr
                key={row.match}
                className={
                  i === 0
                    ? 'border-b border-orange-200 bg-orange-50 font-semibold dark:bg-orange-950/30'
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

      <h2>About Power Play</h2>
      <p>
        Power Play is an optional <strong>$1 add-on</strong> per ticket that multiplies
        non-jackpot prizes:
      </p>
      <ul>
        <li>2x, 3x, 4x, or 5x — based on a separate Power Play drawing</li>
        <li>10x multiplier added when the advertised jackpot is below $150 million</li>
        <li>The $1,000,000 second prize becomes $2,000,000 with Power Play (capped)</li>
      </ul>

      <h2>How the Lump Sum Works</h2>
      <p>
        Advertised jackpots are the <em>annuity</em> value (paid as 30 graduated annual
        payments). The cash lump sum option is roughly <strong>50–55%</strong> of the
        advertised jackpot, paid immediately. Federal withholding takes 24% off the top
        before any state tax.
      </p>

      <p>
        <Link href="/us/powerball/generator">
          → Try the free Powerball number generator
        </Link>
      </p>
    </article>
  );
}
