/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        aurora: {
          bg: '#05070D',
          surface: '#080B14',
          card: '#0D1220',
          'card-hover': '#141C3B',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-bright': 'rgba(255, 255, 255, 0.16)',
          violet: '#7C3AED',
          indigo: '#6366F1',
          cyan: '#06B6D4',
          emerald: '#22C55E',
          amber: '#F59E0B',
          rose: '#EF4444',
          muted: '#94A3B8',
          subtle: '#64748B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'Manrope', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace']
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
        'aurora-glow': 'radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.15), rgba(6, 182, 212, 0.05) 50%, transparent 80%)'
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'aurora-float': 'auroraFloat 12s ease-in-out infinite alternate',
        'glow-spin': 'glowSpin 10s linear infinite'
      },
      keyframes: {
        auroraFloat: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(30px, -20px) scale(1.08)' },
          '100%': { transform: 'translate(-20px, 15px) scale(0.95)' }
        },
        glowSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      }
    },
  },
  plugins: [],
}
