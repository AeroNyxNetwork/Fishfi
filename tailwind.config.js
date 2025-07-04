import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'ocean-dark': '#001a33',
        'ocean-deep': '#003366',
        'ocean-light': '#0066cc',
        'coral': '#ff6b6b',
        'seaweed': '#228844',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'swim': 'swim 4s ease-in-out infinite',
        'bubble': 'bubble 4s linear infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        swim: {
          '0%, 100%': { transform: 'translateX(0px)' },
          '50%': { transform: 'translateX(20px)' },
        },
        bubble: {
          '0%': { transform: 'translateY(0px) scale(1)', opacity: '0.8' },
          '100%': { transform: 'translateY(-100vh) scale(1.5)', opacity: '0' },
        },
        glow: {
          '0%, 100%': { filter: 'brightness(1) drop-shadow(0 0 10px currentColor)' },
          '50%': { filter: 'brightness(1.2) drop-shadow(0 0 20px currentColor)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'ocean-gradient': 'linear-gradient(to bottom, #001a33 0%, #003366 50%, #004080 100%)',
      },
    },
  },
  plugins: [],
}

export default config
