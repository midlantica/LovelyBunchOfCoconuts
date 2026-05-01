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
          heading: 'var(--color-text-heading)',
          muted: 'var(--color-text-muted)',
          subtle: 'var(--color-text-subtle)',
          disabled: 'var(--color-text-disabled)',
          icon: 'var(--color-text-icon)',
          border: 'var(--color-border)',
          'border-subtle': 'var(--color-border-subtle)',
          'border-hover': 'var(--color-border-hover)',
        },
        // British Union Flag — three named scales
        // union-blue: navy scale, 900 = exact flag spec #012169
        'union-blue': {
          50:  '#eef1f8',
          100: '#d5ddf0',
          200: '#adbae1',
          300: '#7f93ce',
          400: '#5570bb',
          500: '#3453a8',
          600: '#1f3d8f',
          700: '#162d78',
          800: '#0c1f5c',
          900: '#012169',
          950: '#010f35',
        },
        // union-red: crimson scale, 500 = exact flag spec #CF142B
        'union-red': {
          50:  '#fff0f2',
          100: '#ffd6db',
          200: '#ffadb7',
          300: '#ff7a8a',
          400: '#f5475a',
          500: '#CF142B',
          600: '#a80d22',
          700: '#85091a',
          800: '#620614',
          900: '#40040d',
          950: '#200206',
        },
        // union-white: greyscale (white → black), 0 = pure white
        'union-white': {
          0:   '#ffffff',
          50:  '#f8f8f8',
          100: '#f0f0f0',
          200: '#e0e0e0',
          300: '#c8c8c8',
          400: '#a8a8a8',
          500: '#888888',
          600: '#666666',
          700: '#444444',
          800: '#2a2a2a',
          900: '#1a1a1a',
          950: '#0d0d0d',
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
