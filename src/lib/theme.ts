// Design System - Theme Tokens
// Centralized design token definitions for the lotto website

export const colors = {
  primary: {
    50: '#FFF3ED',
    100: '#FFE4D4',
    200: '#FFC5A8',
    300: '#FF9E71',
    400: '#FF6B35', // Main primary
    500: '#F54D10',
    600: '#E63A06',
    700: '#BA2B07',
    800: '#95240C',
    900: '#7A200E',
  },
  secondary: {
    50: '#E8F1FB',
    100: '#CDDFF5',
    200: '#A2C4EB',
    300: '#6BA0DC',
    400: '#3B7CC9',
    500: '#004E98', // Main secondary
    600: '#004080',
    700: '#003366',
    800: '#00264D',
    900: '#001933',
  },
  accent: {
    50: '#FFFBEB',
    100: '#FFF3C4',
    200: '#FFE68A',
    300: '#FFD23F', // Main accent / gold
    400: '#FFC107',
    500: '#E6A800',
    600: '#CC9500',
    700: '#A67A00',
    800: '#806000',
    900: '#664D00',
  },
  // Semantic colors
  success: {
    light: '#D1FAE5',
    DEFAULT: '#10B981',
    dark: '#059669',
  },
  warning: {
    light: '#FEF3C7',
    DEFAULT: '#F59E0B',
    dark: '#D97706',
  },
  danger: {
    light: '#FEE2E2',
    DEFAULT: '#EF4444',
    dark: '#DC2626',
  },
  info: {
    light: '#DBEAFE',
    DEFAULT: '#3B82F6',
    dark: '#2563EB',
  },
  // Light mode surfaces
  light: {
    bg: '#F8F9FA',
    bgAlt: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceHover: '#F3F4F6',
    surfaceActive: '#E5E7EB',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    text: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
  },
  // Dark mode surfaces
  dark: {
    bg: '#0F1117',
    bgAlt: '#161822',
    surface: '#1E2030',
    surfaceHover: '#282A3A',
    surfaceActive: '#323446',
    border: '#2E3046',
    borderLight: '#252738',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textTertiary: '#6B7280',
  },
} as const;

export const gradients = {
  primary: 'linear-gradient(135deg, #FF6B35 0%, #FF8F5E 100%)',
  secondary: 'linear-gradient(135deg, #004E98 0%, #0066CC 100%)',
  accent: 'linear-gradient(135deg, #FFD23F 0%, #FFE066 100%)',
  hero: 'linear-gradient(135deg, #FF6B35 0%, #004E98 100%)',
  heroReverse: 'linear-gradient(135deg, #004E98 0%, #FF6B35 100%)',
  sunset: 'linear-gradient(135deg, #FF6B35 0%, #FFD23F 100%)',
  ocean: 'linear-gradient(135deg, #004E98 0%, #3B82F6 100%)',
  gold: 'linear-gradient(135deg, #FFD23F 0%, #FF6B35 100%)',
  dark: 'linear-gradient(135deg, #1E2030 0%, #0F1117 100%)',
  darkSurface: 'linear-gradient(135deg, #282A3A 0%, #1E2030 100%)',
  // Glass overlays
  glassLight: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 100%)',
  glassDark: 'linear-gradient(135deg, rgba(30,32,48,0.8) 0%, rgba(30,32,48,0.4) 100%)',
} as const;

export const shadows = {
  // Light mode shadows
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  // Glass shadows
  glass: '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
  glassDark: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
  // Elevated
  elevated: '0 12px 40px -8px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.08)',
  elevatedDark: '0 12px 40px -8px rgba(0, 0, 0, 0.4), 0 4px 12px -2px rgba(0, 0, 0, 0.2)',
  // Glow
  glowPrimary: '0 0 20px rgba(255, 107, 53, 0.3), 0 0 60px rgba(255, 107, 53, 0.1)',
  glowSecondary: '0 0 20px rgba(0, 78, 152, 0.3), 0 0 60px rgba(0, 78, 152, 0.1)',
  glowAccent: '0 0 20px rgba(255, 210, 63, 0.3), 0 0 60px rgba(255, 210, 63, 0.1)',
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.375rem',    // 6px
  DEFAULT: '0.5rem', // 8px
  md: '0.75rem',     // 12px
  lg: '1rem',        // 16px
  xl: '1.25rem',     // 20px
  '2xl': '1.5rem',   // 24px
  full: '9999px',
} as const;

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
} as const;

export const typography = {
  fontFamily: {
    sans: ['Noto Sans KR', 'sans-serif'],
    mono: ['Roboto Mono', 'monospace'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  },
} as const;

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  DEFAULT: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: '500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  spring: '500ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const zIndex = {
  dropdown: 50,
  sticky: 100,
  overlay: 200,
  modal: 300,
  popover: 400,
  toast: 500,
} as const;

// Theme type definition
export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  colors: typeof colors;
  gradients: typeof gradients;
  shadows: typeof shadows;
  borderRadius: typeof borderRadius;
  spacing: typeof spacing;
  typography: typeof typography;
  transitions: typeof transitions;
  breakpoints: typeof breakpoints;
  zIndex: typeof zIndex;
}

export const theme: Theme = {
  mode: 'light',
  colors,
  gradients,
  shadows,
  borderRadius,
  spacing,
  typography,
  transitions,
  breakpoints,
  zIndex,
};

export default theme;
