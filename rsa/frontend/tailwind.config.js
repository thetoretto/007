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
        // PALETTE COLORS ONLY - Exact colors from your palette

        // Primary color - Yellow (#FEE46B)
        primary: {
          DEFAULT: '#fee46b',
          light: 'rgba(254, 228, 107, 0.1)',
          medium: 'rgba(254, 228, 107, 0.5)',
          dark: 'rgba(254, 228, 107, 0.8)',
        },

        // Secondary color - Blue Gray (#94A9BC)
        secondary: {
          DEFAULT: '#94a9bc',
          light: 'rgba(148, 169, 188, 0.1)',
          medium: 'rgba(148, 169, 188, 0.5)',
          dark: 'rgba(148, 169, 188, 0.8)',
        },

        // Accent color - Red (#DF0827)
        accent: {
          DEFAULT: '#df0827',
          light: 'rgba(223, 8, 39, 0.1)',
          medium: 'rgba(223, 8, 39, 0.5)',
          dark: 'rgba(223, 8, 39, 0.8)',
        },

        // Purple accent (#E6DBEB)
        purple: {
          DEFAULT: '#e6dbeb',
          light: 'rgba(230, 219, 235, 0.1)',
          medium: 'rgba(230, 219, 235, 0.5)',
          dark: 'rgba(230, 219, 235, 0.8)',
        },

        // Base colors - Only black, white, and palette colors
        black: '#000000',
        white: '#ffffff',
        dark: '#171c22',    // Dark charcoal from palette
        light: '#f8f3ef',   // Light cream from palette

        // Simplified gray scale using only palette colors
        gray: {
          50: '#f8f3ef',    // Light cream
          100: '#ffffff',   // White
          200: 'rgba(148, 169, 188, 0.1)', // Secondary light
          300: 'rgba(148, 169, 188, 0.3)', // Secondary medium-light
          400: 'rgba(148, 169, 188, 0.5)', // Secondary medium
          500: '#94a9bc',   // Secondary
          600: 'rgba(148, 169, 188, 0.8)', // Secondary dark
          700: 'rgba(23, 28, 34, 0.7)',    // Dark medium
          800: 'rgba(23, 28, 34, 0.9)',    // Dark strong
          900: '#171c22',   // Dark charcoal
          950: '#000000',   // Black
        },

        // Semantic colors - Using only palette colors
        success: {
          light: 'rgba(148, 169, 188, 0.1)', // Secondary light
          DEFAULT: '#94a9bc', // Secondary (blue-gray)
          dark: 'rgba(148, 169, 188, 0.8)', // Secondary dark
        },
        warning: {
          light: 'rgba(254, 228, 107, 0.1)', // Primary light
          DEFAULT: '#fee46b', // Primary (yellow)
          dark: 'rgba(254, 228, 107, 0.8)', // Primary dark
        },
        error: {
          light: 'rgba(223, 8, 39, 0.1)', // Accent light
          DEFAULT: '#df0827', // Accent (red)
          dark: 'rgba(223, 8, 39, 0.8)', // Accent dark
        },
        info: {
          light: 'rgba(230, 219, 235, 0.1)', // Purple light
          DEFAULT: '#e6dbeb', // Purple
          dark: 'rgba(230, 219, 235, 0.8)', // Purple dark
        },

        // Background colors - Only palette colors
        background: {
          light: '#f8f3ef',    // Light cream from palette
          lightAlt: '#ffffff', // White
          dark: '#171c22',     // Dark charcoal from palette
          darkAlt: '#000000',  // Black
        },

        // Surface colors - Only palette colors
        surface: {
          light: '#ffffff',    // White
          lightAlt: '#f8f3ef', // Light cream
          dark: '#171c22',     // Dark charcoal
          darkAlt: '#000000',  // Black
        },

        // Text colors - High contrast for accessibility
        text: {
          light: {
            primary: '#000000',   // Black - maximum contrast
            secondary: '#171c22', // Dark charcoal - high contrast
            tertiary: '#94a9bc',  // Secondary - medium contrast
            disabled: 'rgba(148, 169, 188, 0.5)', // Secondary medium
          },
          dark: {
            primary: '#ffffff',   // White - maximum contrast
            secondary: '#f8f3ef', // Light cream - high contrast
            tertiary: '#94a9bc',  // Secondary - medium contrast
            disabled: 'rgba(148, 169, 188, 0.5)', // Secondary medium
          },
          accent: '#fee46b',      // Primary yellow for accent text
        },

        // Border colors - Only palette colors
        border: {
          light: 'rgba(148, 169, 188, 0.1)', // Secondary light
          lightFocus: '#fee46b',  // Primary yellow
          dark: 'rgba(148, 169, 188, 0.5)', // Secondary medium
          darkFocus: '#fee46b',   // Primary yellow
        },
      },

      // Enhanced keyframes with new colors and modern animations
      keyframes: {
        // Basic animations
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-12px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(12px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },

        // Scale animations
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.9)', opacity: '0' },
        },

        // Pulse animations with brand colors
        'pulse-primary': {
          '0%, 100%': { 'background-color': '#fbbf24', opacity: '1' },
          '50%': { 'background-color': '#fee46b', opacity: '0.8' },
        },
        'pulse-accent': {
          '0%, 100%': { 'background-color': '#dc2626', opacity: '1' },
          '50%': { 'background-color': '#df0827', opacity: '0.8' },
        },
        'pulse-glow': {
          '0%, 100%': { 'box-shadow': '0 0 5px rgba(254, 228, 107, 0.5)' },
          '50%': { 'box-shadow': '0 0 20px rgba(254, 228, 107, 0.8)' },
        },

        // Rotation and movement
        rotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'rotate-reverse': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        },

        // Floating animations
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-x': {
          '0%, 100%': { transform: 'translateX(0px)' },
          '50%': { transform: 'translateX(10px)' },
        },

        // Bounce animations
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        bounceOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '25%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(0.3)', opacity: '0' },
        },


      },
      animation: {
        // Basic animations
        'fade-in': 'fadeIn 0.5s ease-in-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-right': 'slideRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-left': 'slideLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',

        // Scale animations
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'scale-out': 'scaleOut 0.3s ease-in forwards',

        // Pulse animations
        'pulse-primary': 'pulse-primary 2s ease-in-out infinite',
        'pulse-accent': 'pulse-accent 2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'pulse-slow': 'pulse-primary 3s ease-in-out infinite',

        // Rotation animations
        'spin-slow': 'rotate 3s linear infinite',
        'spin-reverse': 'rotate-reverse 3s linear infinite',
        'spin-once': 'rotate 0.5s ease-in-out forwards',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'shake': 'shake 0.5s ease-in-out',

        // Float animations
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 8s ease-in-out infinite',
        'float-x': 'float-x 4s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out infinite 2s',

        // Bounce animations
        'bounce-in': 'bounceIn 0.6s ease-out forwards',
        'bounce-out': 'bounceOut 0.6s ease-in forwards',



        // Staggered animations
        'fade-in-1': 'fadeIn 0.5s ease-in-out 0.1s forwards',
        'fade-in-2': 'fadeIn 0.5s ease-in-out 0.2s forwards',
        'fade-in-3': 'fadeIn 0.5s ease-in-out 0.3s forwards',
        'fade-in-4': 'fadeIn 0.5s ease-in-out 0.4s forwards',
        'slide-up-1': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards',
        'slide-up-2': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards',
        'slide-up-3': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards',
      },
      transitionProperty: {
        'height': 'height',
        'width': 'width',
        'spacing': 'margin, padding',
        'size': 'width, height',
        'theme': 'background-color, border-color, color, fill, stroke, box-shadow, transform',
        'colors': 'background-color, border-color, color, fill, stroke',
        'transform': 'transform',
        'opacity': 'opacity',
        'shadow': 'box-shadow',
        'filter': 'filter',
        'backdrop': 'backdrop-filter',
        'all': 'all',
      },
      transitionDuration: {
        '50': '50ms',
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
        '300': '300ms',
        '350': '350ms',
        '400': '400ms',
        '450': '450ms',
        '500': '500ms',
        '600': '600ms',
        '700': '700ms',
        '800': '800ms',
        '900': '900ms',
        '1000': '1000ms',
        '1200': '1200ms',
        '1500': '1500ms',
        '2000': '2000ms',
      },
      transitionTimingFunction: {
        'linear': 'linear',
        'in': 'cubic-bezier(0.4, 0, 1, 1)',
        'out': 'cubic-bezier(0, 0, 0.2, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'elastic': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ease-in-back': 'cubic-bezier(0.36, 0, 0.66, -0.56)',
        'ease-out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ease-in-out-back': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      boxShadow: {
        // Palette color shadows - Using exact palette colors
        'primary': '0 4px 6px -1px rgba(254, 228, 107, 0.2), 0 2px 4px -2px rgba(254, 228, 107, 0.1)',
        'primary-md': '0 6px 10px -2px rgba(254, 228, 107, 0.15), 0 2px 4px -2px rgba(254, 228, 107, 0.1)',
        'primary-lg': '0 10px 15px -3px rgba(254, 228, 107, 0.2), 0 4px 6px -4px rgba(254, 228, 107, 0.1)',
        'primary-xl': '0 20px 25px -5px rgba(254, 228, 107, 0.15), 0 8px 10px -6px rgba(254, 228, 107, 0.1)',
        'primary-glow': '0 0 15px rgba(254, 228, 107, 0.5)',

        'accent': '0 4px 6px -1px rgba(223, 8, 39, 0.2), 0 2px 4px -2px rgba(223, 8, 39, 0.1)',
        'accent-md': '0 6px 10px -2px rgba(223, 8, 39, 0.15), 0 2px 4px -2px rgba(223, 8, 39, 0.1)',
        'accent-lg': '0 10px 15px -3px rgba(223, 8, 39, 0.2), 0 4px 6px -4px rgba(223, 8, 39, 0.1)',
        'accent-xl': '0 20px 25px -5px rgba(223, 8, 39, 0.15), 0 8px 10px -6px rgba(223, 8, 39, 0.1)',
        'accent-glow': '0 0 15px rgba(223, 8, 39, 0.5)',

        'secondary': '0 4px 6px -1px rgba(148, 169, 188, 0.2), 0 2px 4px -2px rgba(148, 169, 188, 0.1)',
        'secondary-md': '0 6px 10px -2px rgba(148, 169, 188, 0.15), 0 2px 4px -2px rgba(148, 169, 188, 0.1)',
        'secondary-lg': '0 10px 15px -3px rgba(148, 169, 188, 0.2), 0 4px 6px -4px rgba(148, 169, 188, 0.1)',
        'secondary-xl': '0 20px 25px -5px rgba(148, 169, 188, 0.15), 0 8px 10px -6px rgba(148, 169, 188, 0.1)',
        'secondary-glow': '0 0 15px rgba(148, 169, 188, 0.5)',

        'purple': '0 4px 6px -1px rgba(230, 219, 235, 0.3), 0 2px 4px -2px rgba(230, 219, 235, 0.2)',
        'purple-md': '0 6px 10px -2px rgba(230, 219, 235, 0.25), 0 2px 4px -2px rgba(230, 219, 235, 0.2)',
        'purple-lg': '0 10px 15px -3px rgba(230, 219, 235, 0.3), 0 4px 6px -4px rgba(230, 219, 235, 0.2)',
        'purple-xl': '0 20px 25px -5px rgba(230, 219, 235, 0.25), 0 8px 10px -6px rgba(230, 219, 235, 0.2)',
        'purple-glow': '0 0 15px rgba(230, 219, 235, 0.5)',

        // Standard shadows using black/white only
        'card-light': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
        'card-hover-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        'card-dark': '0 1px 3px rgba(0, 0, 0, 0.25), 0 1px 2px rgba(0, 0, 0, 0.2)',
        'card-dark-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)',
        'card-dark-hover-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',

        // Glass effect shadows
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.05)',
        'glass-lg': '0 12px 40px rgba(0, 0, 0, 0.12), 0 6px 20px rgba(0, 0, 0, 0.08)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)',
        'glass-dark-lg': '0 12px 40px rgba(0, 0, 0, 0.35), 0 6px 20px rgba(0, 0, 0, 0.25)',

        // Floating elements
        'float': '0 12px 24px -8px rgba(0, 0, 0, 0.15), 0 4px 8px -4px rgba(0, 0, 0, 0.1)',
        'float-lg': '0 24px 48px -12px rgba(0, 0, 0, 0.18), 0 8px 16px -8px rgba(0, 0, 0, 0.12)',
        'float-xl': '0 32px 64px -16px rgba(0, 0, 0, 0.2), 0 12px 24px -12px rgba(0, 0, 0, 0.15)',
      },
      backgroundImage: {
        // Pattern backgrounds using only palette colors
        'pattern-dots': 'radial-gradient(circle, #94a9bc 1px, transparent 1px)',
        'pattern-grid': 'linear-gradient(rgba(148, 169, 188, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 169, 188, 0.1) 1px, transparent 1px)',
        'pattern-diagonal': 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(148, 169, 188, 0.1) 10px, rgba(148, 169, 188, 0.1) 11px)',
      },
      // Enhanced border radius
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        'full': '9999px',
      },

      // Enhanced backdrop blur
      backdropBlur: {
        'none': '0',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      },

      // Enhanced z-index scale
      zIndex: {
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
        'auto': 'auto',
      },

      // Enhanced opacity scale
      opacity: {
        '0': '0',
        '5': '0.05',
        '10': '0.1',
        '15': '0.15',
        '20': '0.2',
        '25': '0.25',
        '30': '0.3',
        '35': '0.35',
        '40': '0.4',
        '45': '0.45',
        '50': '0.5',
        '55': '0.55',
        '60': '0.6',
        '65': '0.65',
        '70': '0.7',
        '75': '0.75',
        '80': '0.8',
        '85': '0.85',
        '90': '0.9',
        '95': '0.95',
        '100': '1',
      },
    },
  },
  plugins: [],
};