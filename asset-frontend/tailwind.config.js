/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Material You tonal palette with purple/violet seed
        background: '#FFFBFE', // Slightly warm off-white, not pure white
        foreground: '#1C1B1F', // Near-black with slight warmth
        primary: '#6750A4', // Rich purple (seed color)
        'on-primary': '#FFFFFF', // Pure white for text on primary
        secondary: '#E8DEF8', // Light lavender tint
        'on-secondary-container': '#1D192B', // Dark text for secondary surfaces
        tertiary: '#7D5260', // Complementary mauve/dusty rose
        surface: '#F3EDF7', // Subtle tinted surface, one step darker than background
        'surface-container': '#E7E0EC', // For inputs and recessed surfaces
        'surface-container-low': '#E7E0EC', // For inputs and recessed surfaces
        outline: '#79747E', // Medium gray for borders
        'on-surface': '#49454F', // For secondary text and icons
        'surface-variant': '#F3EDF7', // Subtle tinted surface
        'surface-container-low': '#E7E0EC', // For inputs and recessed surfaces
        
        // State layer colors (opacity overlays)
        'primary-container': '#4A1486', // Primary container
        'on-primary-container': '#FFFFFF', // Text on primary container
        'secondary-container': '#EADDFF', // Secondary container
        'on-secondary-container': '#1D192B', // Text on secondary container
        'tertiary-container': '#EFB8C8', // Tertiary container
        'on-tertiary-container': '#31111D', // Text on tertiary container
        
        // Opacity variations for state layers
        'primary/90': 'rgb(103 20 162 / 0.9)', // 90% of primary
        'primary/80': 'rgb(103 20 162 / 0.8)', // 80% of primary
        'primary/10': 'rgb(103 20 162 / 0.1)', // 10% of primary
        'primary/5': 'rgb(103 20 162 / 0.05)', // 5% of primary
        'surface/10': 'rgba(243 237 247 / 0.1)', // 10% surface opacity
        'surface/20': 'rgba(243 237 247 / 0.2)', // 20% surface opacity
        'white/10': 'rgba(255 255 255 / 0.1)', // 10% white opacity
        'white/15': 'rgba(255 255 255 / 0.15)', // 15% white opacity
        'white/20': 'rgba(255 255 255 / 0.2)', // 20% white opacity
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        // Material Design 3 type scale
        'display-large': ['3.5rem', { lineHeight: '1.1' }], // 56px - Hero headlines
        'headline-large': ['3rem', { lineHeight: '1.25' }], // 48px - Section titles
        'headline-medium': ['2rem', { lineHeight: '1.25' }], // 32px - Subsection titles
        'title-large': ['1.5rem', { lineHeight: '1.25' }], // 24px - Card titles
        'body-large': ['1.25rem', { lineHeight: '1.5' }], // 20px - Lead paragraphs
        'body-medium': ['1rem', { lineHeight: '1.5' }], // 16px - Standard body text
        'label-medium': ['0.875rem', { lineHeight: '1.4' }], // 14px - Button text
        'label-small': ['0.75rem', { lineHeight: '1.4' }], // 12px - Captions, metadata
      },
      letterSpacing: {
        'tracking-tight': '-0.025em',
        'tracking-tighter': '-0.05em',
        'tracking-wide': '0.01em',
      },
      borderRadius: {
        'xs': '4px', // 8px - Minimal UI elements, chips
        'sm': '8px', // 8px - Small cards, compact elements
        'md': '16px', // 16px - Default card radius
        'lg': '24px', // 24px - Prominent cards, containers
        'xl': '28px', // 28px - Dialogs, sheets, large surfaces
        '2xl': '32px', // 32px to 48px - Hero sections, major containers
        'full': '9999px', // All buttons, chips, badges, FABs
        'pill': '9999px', // Pill-shaped buttons
      },
      borderWidth: {
        '1': '1px',
        '2': '2px',
        '4': '4px',
      },
      boxShadow: {
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.12), 0 1px 2px 0 rgb(0 0 0 / 0.06)',
        'md': '0 4px 6px 0 rgb(0 0 0 / 0.15), 0 1px 3px 0 rgb(0 0 0 / 0.08)',
        'lg': '0 10px 15px 0 rgb(0 0 0 / 0.19), 0 4px 6px 0 rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px 0 rgb(0 0 0 / 0.25), 0 4px 10px 0 rgb(0 0 0 / 0.15)',
      },
      backdropBlur: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      animationDuration: {
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
      },
      transitionTimingFunction: {
        'emphasized-decelerate': 'cubic-bezier(0.2, 0, 0, 1)',
      },
      spacing: {
        '18': '4.5rem', // 72px
        '20': '5rem', // 80px
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        '6xl': '72rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
