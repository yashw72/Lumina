/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0B0B0F',
          soft: '#17171C',
        },
        cream: {
          DEFAULT: '#FBF8F2',
          surface: '#FDFBF7',
        },
        lilac: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
          700: '#7E22CE',
          800: '#6B21A8',
          900: '#581C87',
        },
        accent: {
          orange: '#FF7A3D',
          deepOrange: '#F2612A',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans Variable"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '28px',
        section: '36px',
        shell: '40px',
      },
      boxShadow: {
        card: '0 8px 30px -12px rgba(15, 15, 30, 0.12)',
        'card-hover': '0 16px 40px -12px rgba(15, 15, 30, 0.18)',
        glow: '0 20px 60px -20px rgba(147, 51, 234, 0.35)',
        'orange-glow': '0 12px 30px -10px rgba(255, 122, 61, 0.4)',
      },
    },
  },
  plugins: [],
};
