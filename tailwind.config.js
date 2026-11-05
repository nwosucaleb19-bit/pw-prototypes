/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        parkway: {
          bg: '#FAFAFA',
          surface: '#FFFFFF',
          grey01: '#121212',
          grey02: '#999999',
          grey03: '#C6C6C6',
          grey04: '#DDDDDD',
          grey05: '#EFEFEF',
          grey06: '#FBFBFB',
          grey09: '#444444',
          grey10: '#1F1F1F',
          tangerine01: '#F9956B',
          tangerine04: '#FDD5C4',
          tangerine05: '#FEEAE1',
          tangerine06: '#FEF5F1',
          tangerine07: '#955940',
          tangerine08: '#643C2B',
          buff04: '#FAF1D2',
          buff03: '#F9F1D2',
          warn: '#FFC700',
          red: '#FC5555',
          success: '#44AC21',
          successBg: '#EBFAE5',
          pending: '#FF7A00',
          pendingBg: '#FFEFE0',
          failBg: '#FFEBEB',
        },
      },
      fontFamily: {
        manrope: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"PP Right Gothic"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        phone: '0 30px 60px -20px rgba(31, 31, 31, 0.25), 0 10px 25px -10px rgba(31,31,31,0.15)',
        'device-15': '0 40px 80px -30px rgba(0,0,0,0.45), 0 20px 40px -20px rgba(0,0,0,0.3)',
        card: '0 5px 7px rgba(0,0,0,0.07)',
      },
    },
  },
  plugins: [],
}
