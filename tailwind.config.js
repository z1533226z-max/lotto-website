/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors - 2색 체계
        primary: {
          50: '#FDF2ED',
          100: '#FBDFD3',
          200: '#F7BFA7',
          300: '#F09A76',
          400: '#D36135',
          DEFAULT: '#D36135',
          500: '#C05430',
          600: '#A64729',
          700: '#8C3B22',
          800: '#73301C',
          900: '#5A2516',
        },
        secondary: {
          50: '#EDF5F0',
          100: '#D4E8DB',
          200: '#B0D4BE',
          300: '#84BC9B',
          400: '#5A9E77',
          DEFAULT: '#3E5641',
          500: '#3E5641',
          600: '#354A38',
          700: '#2C3E2F',
          800: '#233226',
          900: '#1A261D',
        },
        // Lotto ball colors (데이터 표시용 예외)
        'lotto-red': '#FF4444',
        'lotto-orange': '#FF8800',
        'lotto-yellow': '#FFDD00',
        'lotto-blue': '#0088FF',
        'lotto-purple': '#8844FF',
        'lotto-bonus': '#FFD700',
      },
      fontFamily: {
        sans: ['var(--font-pretendard)', 'var(--font-noto-sans-kr)', 'Noto Sans KR', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
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
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      screens: {
        xs: '475px',
      },
      boxShadow: {
        lotto: '0 4px 8px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        card: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
        elevated: '0 12px 40px -8px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.08)',
        'elevated-dark': '0 12px 40px -8px rgba(0, 0, 0, 0.4), 0 4px 12px -2px rgba(0, 0, 0, 0.2)',
        glow: '0 0 20px rgba(211, 97, 53, 0.3), 0 0 60px rgba(211, 97, 53, 0.1)',
        'glow-secondary': '0 0 20px rgba(62, 86, 65, 0.3), 0 0 60px rgba(62, 86, 65, 0.1)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
        '3xl': '64px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        shimmer: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
        'shimmer-dark': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
      },
      backgroundSize: {
        shimmer: '200% 100%',
      },
    },
  },
  plugins: [],
};
