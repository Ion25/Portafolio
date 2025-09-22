/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef3e2',
          100: '#fce4b6',
          200: '#f9d589',
          300: '#f6c55c',
          400: '#f3b52f',
          500: '#f0a500', // Color dorado principal
          600: '#d99400',
          700: '#c28300',
          800: '#ab7200',
          900: '#946100',
        },
        cinema: {
          seat: {
            available: '#10b981', // verde
            reserved: '#3b82f6',   // azul
            occupied: '#ef4444',   // rojo
            premium: '#f59e0b',    // dorado
            selected: '#8b5cf6',   // púrpura
          },
          dark: '#1a1a1a',
          screen: '#374151',
        }
      },
      fontFamily: {
        'cinema': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
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
      }
    },
  },
  plugins: [],
}