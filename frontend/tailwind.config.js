tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },

        // Backgrounds / surfaces (very light in light mode, very dark in dark mode)
        background: {
          DEFAULT: '#f8fafc',  // light mode base (almost white)
          dark: '#0f172a',     // dark mode base (almost black)
        },
        surface: {
          DEFAULT: '#ffffff',  // cards, floating panels in light
          dark: '#1e293b',     // cards, floating panels in dark
          hovered: '#f1f5f9',  // light mode hover
          'hovered-dark': '#334155',
        },

        // Text colors
        text: {
          primary: {
            DEFAULT: '#0f172a',  // nearly black on light
            dark: '#f8fafc',     // nearly white on dark
          },
          secondary: {
            DEFAULT: '#475569',
            dark: '#94a3b8',
          },
          muted: {
            DEFAULT: '#64748b',
            dark: '#64748b',
          },
        },

        // Accent / secondary colors
        accent: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // emerald accent
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },

        // Neutral grays (clean and modern)
        gray: {
          50:  '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
      },
    },
  },
};