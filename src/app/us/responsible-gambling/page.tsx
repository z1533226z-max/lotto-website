import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Responsible Gambling — Lottery Help &amp; Resources',
  description:
    'If lottery play is harming your finances, relationships, or wellbeing, help is available. National Council on Problem Gambling: 1-800-GAMBLER. State-by-state resources and self-exclusion programs.',
  alternates: { canonical: '/us/responsible-gambling' },
  robots: { index: true, follow: true },
};

interface Resource {
  name: string;
  description: string;
  contact: string;
  url?: string;
}

const NATIONAL_RESOURCES: Resource[] = [
  {
    name: 'National Council on Problem Gambling',
    description: '24/7 confidential helpline, online chat, and text support for anyone affected by problem gambling — including family members.',
    contact: '1-800-GAMBLER (1-800-426-2537) · text 800GAM',
    url: 'https://www.ncpgambling.org/help-treatment/',
  },
  {
    name: 'Gamblers Anonymous',
    description: 'Free 12-step peer support program with in-person and online meetings nationwide.',
    contact: '1-855-2-CALL-GA (1-855-222-5542)',
    url: 'https://www.gamblersanonymous.org',
  },
  {
    name: 'SAMHSA National Helpline',
    description: 'General mental health and substance use referral, including problem gambling co-occurring with other concerns.',
    contact: '1-800-662-HELP (1-800-662-4357)',
    url: 'https://www.samhsa.gov/find-help/national-helpline',
  },
  {
    name: '988 Suicide &amp; Crisis Lifeline',
    description: 'If gambling-related distress includes thoughts of self-harm, call or text 988 immediately. Free, confidential, 24/7.',
    contact: 'Call or text 988',
    url: 'https://988lifeline.org',
  },
];

const SIGNS = [
  'Spending more on lottery tickets than you can afford to lose',
  'Borrowing money or selling possessions to fund lottery play',
  'Hiding the amount or frequency of lottery purchases from family or friends',
  'Feeling restless or irritable when not buying tickets',
  'Chasing losses by buying more tickets after a losing streak',
  'Lying about lottery activity or its financial impact',
  'Skipping work, school, or family obligations to buy or check tickets',
];

export default function ResponsibleGamblingPage() {
  return (
    <article className="prose prose-gray max-w-none dark:prose-invert">
      <h1>Responsible Gambling</h1>

      <p className="lead">
        Lottery play is meant to be a low-stakes form of entertainment. For some, it stops
        being entertainment. If you or someone you know has lost control of lottery
        spending, help is free, confidential, and available 24/7.
      </p>

      <div className="not-prose my-6 rounded-lg border-l-4 border-orange-600 bg-orange-50 p-4 dark:bg-orange-950/30">
        <p className="font-semibold">Need help right now?</p>
        <p className="mt-1 text-2xl font-bold">1-800-GAMBLER</p>
        <p className="text-sm">National Council on Problem Gambling — call, chat, or text. Free, confidential, 24/7.</p>
      </div>

      <h2>National Resources</h2>
      <ul>
        {NATIONAL_RESOURCES.map((r) => (
          <li key={r.name}>
            <strong>{r.name}</strong> — {r.description}
            <br />
            <span className="text-sm">
              {r.contact}
              {r.url && (
                <>
                  {' · '}
                  <a href={r.url} target="_blank" rel="noopener">
                    {r.url.replace(/^https?:\/\//, '')}
                  </a>
                </>
              )}
            </span>
          </li>
        ))}
      </ul>

      <h2>State-Level Help</h2>
      <p>
        Every US state with legal lottery participation operates a problem gambling
        helpline and self-exclusion program. Many state lotteries also publish a
        self-exclusion list that bars participation in retail or online lottery products
        for a chosen period (1 year, 5 years, or lifetime).
      </p>
      <p>
        A current directory by state is maintained by the National Council on Problem
        Gambling at{' '}
        <a
          href="https://www.ncpgambling.org/help-treatment/help-by-state/"
          target="_blank"
          rel="noopener"
        >
          ncpgambling.org/help-treatment/help-by-state/
        </a>
        .
      </p>

      <h2>Warning Signs</h2>
      <p>Problem gambling can develop gradually. Common warning signs include:</p>
      <ul>
        {SIGNS.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>

      <h2>Self-Help Strategies</h2>
      <ul>
        <li>
          <strong>Set a budget</strong> for lottery spending and treat it as entertainment
          expense — never as a financial plan.
        </li>
        <li>
          <strong>Use the self-exclusion list</strong> in your state if buying tickets has
          become compulsive.
        </li>
        <li>
          <strong>Talk to someone</strong>. A trusted friend, family member, or counselor
          can help break the isolation that often accompanies problem gambling.
        </li>
        <li>
          <strong>Remove access</strong>. Avoid retailers that sell lottery tickets, delete
          lottery apps, and restrict the route between home and lottery vendors.
        </li>
      </ul>

      <h2>For Family &amp; Friends</h2>
      <p>
        If you are concerned about someone else, the National Council on Problem Gambling
        offers free support specifically for family members. Calling 1-800-GAMBLER on
        someone else&apos;s behalf is welcomed and will not result in any disclosure to
        them.
      </p>

      <h2>About This Site</h2>
      <p>
        Lotto.Gon US publishes lottery analysis and a number generator. We do not sell
        tickets and earn no commission on lottery participation. The probability of winning
        any prize tier is fixed by each game&apos;s official rules; <strong>no tool on this
        Site can change those odds</strong>. We include this resource page because we
        believe accurate information about problem gambling belongs alongside any lottery
        content.
      </p>
    </article>
  );
}
