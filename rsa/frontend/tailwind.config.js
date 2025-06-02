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
        // Primary color - Elegant Chartreuse
        // Carefully balanced for readability in both modes
        primary: {
          50: '#f9fce9',  // Lightest - for subtle backgrounds
          100: '#f1f6d2',  // Very light - for hover states in light mode
          200: '#e5eeb6',  // Light - for secondary buttons
          300: '#d5e38c',  // Medium light - for accents
          400: '#c2d500',  // Medium - for secondary elements
          500: '#b3c600',  // Base - for primary elements
          600: '#a4b700',  // Medium dark - for primary buttons
          700: '#8cae00',  // Dark - for hover states in dark mode
          800: '#738f00',  // Very dark - for text on light backgrounds
          900: '#5a7000',  // Darkest - for emphasized text
        },
        
        // Secondary color - Pale Yellow Tint
        secondary: {
          50: '#fdfef7',   // Lightest
          100: '#f9fceb',  // Very light
          200: '#f5f9de',  // Light
          300: '#f1f6d2',  // Medium light
          400: '#e9f0b8',  // Medium
          500: '#e0ea9e',  // Base
          600: '#d7e485',  // Medium dark
          700: '#c9d96c',  // Dark
          800: '#bace53',  // Very dark
          900: '#acbe3a',  // Darkest
        },
        
        // Neutral colors - Carefully crafted for optimal readability in both themes
        gray: {
          50: '#F9FAFB',   // Almost white - light mode background
          100: '#F3F4F6',  // Very light - card backgrounds in light mode
          200: '#E5E7EB',  // Light - borders in light mode
          300: '#D1D5DB',  // Medium light - disabled states
          400: '#9CA3AF',  // Medium - placeholder text
          500: '#6B7280',  // Base - subtle text in light mode
          600: '#4B5563',  // Medium dark - body text in light mode
          700: '#374151',  // Dark - headings in light mode / secondary text in dark mode
          800: '#1F2937',  // Very dark - dark mode backgrounds
          900: '#111827',  // Almost black - dark mode deeper backgrounds
          950: '#030712',  // True black - for high contrast needs
        },
        
        // Accent - Olive-Lime
        accent: {
          lime: { // New name for the accent color
            light: '#d5e38c', // Light olive-lime
            DEFAULT: '#8cae00', // Base olive-lime
            medium: '#a4b700', // Medium olive-lime
            dark: '#738f00',   // Dark olive-lime
            darker: '#5a7000',  // Darker olive-lime
          },
        },
        
        // DarkBlue color - For UI elements previously using blue
        darkBlue: {
          50: '#f0f7ff',   // Lightest
          100: '#e0f0fe',  // Very light
          200: '#bae0fd',  // Light
          300: '#7cc6fb',  // Medium light
          400: '#36a9f8',  // Medium
          500: '#0c8ee7',  // Base
          600: '#0270c4',  // Medium dark
          700: '#015a9e',  // Dark
          800: '#064b81',  // Very dark
          900: '#0a3e6a',  // Darkest
        },
        
        // Semantic colors - For feedback and status
        // Re-mapping to shades of primary chartreuse and secondary
        success: {
          light: '#f1f6d2', // Light chartreuse
          DEFAULT: '#8cae00', // Olive-lime accent
          dark: '#5a7000', // Dark olive-lime
        },
        warning: {
          light: '#f9fceb', // Very light secondary
          DEFAULT: '#c2d500', // Primary chartreuse
          dark: '#8cae00', // Olive-lime accent
        },
        error: {
          light: '#f1f6d2', // Light chartreuse
          DEFAULT: '#c2d500', // Primary chartreuse
          dark: '#8cae00', // Olive-lime accent
        },
        info: {
          light: '#f9fceb', // Very light secondary
          DEFAULT: '#c2d500', // Primary chartreuse
          dark: '#8cae00', // Olive-lime accent
        },
        
        // Contextual background colors
        background: {
          light: '#FFFFFF',       // Pure white - light mode
          lightAlt: '#F9FAFB',    // Off-white - light mode secondary (gray-50)
          dark: '#111111',        // Deep charcoal - dark mode primary
          darkAlt: '#2b2b2b',     // Lighter dark - dark mode secondary
        },
        
        // Surface colors for cards, etc.
        surface: {
          light: '#FFFFFF',      // Pure white - light mode cards
          lightAlt: '#F3F4F6',   // Off-white - light mode alt cards (gray-100)
          dark: '#1F2937',       // Dark - dark mode cards (gray-800)
          darkAlt: '#374151',    // Lighter dark - dark mode alt cards (gray-700)
        },
        
        // Text colors - Optimized for readability
        text: {
          light: {
            primary: '#1a1a1a',   // Almost black - for main text in light mode
            secondary: '#4d4d4d', // Dark gray - for secondary text in light mode
            tertiary: '#6B7280',  // Medium gray - for subtle text in light mode (gray-500)
            disabled: '#9CA3AF',  // Light gray - for disabled text in light mode (gray-400)
          },
          dark: {
            primary: '#ffffff',   // White - for main text in dark mode
            secondary: '#cccccc', // Light gray - for secondary text in dark mode
            tertiary: '#9CA3AF',  // Medium gray - for subtle text in dark mode (gray-400)
            disabled: '#6B7280',  // Dark gray - for disabled text in dark mode (gray-500)
          },
          accent: '#8cae00',      // Olive-lime - for accent text
        },
        
        // Border colors
        border: {
          light: '#e6e6e6',       // Light gray - for borders in light mode
          lightFocus: '#c2d500',  // Chartreuse - for focus states in light mode
          dark: '#2b2b2b',        // Dark gray - for borders in dark mode
          darkFocus: '#8cae00',   // Olive-lime - for focus states in dark mode
        },
      },
      // Enhanced patterns with chartreuse and olive-lime colors
      patterns: {
        kente: 'repeating-linear-gradient(45deg, #c2d500 0, #c2d500 10px, #8cae00 10px, #8cae00 20px, #a4b700 20px, #a4b700 30px, #5a7000 30px, #5a7000 40px)', /* primary, accent, primary-600, accent-darker */
        mudcloth: 'repeating-linear-gradient(90deg, rgba(27, 27, 27, 0.15) 0, rgba(27, 27, 27, 0.15) 2px, transparent 2px, transparent 10px)', // Keep as grayscale
      },
      // Enhanced keyframes with new colors
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-12px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        // Adjusting pulse colors to use the new palette
        'bg-pulse-slow': {
          '0%, 100%': { 'background-color': '#a4b700' }, // primary-600
          '50%': { 'background-color': '#c2d500' }, // primary-400
        },
        rotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      animation: {
        'pulse-slow': 'bg-pulse-slow 3s ease-in-out infinite',
        'spin-slow': 'rotate 3s linear infinite',
        'spin-once': 'rotate 0.5s ease-in-out forwards',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'fade-in': 'fadeIn 0.5s ease-in-out forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-right': 'slideRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'theme': 'background-color, border-color, color, fill, stroke',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      boxShadow: {
        // Using direct color values instead of theme()
        'chartreuse': '0 4px 6px -1px rgba(194, 213, 0, 0.2), 0 2px 4px -2px rgba(194, 213, 0, 0.1)', // primary-400
        'chartreuse-lg': '0 10px 15px -3px rgba(194, 213, 0, 0.2), 0 4px 6px -4px rgba(194, 213, 0, 0.1)', // primary-400
        'chartreuse-glow': '0 0 15px rgba(194, 213, 0, 0.5)', // primary-400
        'inner-chartreuse': 'inset 0 2px 4px 0 rgba(194, 213, 0, 0.25)', // primary-400
        'card-light': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)', // Keep as gray/black based
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)', // Keep as gray/black based
        'card-dark': '0 1px 3px rgba(0, 0, 0, 0.25), 0 1px 2px rgba(0, 0, 0, 0.2)', // Keep as gray/black based
        'card-dark-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)', // Keep as gray/black based
      },
      backgroundImage: {
        // Using direct color values instead of theme()
        'gradient-chartreuse': 'linear-gradient(to right, #c2d500, #8cae00)', // primary-400 to accent
        'gradient-chartreuse-vertical': 'linear-gradient(to bottom, #c2d500, #8cae00)', // primary-400 to accent
        'gradient-primary': 'linear-gradient(to right, #c2d500, #a4b700)', // primary-400 to primary-600
        'gradient-dark': 'linear-gradient(to bottom, #111111, #2b2b2b)', // dark bg to dark bg alt
        'gradient-light': 'linear-gradient(to bottom, #FFFFFF, #F9FAFB)', // bg-light to bg-light-alt
        'hero-light-gradient': 'linear-gradient(135deg, #c2d500, #8cae00)', // primary-400 to accent
        'hero-dark-gradient': 'linear-gradient(135deg, #111111, #2b2b2b, #5a7000)', // dark bg, dark bg alt, accent-darker
      },
    },
  },
  plugins: [],
};