/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f7fafc', // very light gray
          100: '#edf2f7', // light gray
          200: '#e2e8f0', // light gray
          300: '#cbd5e0', // gray
          400: '#a0aec0', // gray
          500: '#718096', // medium gray
          600: '#4a5568', // dark gray
          700: '#2d3748', // very dark gray
          800: '#1a202c', // almost black
          900: '#171923', // near black
        },
        accent: {
          50: '#f7fafc',
          100: '#edf2f7',
          200: '#e2e8f0',
          300: '#cbd5e0',
          400: '#a0aec0',
          500: '#718096',
          600: '#4a5568',
          700: '#2d3748',
          800: '#1a202c',
          900: '#171923',
        },
        success: {
          50: '#f7fafc', // very light gray
          100: '#edf2f7', // light gray
          200: '#e2e8f0', // light gray
          300: '#cbd5e0', // gray
          400: '#a0aec0', // gray
          500: '#718096', // medium gray
          600: '#4a5568', // dark gray
          700: '#2d3748', // very dark gray
          800: '#1a202c', // almost black
          900: '#171923', // near black
        },
        warning: {
          50: '#f7fafc', // very light gray
          100: '#edf2f7', // light gray
          200: '#e2e8f0', // light gray
          300: '#cbd5e0', // gray
          400: '#a0aec0', // gray
          500: '#718096', // medium gray
          600: '#4a5568', // dark gray
          700: '#2d3748', // very dark gray
          800: '#1a202c', // almost black
          900: '#171923', // near black
        },
        error: {
          50: '#f7fafc', // very light gray
          100: '#edf2f7', // light gray
          200: '#e2e8f0', // light gray
          300: '#cbd5e0', // gray
          400: '#a0aec0', // gray
          500: '#718096', // medium gray
          600: '#4a5568', // dark gray
          700: '#2d3748', // very dark gray
          800: '#1a202c', // almost black
          900: '#171923', // near black
        },
        // Add black and white explicitly if needed, though Tailwind includes them by default
        black: '#000000',
        white: '#ffffff',
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
          '0%, 100%': { 'background-color': '#1d4ed8' },
          '50%': { 'background-color': '#2563eb' },
        },
      },
    },
  },
  plugins: [],
};