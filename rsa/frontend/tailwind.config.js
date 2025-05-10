/** @type {import('tailwindcss').Config} */
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#AEFFDE', // Mint green
          100: '#E4F1FF',      // Light sky blue
          200: '#AEFFDE',      // Mint green
          800: '#8CD9B9',      // Medium mint green
          900: '#333333',      // Deep dark gray
        },
        accent: {
          light: '#E4F1FF',
          mint: '#AEFFDE',
          dark: '#333333',
          black: '#000000',
        },
        section: {
          light: '#E4F1FF',
          mint: '#AEFFDE',
          dark: '#333333',
        },
        background: {
          light: '#ffffff',
          dark: '#333333',
          lelo:'#AEFFDE',
        },
        text: {
          base: '#333333',
          inverse: '#ffffff',
          accent: '#AEFFDE',
        },
        success: {
          DEFAULT: '#AEFFDE',
        },
        warning: {
          DEFAULT: '#FFD166', // Optional: custom yellow for alerts
        },
        error: {
          DEFAULT: '#FF6B6B', // Optional: red for errors
        },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'bg-pulse-slow': {
          '0%, 100%': { 'background-color': '#AEFFDE' },
          '50%': { 'background-color': '#E4F1FF' },
        },
      },
    },
  },
  plugins: [],
};
