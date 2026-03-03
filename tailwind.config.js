/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography'

export default {
  content: [
    './app/components/**/*.{vue,js,jsx,mjs,ts,tsx}',
    './app/layouts/**/*.{vue,js,jsx,mjs,ts,tsx}',
    './app/pages/**/*.{vue,js,jsx,mjs,ts,tsx}',
    './app/plugins/**/*.{js,ts,mjs}',
    './app/composables/**/*.{js,ts,mjs}',
    './app/utils/**/*.{js,ts,mjs}',
    './app/app.{vue,js,jsx,mjs,ts,tsx}',
    // Removed: './app/content/**/*.{md,mdx}', (not needed for Tailwind scanning)
  ],
  theme: {
    extend: {
      fontWeight: {
        100: 100,
        200: 200,
        300: 300,
        400: 400,
        500: 500,
      },
      boxShadow: {
        // Frequently used custom shadows
        modal: '0 6px 10px -3px black',
        'share-shelf': '0 8px 12px -6px black',
        'inset-card': 'inset 0 0 12px 0 var(--color-shadow-inset, #0f1e24)',
      },
      fontFamily: {
        helvetica: ['Helvetica', 'Arial', 'sans-serif'],
        sans: ['Barlow Condensed', 'Arial', 'Helvetica', 'sans-serif'],
        mono: ['Fira Code', 'ui-monospace', 'SFMono-Regular'],
      },
      screens: {
        xs: '320px',
        // => @media (min-width: 320px) { ... }
        meme2: '460px',
        // Custom: keep meme rows 2-up until below 460px
      },
      colors: {
        // Semantic theme tokens — respond to dark/light theme switching
        theme: {
          base: 'var(--color-bg-base)',
          surface: 'var(--color-bg-surface)',
          elevated: 'var(--color-bg-elevated)',
          overlay: 'var(--color-bg-overlay)',
          accent: 'var(--color-accent)',
          'accent-hover': 'var(--color-accent-hover)',
          'accent-light': 'var(--color-accent-light)',
          body: 'var(--color-text-body)',
          muted: 'var(--color-text-muted)',
          subtle: 'var(--color-text-subtle)',
          disabled: 'var(--color-text-disabled)',
          icon: 'var(--color-text-icon)',
          border: 'var(--color-border)',
          'border-subtle': 'var(--color-border-subtle)',
          'border-hover': 'var(--color-border-hover)',
        },
        seagull: {
          50: '#f0f9ff',
          100: '#dff3ff',
          200: '#b8e8ff',
          300: '#6dd3ff',
          400: '#33c3fd',
          500: '#09acee',
          600: '#0089cc',
          700: '#006ea5',
          800: '#045d88',
          900: '#0a4d70',
          950: '#06304b',
        },
      },
    },
  },
  plugins: [
    typography,
    function ({ addComponents }) {
      addComponents({
        '.card': {
          'background-color': 'var(--color-bg-surface)',
          'border-color': 'var(--color-border)',
          '@apply shadow-xl border rounded-md': {},
        },
      })
    },
  ],
}
