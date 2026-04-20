/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        neon: {
          DEFAULT: '#c8ff00',
          dim: 'rgba(200, 255, 0, 0.2)',
          glow: 'rgba(200, 255, 0, 0.15)',
          muted: 'rgba(200, 255, 0, 0.6)',
        },
        surface: {
          DEFAULT: '#111111',
          2: '#1a1a1a',
          3: '#222222',
          hover: '#2a2a2a',
        },
        dark: {
          DEFAULT: '#0a0a0a',
          bg: '#050505',
        },
        border: {
          DEFAULT: '#2a2a2a',
          light: '#333333',
        },
        text: {
          primary: '#ffffff',
          secondary: '#888888',
          tertiary: '#555555',
        },
      },
      boxShadow: {
        'neon': '0 0 20px rgba(200, 255, 0, 0.15)',
        'neon-sm': '0 0 10px rgba(200, 255, 0, 0.1)',
        'neon-lg': '0 0 40px rgba(200, 255, 0, 0.2)',
        'neon-intense': '0 0 30px rgba(200, 255, 0, 0.3), 0 0 60px rgba(200, 255, 0, 0.1)',
        'surface': '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'slide-right': 'slideRight 0.3s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'typing-dot': 'typingDot 1.4s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(200, 255, 0, 0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(200, 255, 0, 0.25)' },
        },
        typingDot: {
          '0%, 60%, 100%': { opacity: '0.3', transform: 'translateY(0)' },
          '30%': { opacity: '1', transform: 'translateY(-6px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};