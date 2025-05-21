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
          DEFAULT: '#E57C23', // Terracotta orange
          50: '#FFF2E6',     // Very light orange
          100: '#FFDDB3',    // Light orange
          200: '#FFB266',    // Soft orange
          300: '#FF8519',    // Bright orange
          400: '#E57C23',    // Main terracotta
          500: '#C66218',    // Deeper terracotta
          600: '#A44800',    // Dark terracotta
          700: '#7D3600',    // Very dark terracotta
          800: '#5C2800',    // Brown terracotta
          900: '#3B1A00',    // Almost black terracotta
        },
        secondary: {
          DEFAULT: '#025464', // Deep teal blue
          50: '#E6F4F6',     // Very light teal
          100: '#B3E0E6',    // Light teal
          200: '#66C0CC',    // Soft teal
          300: '#19A0B2',    // Bright teal
          400: '#037F91',    // Main teal
          500: '#025464',    // Deep teal blue
          600: '#014756',    // Darker teal
          700: '#01353F',    // Very dark teal
          800: '#002329',    // Almost black teal
          900: '#001214',    // Black teal
        },
        accent: {
          DEFAULT: '#E57C23', // Default accent (same as primary)
          light: '#EAEEFF',   // Light blue accent
          dark: '#333F6B',    // Dark blue accent
          mint: '#92F2CB',    // Mint green for focus rings
          black: '#000000',   // Added accent-black
          yellow: '#F8CB2E',  // Vibrant yellow
          green: '#7EAA92',   // Sage green
          purple: '#8E3FBF',  // Rich purple
          red: '#E74646',     // Warm red
          orange: '#FF8000',  // Bright orange
          kente: {
            gold: '#FFC940',   // Kente gold
            green: '#006B54',  // Kente green
            red: '#C8102E',    // Kente red
            blue: '#0033A0',   // Kente blue
            black: '#000000',  // Kente black
          },
        },
        earth: {
          clay: '#A0522D',    // Clay brown
          ochre: '#CC7722',   // Ochre
          sienna: '#882D17',  // Sienna
          sand: '#E2C290',    // Sand
          coffee: '#4A2C2A',  // Coffee
        },
        background: {
          light: '#FFFBF5',       // Warm white
          dark: '#1A120B',        // Rich dark brown
          alternate: '#F8F0E5',   // Cream
          darkAlternate: '#201B10', // Darker brown
        },
        section: {
          light: '#F8F9FA',       // Light gray-blue
          dark: '#1A1A24',        // Deep blue-black
        },
        text: {
          base: '#1A120B',       // Dark brown
          inverse: '#FFFBF5',    // Warm white
          muted: '#78716C',      // Muted gray
          accent: '#E57C23',     // Terracotta for accents
        },
        success: {
          DEFAULT: '#7EAA92',    // Sage green
          darker: '#56806a',     // Darker sage
        },
        warning: {
          DEFAULT: '#F8CB2E',    // Vibrant yellow
          darker: '#DFB520',     // Darker yellow
        },
        error: {
          DEFAULT: '#E74646',    // Warm red
          darker: '#B83232',     // Darker red
        },
        info: {
          DEFAULT: '#025464',    // Deep teal blue
          darker: '#014756',     // Darker teal
        },
      },
      patterns: {
        kente: 'repeating-linear-gradient(45deg, #FFC940 0, #FFC940 10px, #006B54 10px, #006B54 20px, #C8102E 20px, #C8102E 30px, #0033A0 30px, #0033A0 40px)',
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
          '50%': { 'background-color': '#F8CB2E' },
        },
      },
    },
  },
  plugins: [],
};
