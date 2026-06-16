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
        theme: {
          bg: '#f5f5f3',
          dark: '#111111',
          muted: '#777777',
          border: '#e2e2df',
          'card-bg': '#ffffff',
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