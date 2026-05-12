/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f1',
          100: '#ffdfdf',
          200: '#ffc5c5',
          300: '#ff9d9d',
          400: '#ff6464',
          500: '#ff2e2e',
          600: '#e51010', // Rich Crimson
          700: '#c00a0a',
          800: '#9f0d0d',
          900: '#841111',
          950: '#480303',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a', // Deep Navy
        },
        accent: {
          500: '#06b6d4', // Cyan Tech Accent
          600: '#0891b2',
        },
        success: {
          500: '#10b981',
          600: '#059669',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
        'glass': 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
