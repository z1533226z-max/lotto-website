/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  // 오래된 URL을 새 경로로 리디렉션 (Google Search Console 404 해결)
  async redirects() {
    return [
      { source: '/prediction', destination: '/lotto/numbers', permanent: true },
      { source: '/results', destination: '/lotto/list', permanent: true },
      { source: '/statistics', destination: '/lotto/statistics', permanent: true },
    ];
  },
  // AdSense 도메인 허용을 위한 CSP 설정
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
              *.googleadservices.com;
              img-src 'self' data: 
              *.googlesyndication.com 
              *.google.com 
              *.gstatic.com
              *.doubleclick.net
              *.googleadservices.com;
              connect-src 'self'
              *.googlesyndication.com
              *.google.com
              *.doubleclick.net
              *.googleadservices.com
              *.up.railway.app;
            `.replace(/\s+/g, ' ').trim(),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;