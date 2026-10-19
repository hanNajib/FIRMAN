/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./script.js",
    "./src/**/*.{html,js,css}",
    "./assets/**/*.{svg,html,js}"
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        ocean: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        tuna: {
          50: '#f8fafc',
          500: '#64748b',
          800: '#1e293b',
          900: '#0f172a',
        },
        coral: {
          500: '#f97316',
          600: '#ea580c',
        }
      },
    },
  },
  plugins: [],
};
