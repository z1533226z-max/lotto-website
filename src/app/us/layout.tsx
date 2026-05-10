import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  metadataBase: new URL('https://lotto.gon.ai.kr'),
  title: {
    default: 'US Lottery Hub — Powerball & Mega Millions Analysis',
    template: '%s | Lotto.Gon US',
  },
  description:
    'Free Powerball and Mega Millions analysis, number generator, prize odds breakdown, and tax calculator. Updated draws, statistics, and tools — no login required.',
  alternates: {
    canonical: '/us',
  },
  openGraph: {
    title: 'US Lottery Hub — Powerball & Mega Millions',
    description:
      'Powerball and Mega Millions tools, statistics, and prize-odds explained — fast, free, no signup.',
    url: 'https://lotto.gon.ai.kr/us',
    siteName: 'Lotto.Gon US',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'US Lottery Hub — Powerball & Mega Millions',
    description:
      'Free Powerball and Mega Millions tools, prize-odds breakdown, and number generator.',
  },
  robots: { index: true, follow: true },
};

export default function USLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="en" className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/us" className="text-lg font-bold tracking-tight">
            Lotto.Gon <span className="text-orange-600">US</span>
          </Link>
          <ul className="flex gap-4 text-sm font-medium">
            <li>
              <Link href="/us/powerball" className="hover:text-orange-600">
                Powerball
              </Link>
            </li>
            <li>
              <Link href="/us/mega-millions" className="hover:text-orange-600">
                Mega Millions
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      <footer className="mt-12 border-t border-gray-200 px-4 py-6 text-center text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
        <p>
          Independent analysis. Not affiliated with the Multi-State Lottery Association,
          Mega Millions Consortium, or any state lottery. Players must be 18+ (21+ in some states).
        </p>
        <p className="mt-2">
          Need help with problem gambling? Call <strong>1-800-GAMBLER</strong> ·{' '}
          <Link href="/us/responsible-gambling" className="hover:text-orange-600">
            Resources
          </Link>
        </p>
        <p className="mt-3 space-x-2">
          <Link href="/us/privacy" className="hover:text-orange-600">
            Privacy
          </Link>
          <span aria-hidden>·</span>
          <Link href="/us/terms" className="hover:text-orange-600">
            Terms
          </Link>
          <span aria-hidden>·</span>
          <Link href="/us/responsible-gambling" className="hover:text-orange-600">
            Responsible Gambling
          </Link>
          <span aria-hidden>·</span>
          <Link href="/" className="hover:text-orange-600">
            한국 로또
          </Link>
          <span aria-hidden>·</span>
          <a href="https://www.powerball.com" target="_blank" rel="noopener" className="hover:text-orange-600">
            Powerball.com
          </a>
          <span aria-hidden>·</span>
          <a href="https://www.megamillions.com" target="_blank" rel="noopener" className="hover:text-orange-600">
            MegaMillions.com
          </a>
        </p>
      </footer>
    </div>
  );
}
