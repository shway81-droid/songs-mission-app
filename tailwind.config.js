/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 듀오링고 스타일 컬러
        primary: '#58CC02',
        'primary-dark': '#4CAD02',
        secondary: '#1CB0F6',
        'secondary-dark': '#1899D6',
        streak: '#FF9600',
        'streak-dark': '#E08600',
        background: '#235390',
        'background-dark': '#1A3D6D',
        success: '#58CC02',
        error: '#FF4B4B',
        warning: '#FFC800',
        gray: {
          100: '#F7F7F7',
          200: '#E5E5E5',
          300: '#AFAFAF',
          400: '#777777',
          500: '#4B4B4B',
        }
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'duo': '0 4px 0 0',
        'duo-sm': '0 2px 0 0',
      },
      animation: {
        'bounce-sm': 'bounce-sm 0.3s ease-in-out',
        'pop': 'pop 0.3s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-up-delay-1': 'slide-up 0.3s ease-out 0.1s both',
        'slide-up-delay-2': 'slide-up 0.3s ease-out 0.2s both',
        'scale-in': 'scale-in 0.2s ease-out',
      },
      keyframes: {
        'bounce-sm': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'pop': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
