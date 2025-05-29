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
        // Primary color - African Sunset Orange
        // Carefully balanced for readability in both modes
        primary: {
          50: '#FFF7ED',  // Lightest - for subtle backgrounds
          100: '#FFEDD5',  // Very light - for hover states in light mode
          200: '#FED7AA',  // Light - for secondary buttons
          300: '#FDBA74',  // Medium light - for accents
          400: '#FB923C',  // Medium - for secondary elements
          500: '#F97316',  // Base - for primary elements
          600: '#EA580C',  // Medium dark - for primary buttons
          700: '#C2410C',  // Dark - for hover states in dark mode
          800: '#9A3412',  // Very dark - for text on light backgrounds
          900: '#7C2D12',  // Darkest - for emphasized text
        },
        
        // New Dark Blue color - Sleek and modern
        darkBlue: {
          50: '#E3F2FD',   // Lightest
          100: '#BBDEFB',  // Very light
          200: '#90CAF9',  // Light
          300: '#64B5F6',  // Medium light
          400: '#42A5F5',  // Medium
          500: '#2196F3',  // Base
          600: '#1E88E5',  // Medium dark
          700: '#1976D2',  // Dark
          800: '#1565C0',  // Very dark
          900: '#0D47A1',  // Darkest
        },
        
        // Neutral colors - Earth-inspired grays
        // Carefully crafted for optimal readability in both themes
        // Re-mapping to grayscale fitting white/darkBlue theme
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
        
        // Accent - Kente Gold (African traditional gold) - Re-mapping to Primary Orange
        accent: {
          gold: { // Keeping the name for class compatibility but using orange shades
            light: '#FDBA74', // Map to primary-300
            DEFAULT: '#F97316', // Map to primary-500
            medium: '#FB923C', // Map to primary-400
            dark: '#EA580C',   // Map to primary-600
            darker: '#C2410C',  // Map to primary-700
          },
          // Earth tones removed as requested
        },
        
        // Semantic colors - For feedback and status
        // Re-mapping to shades of primary orange, dark blue, and white/gray
        success: {
          light: '#E3F2FD', // Map to darkBlue-50
          DEFAULT: '#1E88E5', // Map to darkBlue-600
          dark: '#1565C0', // Map to darkBlue-800
        },
        warning: {
          light: '#FFEDD5', // Map to primary-100
          DEFAULT: '#FB923C', // Map to primary-400
          dark: '#EA580C', // Map to primary-600
        },
        error: {
          light: '#FFEDD5', // Map to primary-100
          DEFAULT: '#F97316', // Map to primary-500
          dark: '#C2410C', // Map to primary-700
        },
        info: {
          light: '#E3F2FD', // Map to darkBlue-50
          DEFAULT: '#42A5F5', // Map to darkBlue-400
          dark: '#1976D2', // Map to darkBlue-700
        },
        
        // Contextual background colors
        background: {
          light: '#FFFFFF',       // Pure white - light mode
          lightAlt: '#F9FAFB',    // Off-white - light mode secondary (gray-50)
          dark: '#111827',        // Rich dark - dark mode primary (gray-900)
          darkAlt: '#1F2937',     // Lighter dark - dark mode secondary (gray-800)
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
            primary: '#111827',   // Near-black - for main text in light mode (gray-900)
            secondary: '#4B5563', // Dark gray - for secondary text in light mode (gray-600)
            tertiary: '#6B7280',  // Medium gray - for subtle text in light mode (gray-500)
            disabled: '#9CA3AF',  // Light gray - for disabled text in light mode (gray-400)
          },
          dark: {
            primary: '#F9FAFB',   // Near-white - for main text in dark mode (gray-50)
            secondary: '#E5E7EB', // Light gray - for secondary text in dark mode (gray-200)
            tertiary: '#9CA3AF',  // Medium gray - for subtle text in dark mode (gray-400)
            disabled: '#6B7280',  // Dark gray - for disabled text in dark mode (gray-500)
          },
          accent: '#F97316',      // Orange - for accent text (primary-500)
        },
        
        // Border colors
        border: {
          light: '#E5E7EB',       // Light gray - for borders in light mode (gray-200)
          lightFocus: '#FBBF24',  // Orange - for focus states in light mode (primary-500)
          dark: '#374151',        // Dark gray - for borders in dark mode (gray-700)
          darkFocus: '#FB923C',   // Orange - for focus states in dark mode (primary-400)
        },
      },
      // Enhanced patterns with more balanced opacities - Keeping existing patterns but they might appear monochromatic
      patterns: {
        kente: 'repeating-linear-gradient(45deg, #F97316 0, #F97316 10px, #1976D2 10px, #1976D2 20px, #C2410C 20px, #C2410C 30px, #0D47A1 30px, #0D47A1 40px)', /* primary-500, darkBlue-700, primary-700, darkBlue-900 */
        mudcloth: 'repeating-linear-gradient(90deg, rgba(27, 27, 27, 0.15) 0, rgba(27, 27, 27, 0.15) 2px, transparent 2px, transparent 10px)', // Keep as grayscale
      },
      // Enhanced keyframes - Colors within keyframes need adjustment
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
          '0%, 100%': { 'background-color': '#EA580C' }, // primary-600
          '50%': { 'background-color': '#FB923C' }, // primary-400
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
        'gold': '0 4px 6px -1px rgba(249, 115, 22, 0.2), 0 2px 4px -2px rgba(249, 115, 22, 0.1)', // primary-500
        'gold-lg': '0 10px 15px -3px rgba(249, 115, 22, 0.2), 0 4px 6px -4px rgba(249, 115, 22, 0.1)', // primary-500
        'gold-glow': '0 0 15px rgba(249, 115, 22, 0.5)', // primary-500
        'inner-gold': 'inset 0 2px 4px 0 rgba(249, 115, 22, 0.25)', // primary-500
        'card-light': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)', // Keep as gray/black based
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)', // Keep as gray/black based
        'card-dark': '0 1px 3px rgba(0, 0, 0, 0.25), 0 1px 2px rgba(0, 0, 0, 0.2)', // Keep as gray/black based
        'card-dark-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)', // Keep as gray/black based
      },
      backgroundImage: {
        // Using direct color values instead of theme()
        'gradient-gold': 'linear-gradient(to right, #FB923C, #F97316)', // primary-400 to primary-500
        'gradient-gold-vertical': 'linear-gradient(to bottom, #FB923C, #F97316)', // primary-400 to primary-500
        'gradient-primary': 'linear-gradient(to right, #F97316, #FB923C)', // primary-500 to primary-400
        'gradient-dark': 'linear-gradient(to bottom, #111827, #1F2937)', // gray-900 to gray-800
        'gradient-light': 'linear-gradient(to bottom, #FFFFFF, #F9FAFB)', // bg-light to bg-light-alt
        'hero-light-gradient': 'linear-gradient(135deg, #F97316, #C2410C)', // primary-500 to primary-700
        'hero-dark-gradient': 'linear-gradient(135deg, #111827, #1F2937)', // gray-900 to gray-800
      },
    },
  },
  plugins: [],
};