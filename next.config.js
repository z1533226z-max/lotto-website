/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  // 오래된 URL을 새 경로로 리디렉션 (Google Search Console 404 해결)
  async redirects() {
    return [
      // /lotto/numbers 페이지는 없음(404) → AI 번호 생성기가 있는 홈으로
      { source: '/prediction', destination: '/', permanent: true },
      { source: '/results', destination: '/lotto/list', permanent: true },
      { source: '/statistics', destination: '/lotto/statistics', permanent: true },
      // 빈도 허브 → 전체 기간. 페이지의 redirect()는 빌드 때 정적 프리렌더되어
      // Location 헤더 없는 307이 나가므로, 페이지보다 먼저 처리되는 설정 리다이렉트로 처리
      { source: '/lotto/frequency', destination: '/lotto/frequency/all', permanent: true },
    ];
  },
  // AdSense·GA4 도메인 허용을 위한 CSP 설정
  // 기준: Google 태그 CSP 가이드(GA4 + 광고 기능) https://developers.google.com/tag-platform/security/guides/csp
  //  - img-src: www.googletagmanager.com, *.google-analytics.com, *.google.<TLD>(한국 *.google.co.kr)
  //  - connect-src: *.google.<TLD>, (*.analytics.google.com: GA4 수집 도메인)
  //  - frame-src: www.googletagmanager.com
  // 애드센스 트래픽 품질 검증(*.adtrafficquality.google)은 이미지 비콘도 쓰므로 img-src에도 허용
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              script-src 'self' 'unsafe-inline' 'unsafe-eval'
              *.googlesyndication.com
              *.googletagmanager.com
              *.google.com
              *.gstatic.com
              *.doubleclick.net
              *.googleadservices.com
              *.adtrafficquality.google;
              frame-src 'self' 
              *.googlesyndication.com 
              *.google.com
              *.doubleclick.net
              *.googleadservices.com
              *.adtrafficquality.google
              www.googletagmanager.com;
              img-src 'self' data: 
              *.googlesyndication.com 
              *.google.com 
              *.gstatic.com
              *.doubleclick.net
              *.googleadservices.com
              *.google-analytics.com
              www.googletagmanager.com
              *.adtrafficquality.google
              *.google.co.kr;
              connect-src 'self'
              *.googlesyndication.com
              *.google.com
              *.google-analytics.com
              *.analytics.google.com
              *.googletagmanager.com
              *.google.co.kr
              *.doubleclick.net
              *.googleadservices.com
              *.adtrafficquality.google
              *.up.railway.app;
            `.replace(/\s+/g, ' ').trim(),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;