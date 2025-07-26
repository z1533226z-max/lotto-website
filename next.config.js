/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
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
              *.gstatic.com;
              frame-src 'self' 
              *.googlesyndication.com 
              *.google.com;
              img-src 'self' data: 
              *.googlesyndication.com 
              *.google.com 
              *.gstatic.com;
            `.replace(/\s+/g, ' ').trim(),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;