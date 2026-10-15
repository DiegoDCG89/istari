tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        arcane: {
          950: '#03080b',
          900: '#061117',
          850: '#091820',
          800: '#0c222d',
          700: '#113545',
          600: '#184f66',
        },
        lumina: {
          gold: '#e6c364',
          brightGold: '#ffd875',
          darkGold: '#b8933b',
          cyan: '#38bdf8',
          teal: '#2dd4bf',
          emerald: '#10b981',
          glow: 'rgba(56, 189, 248, 0.4)',
        }
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 7s ease-in-out 2s infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'spin-slow': 'spin 25s linear infinite',
        'shimmer': 'shimmer 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', filter: 'drop-shadow(0 0 15px rgba(56,189,248,0.4))' },
          '50%': { opacity: '0.8', filter: 'drop-shadow(0 0 30px rgba(230,195,100,0.6))' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    }
  }
}
