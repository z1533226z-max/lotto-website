/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B35',    // 주색상 (신뢰감 있는 오렌지)
        secondary: '#004E98',  // 보조색상 (안정감 있는 블루)
        accent: '#FFD23F',     // 강조색상 (행운의 골드)
        background: '#F8F9FA', // 배경색 (깔끔한 회색)
        'lotto-red': '#FF4444',     // 1-10번
        'lotto-orange': '#FF8800',  // 11-20번
        'lotto-yellow': '#FFDD00',  // 21-30번
        'lotto-blue': '#0088FF',    // 31-40번
        'lotto-purple': '#8844FF',  // 41-45번
        'lotto-bonus': '#FFD700',   // 보너스번호
      },
      fontFamily: {
        'sans': ['Noto Sans KR', 'sans-serif'],
        'mono': ['Roboto Mono', 'monospace'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      screens: {
        'xs': '475px',
      },
      boxShadow: {
        'lotto': '0 4px 8px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'card': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};