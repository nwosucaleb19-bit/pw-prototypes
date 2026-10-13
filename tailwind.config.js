/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        parkway: {
          bg: '#FAFAFA',
          surface: '#FFFFFF',
          grey03: '#C6C6C6',
          grey05: '#EFEFEF',
          grey06: '#FBFBFB',
          grey09: '#444444',
          grey10: '#1F1F1F',
          tangerine01: '#F9956B',
          tangerine08: '#643C2B',
          warn: '#FFC700',
          red: '#FC5555',
        },
      },
      fontFamily: {
        manrope: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"PP Right Gothic"', '"Playfair Display"', 'ui-serif', 'Georgia', 'serif'],
      },
      boxShadow: {
        phone: '0 30px 60px -20px rgba(31, 31, 31, 0.25), 0 10px 25px -10px rgba(31,31,31,0.15)',
      },
    },
  },
  plugins: [],
}
