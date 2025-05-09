/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{vue,js,jsx,mjs,ts,tsx}",
    "./layouts/**/*.{vue,js,jsx,mjs,ts,tsx}",
    "./pages/**/*.{vue,js,jsx,mjs,ts,tsx}",
    "./plugins/**/*.{js,ts,mjs}",
    "./composables/**/*.{js,ts,mjs}",
    "./utils/**/*.{js,ts,mjs}",
    "./app.{vue,js,jsx,mjs,ts,tsx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        Barlow: ["'Barlow Condensed', sans-serif"], // Custom font with fallback
        sans: ["'Barlow Condensed', serif, Arial, Helvetica"],
        serif: ["'Barlow Condensed', serif, Georgia"],
        mono: ['"Fira Code"', "ui-monospace", "SFMono-Regular"],
      },
      screens: {
        xs: "320px",
        // => @media (min-width: 320px) { ... }
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}
