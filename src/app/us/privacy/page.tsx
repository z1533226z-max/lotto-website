import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Lotto.Gon US handles data, cookies, and Google AdSense advertising. Independent analysis service — no registration, no email collection.',
  alternates: { canonical: '/us/privacy' },
  robots: { index: true, follow: true },
};

const LAST_UPDATED = '2026-05-10';

export default function PrivacyPage() {
  return (
    <article className="prose prose-gray max-w-none dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>

      <h2>Who We Are</h2>
      <p>
        Lotto.Gon US (the &quot;Site&quot;) is an independent, ad-supported analytics and
        information service for US multi-state lottery games — Powerball and Mega Millions.
        We are not affiliated with the Multi-State Lottery Association (MUSL), the Mega
        Millions Consortium, or any state lottery. We do not sell tickets and do not operate
        as a courier service.
      </p>

      <h2>What We Collect</h2>
      <p>
        We do not require user registration. We do not ask for your email, phone, or any
        personally identifiable information directly. The Site collects only the following
        on-page data automatically:
      </p>
      <ul>
        <li>
          <strong>Standard server logs</strong>: IP address, user agent, referrer, timestamp,
          and the page requested. Used for security and aggregate traffic analysis.
        </li>
        <li>
          <strong>Cookies and similar technologies</strong>: First-party cookies for site
          theme preferences and third-party cookies set by Google Analytics and Google AdSense
          (see below).
        </li>
      </ul>

      <h2>Google AdSense</h2>
      <p>
        We use <strong>Google AdSense</strong> (publisher ID ca-pub-7479840445702290) to
        serve ads on this site. Google&apos;s use of advertising cookies enables it and its
        partners to serve ads to you based on your visit to this and other sites on the
        Internet. You may opt out of personalized advertising by visiting{' '}
        <a
          href="https://www.google.com/settings/ads"
          target="_blank"
          rel="noopener"
        >
          Google Ads Settings
        </a>
        . You may also opt out of a third-party vendor&apos;s use of cookies for personalized
        ads by visiting{' '}
        <a href="https://www.aboutads.info/" target="_blank" rel="noopener">
          aboutads.info
        </a>{' '}
        or{' '}
        <a href="https://www.youronlinechoices.eu/" target="_blank" rel="noopener">
          youronlinechoices.eu
        </a>
        .
      </p>
      <p>
        For US visitors, this Site complies with applicable disclosures required for
        Google AdSense publisher policies, including the use of advertising cookies and
        device identifiers in accordance with Google&apos;s ad serving requirements.
      </p>

      <h2>Google Analytics 4</h2>
      <p>
        We use <strong>Google Analytics 4</strong> for aggregate traffic analytics. GA4 may
        collect device identifiers, page-view events, and approximate location data via
        anonymized IP. You may opt out by installing the{' '}
        <a
          href="https://tools.google.com/dlpage/gaoptout"
          target="_blank"
          rel="noopener"
        >
          Google Analytics opt-out browser add-on
        </a>
        .
      </p>

      <h2>Children&apos;s Privacy</h2>
      <p>
        This Site is intended for users 18 years of age or older (21+ in some
        jurisdictions). We do not knowingly collect data from children under 13. If you
        believe a minor has provided personal information, contact us so the data can be
        removed.
      </p>

      <h2>California &amp; State-Level Rights</h2>
      <p>
        California residents have rights under the California Consumer Privacy Act (CCPA)
        including the right to know what personal information is collected, the right to
        delete, and the right to opt out of &quot;sale&quot; of personal information.
        Lotto.Gon US does not sell personal information to third parties. To exercise CCPA
        rights, contact the address below. Similar rights may apply under Virginia (VCDPA),
        Colorado (CPA), Connecticut (CTDPA), and Utah (UCPA) state laws.
      </p>

      <h2>Cookie Choices</h2>
      <p>
        Most browsers allow you to refuse, delete, or block cookies. Refusing cookies may
        affect site functionality (e.g., theme preference will not persist). The Site does
        not currently display a cookie consent banner because no personal data is collected
        beyond what is required for advertising and analytics — but you remain free to
        manage cookies through your browser settings.
      </p>

      <h2>Third-Party Links</h2>
      <p>
        This Site links to official lottery operator sites such as powerball.com and
        megamillions.com. We are not responsible for the privacy practices of those sites.
      </p>

      <h2>Updates</h2>
      <p>
        We may update this policy. The &quot;Last updated&quot; date at the top of this page
        reflects the most recent revision. Continued use of the Site after a change indicates
        acceptance of the revised policy.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy can be sent to the operator of Lotto.Gon at{' '}
        <code>z1533226z@gmail.com</code>.
      </p>
    </article>
  );
}
