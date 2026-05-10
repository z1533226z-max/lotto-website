import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms of use for Lotto.Gon US — informational analysis service for Powerball and Mega Millions. No tickets sold, no affiliate purchases, no winnings guaranteed.',
  alternates: { canonical: '/us/terms' },
  robots: { index: true, follow: true },
};

const LAST_UPDATED = '2026-05-10';

export default function TermsPage() {
  return (
    <article className="prose prose-gray max-w-none dark:prose-invert">
      <h1>Terms of Service</h1>
      <p className="text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>

      <h2>Acceptance</h2>
      <p>
        By accessing or using Lotto.Gon US (the &quot;Site&quot;), you agree to these Terms
        of Service. If you do not agree, please do not use the Site.
      </p>

      <h2>Nature of the Service — Information Only</h2>
      <p>
        Lotto.Gon US is an <strong>independent informational and analytics service</strong>.
        We publish:
      </p>
      <ul>
        <li>Educational guides on US multi-state lottery games (Powerball, Mega Millions)</li>
        <li>Prize-tier odds tables sourced from each game&apos;s official rules</li>
        <li>A free random number generator</li>
      </ul>
      <p>
        We do <strong>not</strong>:
      </p>
      <ul>
        <li>Sell, broker, or courier lottery tickets</li>
        <li>Operate as a lottery agent or affiliate</li>
        <li>Hold funds or process payments on your behalf</li>
        <li>Guarantee winnings or improved odds</li>
      </ul>

      <h2>Eligibility</h2>
      <p>
        Lottery participation in the United States is restricted by age and jurisdiction.
        Most states require players to be at least <strong>18 years old</strong>; some
        states require <strong>21</strong>. The user is solely responsible for verifying
        legal age and eligibility in their jurisdiction. Use of the Site does not constitute
        consent to participate in any lottery game.
      </p>

      <h2>No Improvement of Odds</h2>
      <p>
        Random number generators, frequency analyses, and historical data presentations on
        this Site are provided for entertainment and informational purposes. The probability
        of winning any prize tier is determined by the official rules of the underlying
        game. <strong>No tool, statistic, or algorithm on this Site can increase your odds
        of winning.</strong>
      </p>

      <h2>Accuracy of Data</h2>
      <p>
        We strive for accuracy but make no warranty as to the correctness, completeness, or
        timeliness of information published on the Site. Official prize amounts, drawing
        results, and rules should always be verified at:
      </p>
      <ul>
        <li>
          <a href="https://www.powerball.com" target="_blank" rel="noopener">
            powerball.com
          </a>
        </li>
        <li>
          <a href="https://www.megamillions.com" target="_blank" rel="noopener">
            megamillions.com
          </a>
        </li>
        <li>The official website of your state lottery</li>
      </ul>

      <h2>Disclaimer of Warranties</h2>
      <p>
        The Site is provided <strong>&quot;as is&quot;</strong> without warranties of any
        kind, either express or implied. To the fullest extent permitted by law, we disclaim
        all warranties including merchantability, fitness for a particular purpose, and
        non-infringement.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        Lotto.Gon US, its operators, and affiliates shall not be liable for any direct,
        indirect, incidental, consequential, or punitive damages arising from your use of
        the Site, including but not limited to lost profits, lost data, or losses incurred
        in any lottery participation decision based on Site content.
      </p>

      <h2>Responsible Gambling</h2>
      <p>
        Lottery play should never be used as a source of income or a strategy for resolving
        financial difficulty. If you or someone you know may have a gambling problem, please
        visit{' '}
        <Link href="/us/responsible-gambling">our Responsible Gambling resources page</Link>{' '}
        or call the National Council on Problem Gambling helpline:{' '}
        <strong>1-800-GAMBLER</strong> (1-800-426-2537).
      </p>

      <h2>Third-Party Services</h2>
      <p>
        The Site uses third-party services (Google AdSense, Google Analytics) for
        advertising and traffic analytics. See the{' '}
        <Link href="/us/privacy">Privacy Policy</Link> for details.
      </p>

      <h2>Changes to These Terms</h2>
      <p>
        We may update these Terms. The &quot;Last updated&quot; date reflects the most
        recent revision. Continued use after a change indicates acceptance.
      </p>

      <h2>Governing Law</h2>
      <p>
        These Terms are governed by the laws of the operator&apos;s home jurisdiction,
        without regard to conflict-of-law principles. Disputes arising from these Terms or
        Site use shall first be addressed in good-faith negotiation.
      </p>

      <h2>Contact</h2>
      <p>
        For questions, contact the operator at <code>z1533226z@gmail.com</code>.
      </p>
    </article>
  );
}
