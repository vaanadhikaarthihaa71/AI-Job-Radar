/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['DM Serif Display', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        paper: {
          DEFAULT: '#F8F6F0', // Warm sand off-white
          surface: '#FFFFFF', // Clean surface white
          dark: '#121614',
          'dark-surface': '#1A201D',
        },
        ink: {
          DEFAULT: '#18181B', // Deep charcoal text
          muted: '#52525B', // Muted slate gray
          dark: '#F4F4F5',
          'dark-muted': '#A1A1AA',
        },
        line: {
          DEFAULT: '#E4E4E7', // Crisp border
          dark: '#272F2B',
        },
        forest: {
          DEFAULT: '#0F382C', // Deep Forest Green accent
          hover: '#155E46',   // Forest Emerald hover
          subtle: '#E6EFEA',  // Soft Sage tint
        },
        signal: {
          DEFAULT: '#0F382C', // Primary Emerald Forest accent
          hover: '#155E46',
          subtle: '#E6EFEA',
        },
        state: {
          success: '#15803D',
          warning: '#B45309',
          error: '#B91C1C',
        },
      },
      animation: {
        'signal-pulse': 'signalPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ledger-enter': 'ledgerEnter 0.25s ease-out forwards',
      },
      keyframes: {
        signalPulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.25 },
        },
        ledgerEnter: {
          '0%': { opacity: 0, transform: 'translateY(-6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
