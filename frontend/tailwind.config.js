/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pure black background
        'dark-bg': '#000000',
        'dark-card': '#0a0a0a',
        'dark-border': '#1a1a1a',
        'dark-hover': '#111111',
        'dark-surface': '#0d0d0d',
        // Darker emerald green accent (less bright)
        'accent': '#059669',
        'accent-light': '#10B981',
        'accent-dark': '#047857',
        'accent-muted': '#065F46',
        'accent-glow': 'rgba(5, 150, 105, 0.3)',
        // Supporting colors
        'gray-dark': '#1a1a1a',
        'gray-medium': '#2a2a2a',
        'gray-light': '#3a3a3a',
        // Badge colors
        'badge-verified': '#3B82F6',
        'badge-staff': '#3B82F6',
        'badge-admin': '#EF4444',
        // Legacy support
        'glass': 'rgba(5, 150, 105, 0.05)',
        'glass-border': 'rgba(5, 150, 105, 0.1)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-accent': 'glow-accent 2s ease-in-out infinite alternate',
        'pulse-accent': 'pulse-accent 2s ease-in-out infinite',
        'grid-move': 'grid-move 20s linear infinite',
        'typewriter': 'typewriter 2s steps(40) 1s forwards',
        'blink': 'blink 1s step-end infinite',
        'snowfall': 'snowfall 10s linear infinite',
        'rain': 'rain 0.5s linear infinite',
        'stars': 'stars 3s ease-in-out infinite',
        'sidebar-open': 'sidebar-open 0.3s ease-out forwards',
        'sidebar-close': 'sidebar-close 0.3s ease-out forwards',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(5, 150, 105, 0.2)' },
          '100%': { boxShadow: '0 0 15px rgba(5, 150, 105, 0.4)' },
        },
        'glow-accent': {
          '0%': { textShadow: '0 0 5px rgba(5, 150, 105, 0.4)' },
          '100%': { textShadow: '0 0 10px rgba(5, 150, 105, 0.6)' },
        },
        'pulse-accent': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
        'grid-move': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '50px 50px' },
        },
        typewriter: {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        blink: {
          '50%': { borderColor: 'transparent' },
        },
        snowfall: {
          '0%': { transform: 'translateY(-10vh) rotate(0deg)', opacity: 1 },
          '100%': { transform: 'translateY(100vh) rotate(360deg)', opacity: 0.3 },
        },
        rain: {
          '0%': { transform: 'translateY(-10vh)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        stars: {
          '0%, 100%': { opacity: 0.3, transform: 'scale(0.8)' },
          '50%': { opacity: 1, transform: 'scale(1.2)' },
        },
        'sidebar-open': {
          '0%': { transform: 'translateX(-100%)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        'sidebar-close': {
          '0%': { transform: 'translateX(0)', opacity: 1 },
          '100%': { transform: 'translateX(-100%)', opacity: 0 },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' }
        },
        slideUp: {
          'from': { transform: 'translateY(20px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          'from': { transform: 'translateY(-20px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' }
        },
        scaleIn: {
          'from': { transform: 'scale(0.95)', opacity: '0' },
          'to': { transform: 'scale(1)', opacity: '1' }
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(5, 150, 105, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(5, 150, 105, 0.06) 1px, transparent 1px)',
        'grid-pattern-dense': 'linear-gradient(rgba(5, 150, 105, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(5, 150, 105, 0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '50px 50px',
        'grid-dense': '25px 25px',
      },
      boxShadow: {
        'glow-accent': '0 0 15px rgba(5, 150, 105, 0.25)',
        'glow-accent-lg': '0 0 30px rgba(5, 150, 105, 0.35)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.5)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 15px rgba(5, 150, 105, 0.1)',
      },
    },
  },
  plugins: [],
}
