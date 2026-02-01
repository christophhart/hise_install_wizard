/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: '#90FFB1',
        background: '#222',
        surface: '#2a2a2a',
        border: '#555',
      },
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
      borderWidth: {
        DEFAULT: '1px',
      },
    },
  },
  plugins: [],
}
