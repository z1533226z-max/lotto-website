import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://lotto-king.vercel.app'),
  title: '로또킹 - AI가 추천하는 로또번호',
  description: '딥러닝 분석으로 뽑은 이번주 고확률 로또번호를 무료로 확인하세요! 1,180회 데이터 분석 기반 AI 추천번호, 당첨통계, 번호분석을 제공합니다.',
  keywords: ['로또', '로또번호', 'AI추천', '당첨번호', '로또분석', '로또통계', '번호생성', '로또예측'],
  authors: [{ name: 'Lotto King' }],
  creator: 'Lotto King',
  publisher: 'Lotto King',
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
    google: 'your-google-verification-code',
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
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}