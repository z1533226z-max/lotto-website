import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Script from 'next/script';
import { ThemeProvider, themeScript } from '@/components/providers/ThemeProvider';
import AuthProvider from '@/components/providers/AuthProvider';
import AuthModal from '@/components/auth/AuthModal';
import GamificationProvider from '@/components/gamification/GamificationProvider';

const pretendard = localFont({
  src: '../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2',
  display: 'swap',
  variable: '--font-pretendard',
  weight: '100 900',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://lotto.gon.ai.kr'),
  title: "AI 로또 번호 생성기 - 무료 당첨번호 예측 분석 | 로또킹",
  description: "AI가 분석한 이번 주 로또 예상번호를 무료로 확인하세요. 1,200회+ 당첨 데이터 기반 패턴 분석, 핫/콜드 번호, 번호 생성기 제공.",
  keywords: ['로또', '로또번호', 'AI추천', '당첨번호', '로또분석', '로또통계', '번호생성', '로또예측', '인공지능', '딥러닝'],
  authors: [{ name: 'Lotto AI' }],
  creator: 'Lotto AI',
  publisher: 'Gon AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'AI 로또번호 추천 - 로또킹',
    description: '역대 전체 회차 데이터 분석으로 찾은 패턴으로 번호를 추천합니다. 매주 업데이트되는 AI 분석 결과를 확인해보세요!',
    url: 'https://lotto.gon.ai.kr',
    siteName: '로또킹',
    // OG 이미지는 opengraph-image.tsx에서 동적 생성
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI 로또 번호 추천 - 무료 번호 예측 | 로또킹',
    description: 'AI 로또 번호 추천! 1,200회+ 딥러닝 분석으로 이번주 고확률 번호 5세트 무료 제공. 지금 확인!',
    // 이미지는 opengraph-image.tsx에서 동적 생성
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {},
  verification: {
    google: 'WUrfnWHUFd9icr_v6BWbC5IWS2mG_Dca7LBuL9Plx-I',
    other: {
      'naver-site-verification': 'naver82bcee989c4f1873f6574a304e3bafdd',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={pretendard.variable} suppressHydrationWarning>
      <head>
        {/* Theme initialization script - prevents flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />

        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />

        {/* Favicons - icon.tsx, apple-icon.tsx에서 동적 생성 */}
        <link rel="icon" href="/favicon.ico" />

        {/* Google AdSense Account */}
        <meta name="google-adsense-account" content="ca-pub-7479840445702290" />

        {/* 추가 메타태그 */}
        <meta name="theme-color" content="#D36135" />
        <meta name="msapplication-TileColor" content="#D36135" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={pretendard.className}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <GamificationProvider />
            <AuthModal />
          </AuthProvider>
        </ThemeProvider>

        {/* Google Analytics 4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
          `}
        </Script>

        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7479840445702290"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
