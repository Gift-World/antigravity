/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ag: {
          black: '#0A0A0F',
          surface: '#12121A',
          'surface-hover': '#1A1A25',
          border: '#2A2A35',
          'text-primary': '#E8E8ED',
          'text-secondary': '#8888A0',
          'text-muted': '#55556A',
          green: '#00E676',
          'green-dim': 'rgba(0, 230, 118, 0.12)',
          yellow: '#FFD740',
          'yellow-dim': 'rgba(255, 215, 64, 0.12)',
          orange: '#FF9100',
          'orange-dim': 'rgba(255, 145, 0, 0.12)',
          red: '#FF1744',
          'red-dim': 'rgba(255, 23, 68, 0.12)',
          blue: '#448AFF',
          'blue-dim': 'rgba(68, 138, 255, 0.12)',
          purple: '#B388FF',
          'purple-dim': 'rgba(179, 136, 255, 0.12)',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #448AFF 0%, #00E676 100%)',
        'danger-gradient': 'linear-gradient(135deg, #FF1744 0%, #FF9100 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(26, 26, 37, 0.6) 0%, rgba(18, 18, 26, 0.8) 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radar 4s linear infinite',
        'flash-critical': 'flash 0.8s ease-in-out infinite alternate',
      },
      keyframes: {
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        flash: {
          '0%': { opacity: '0.2' },
          '100%': { opacity: '0.9' },
        },
      },
    },
  },
  plugins: [],
};
