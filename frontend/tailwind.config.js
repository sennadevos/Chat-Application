/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      colors: {
        // Backgrounds
        background: {
          DEFAULT: '#ffffff',
          dark: '#0f172a',
        },
        surface: {
          DEFAULT: '#f8fafc',
          dark: '#1e293b',
        },
        
        // Text
        text: {
          primary: {
            DEFAULT: '#0f172a',
            dark: '#f1f5f9',
          },
          secondary: {
            DEFAULT: '#647488',
            dark: '#94a3b8',
          }
        },

        // Primary Brand
        primary: {
          DEFAULT: '#6366f1', // indigo-500
          hover: '#4f46e5',   // indigo-600
          dark: '#818cf8',    // indigo-400
        }
      },
    },
  },
  plugins: [],
}
