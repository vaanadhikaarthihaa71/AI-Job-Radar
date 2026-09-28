/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#090d16',
        card: '#111827',
        border: '#1f2937',
        accent: {
          50: '#eef2ff',
          500: '#6366f1',
          600: '#4f46e5',
        },
      },
      animation: {
        'fade-pulse': 'fadePulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-down': 'slideDown 0.4s ease-out forwards',
        'accent-flash': 'accentFlash 2.5s ease-out forwards',
      },
      keyframes: {
        fadePulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.3 },
        },
        slideDown: {
          '0%': { opacity: 0, transform: 'translateY(-12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        accentFlash: {
          '0%': { borderColor: 'rgba(99, 102, 241, 1)', backgroundColor: 'rgba(99, 102, 241, 0.15)' },
          '100%': { borderColor: 'rgba(31, 41, 55, 1)', backgroundColor: 'rgba(17, 24, 39, 1)' },
        },
      },
    },
  },
  plugins: [],
}
