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
        300: 300,
        400: 400,
        500: 500,
      },
      boxShadow: {
        // Frequently used custom shadows
        modal: '0 4px 20px -10px black',
        'inset-card': 'inset 0 0 12px 0 #0f1e24',
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
          '@apply bg-slate-900/60 shadow-xl border-t border-seagull-600/30 rounded-md':
            {},
        },
      })
    },
  ],
}
