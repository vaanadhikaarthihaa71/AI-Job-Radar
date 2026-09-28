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
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Instrument Sans', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        paper: {
          DEFAULT: '#F4F1EA',
          subtle: '#EBE7DF',
          dark: '#121110',
          'dark-subtle': '#1A1917',
        },
        ink: {
          DEFAULT: '#1C1B18',
          muted: '#66635B',
          dark: '#E6E4DD',
          'dark-muted': '#8A877D',
        },
        line: {
          DEFAULT: '#D8D3C8',
          dark: '#2A2926',
        },
        signal: {
          DEFAULT: '#E04724', // Vermilion signal orange
          subtle: 'rgba(224, 71, 36, 0.1)',
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
