/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        '2xs': ['14px', { lineHeight: '20px' }],
        'xs': ['14px', { lineHeight: '20px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
      },
      colors: {
        zup: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          brand: '#FF6B00', // Iconic orange / tech tone
          brandDark: '#E05300',
          dark: '#121316',
          card: '#1A1C23',
          border: '#2A2D3A',
        }
      }
    },
  },
  plugins: [],
}
