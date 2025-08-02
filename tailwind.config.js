/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{vue,js,jsx,mjs,ts,tsx}',
    './layouts/**/*.{vue,js,jsx,mjs,ts,tsx}',
    './pages/**/*.{vue,js,jsx,mjs,ts,tsx}',
    './plugins/**/*.{js,ts,mjs}',
    './composables/**/*.{js,ts,mjs}',
    './utils/**/*.{js,ts,mjs}',
    './app.{vue,js,jsx,mjs,ts,tsx}',
    './content/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        Barlow: ["'Barlow Condensed', sans-serif"], // Custom font with fallback
        helvetica: ['Helvetica, Arial, sans-serif'], // Helvetica font stack
        sans: ["'Barlow Condensed', serif, Arial, Helvetica"],
        serif: ["'Barlow Condensed', serif, Georgia"],
        mono: ['"Fira Code"', 'ui-monospace', 'SFMono-Regular'],
      },
      screens: {
        xs: '320px',
        // => @media (min-width: 320px) { ... }
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
  plugins: [require('@tailwindcss/typography')],
}
