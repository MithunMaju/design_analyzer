import type { Config } from 'tailwindcss';

export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: '#0a0a0f',
        panel: '#111118',
        border: '#1e1e2e',
        accent: '#6366f1',
        'accent-dim': '#4338ca',
        muted: '#52526a',
        foreground: '#e2e2f0',
        dim: '#8888a8',
        'accent-chrono': '#208b9b',
        'bg-chrono': '#030303',
        'card-chrono': '#0c0c0e',
        neutral: {
          50: '#f4f8f8',    // Finpay clean off-white background
          100: '#e2e8ec',   // Light border
          200: '#cfdadf',
          300: '#9cb5c5',
          400: '#6e8494',   // Finpay slate-blue text secondary
          500: '#4d687b',
          600: '#385062',
          700: '#253949',
          800: '#142531',
          900: '#092230',   // Finpay deep navy text primary
          950: '#062d3e',   // Finpay dark button background / contrast accent
        },
        theme: {
          bg: '#000000',
          dark: '#ffffff',
          muted: '#8e8e93',
          border: '#1c1c1e',
          'card-bg': '#0d0d0e',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
} satisfies Config;