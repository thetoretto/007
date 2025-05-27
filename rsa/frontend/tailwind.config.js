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
          DEFAULT: '#E57C23',  // Base terracotta
          50: '#FFF8F0',       // Soft warm white
          100: '#FEEBD8',
          200: '#FCD4B0',
          300: '#FABD88',
          400: '#F8A15F',
          500: '#E57C23',     // Main terracotta
          600: '#C4621A',
          700: '#A34B12',
          800: '#82380D',
          900: '#612708',
        },
        secondary: {
          DEFAULT: '#025464',  // Deep teal
          50: '#E6F6F9',
          100: '#B3E6ED',
          200: '#80D6E1',
          300: '#4DC6D5',
          400: '#1AB6C9',
          500: '#025464',      // Main teal
          600: '#01424F',
          700: '#01303A',
          800: '#001E25',
          900: '#000C10',
        },
        accent: {
          DEFAULT: '#E57C23',  // Terracotta
          light: '#F5E6D8',    // Warm parchment
          dark: '#2A363B',     // Charcoal
          mint: '#A3D9C9',     // Soft sage
          black: '#2B2118',    // Deep espresso
          yellow: '#F4D35E',   // Goldenrod
          green: '#7EAA92',    // Muted sage
          purple: '#8E6C88',   // Dusty lavender
          red: '#C44536',      // Burnt sienna
          orange: '#E57C23',   // Matching terracotta
          kente: {
            gold: '#FFD700',   // Rich gold
            green: '#2E5D4A',   // Forest green
            red: '#9A2A2A',     // Oxblood
            blue: '#0047AB',    // Cobalt
            black: '#1A120B',   // Deep brown-black
          },
        },
        earth: {
          clay: '#A0522D',     // Terra cotta
          ochre: '#CC7722',    // Burnt orange
          sienna: '#882D17',   // Red earth
          sand: '#D2B48C',     // Warm sand
          coffee: '#4A2C2A',   // Dark roast
        },
        background: {
          light: '#FFFBF5',    // Warm ivory
          dark: '#1A120B',     // Rich espresso
          alternate: '#F8F0E5', // Cream
          darkAlternate: '#2B2118', // Dark chocolate
        },
        section: {
          light: '#F5F0EB',    // Warm off-white
          dark: '#1F1A15',     // Deep umber
        },
        text: {
          base: '#2B2118',     // Dark espresso
          inverse: '#FFFBF5',  // Warm white
          muted: '#7A6E64',    // Taupe
          accent: '#E57C23',   // Terracotta
        },
        success: {
          DEFAULT: '#7EAA92',  // Sage green
          darker: '#5B7A6A',
        },
        warning: {
          DEFAULT: '#F4D35E',  // Goldenrod
          darker: '#D4B350',
        },
        error: {
          DEFAULT: '#C44536',  // Terra cotta red
          darker: '#A33528',
        },
        info: {
          DEFAULT: '#4A708B',  // Slate blue
          darker: '#38556B',
        },
      },
      patterns: {
        kente: 'repeating-linear-gradient(45deg, #FFD700 0, #FFD700 10px, #2E5D4A 10px, #2E5D4A 20px, #9A2A2A 20px, #9A2A2A 30px, #0047AB 30px, #0047AB 40px)',
        mudcloth: 'repeating-linear-gradient(90deg, #1A120B 0, #1A120B 2px, transparent 2px, transparent 10px)',
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
          '0%, 100%': { 'background-color': '#E57C23' },
          '50%': { 'background-color': '#F4D35E' },
        },
      },
      animation: {
        'pulse-slow': 'bg-pulse-slow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};