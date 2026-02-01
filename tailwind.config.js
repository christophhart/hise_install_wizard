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
          error: '#BB3434',
          success: '#4E8E35',
          warning: '#FFBA00',
          background: '#222',
          surface: '#333',
          border: '#444',
          code: {
            bg: '#111',
            text: '#999',
          },
        },
         fontFamily: {
           sans: ['Lato', 'sans-serif'],
           mono: ['Source Code Pro', 'monospace'],
         },
        borderRadius: {
          DEFAULT: '3px',
        },
      },
    },
  plugins: [],
}
