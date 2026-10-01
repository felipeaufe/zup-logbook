/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        '2xs': ['12px', { lineHeight: '16px' }],
        'xs': ['13px', { lineHeight: '18px' }],
        'sm': ['13px', { lineHeight: '18px' }],
        'base': ['14px', { lineHeight: '21px' }],
      },
      colors: {
        zup: {
          50: '#fbf7ff',
          100: '#f4edff',
          200: '#eadaff',
          300: '#d7baff',
          400: '#be8cff',
          500: '#9b51e0',
          600: '#7c3aed',
          700: '#6d28d9',
          brand: '#7c3aed', // Primary Zup Purple
          brandDark: '#6d28d9',
          dark: '#121316',
          card: '#1A1C23',
          border: '#2A2D3A',
        }
      }
    },
  },
  plugins: [],
}
