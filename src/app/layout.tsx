import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://lotto.gon.ai.kr'),
  title: '로또 AI 예측 - 인공지능 로또번호 추천',
  description: '최신 AI 기술로 분석한 로또번호 예측 서비스. 1,180회 데이터 기반 당첨 확률 높은 번호 추천과. 실시간 통계와 트렌드 분석 제공.',
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
    description: '1,180회 데이터 분석으로 찾은 패턴으로 번호를 추천합니다. 매주 업데이트되는 AI 분석 결과를 확인해보세요!',
    url: 'https://lotto-king.vercel.app',
    siteName: '로또킹',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: '로또킹 - AI 로또번호 추천 서비스',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI 로또번호 추천 - 로또킹',
    description: '딥러닝 분석으로 뽑은 이번주 고확률 로또번호를 무료로 확인하세요!',
    images: ['/images/og-image.png'],
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
  verification: {
    google: 'WUrfnWHUFd9icr_v6BWbC5IWS2mG_Dca7LBuL9Plx-I',
  },
};

// 구조화 데이터 (JSON-LD)
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '로또킹',
  description: 'AI 기반 로또번호 추천 서비스',
  url: 'https://lotto-king.vercel.app',
  applicationCategory: 'Entertainment',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'KRW',
    description: '무료 AI 로또번호 추천 서비스'
  },
  provider: {
    '@type': 'Organization',
    name: '로또킹',
    url: 'https://lotto-king.vercel.app'
  },
  featureList: [
    'AI 기반 번호 추천',
    '당첨번호 조회',
    '통계 분석',
    '번호 저장',
    '당첨 시뮬레이터'
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* 구조화 데이터 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        
        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Google AdSense Account */}
        <meta name="google-adsense-account" content="ca-pub-7479840445702290" />
        
        {/* 추가 메타태그 */}
        <meta name="theme-color" content="#FF6B35" />
        <meta name="msapplication-TileColor" content="#FF6B35" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={inter.className}>
        {children}
        
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
