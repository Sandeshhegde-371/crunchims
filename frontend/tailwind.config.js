/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          600: '#059669', // emerald-600
          500: '#10b981', // emerald-500
        },
        secondary: {
          600: '#0d9488', // teal-600
          500: '#14b8a6', // teal-500
        },
        background: '#FDFDFF',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
