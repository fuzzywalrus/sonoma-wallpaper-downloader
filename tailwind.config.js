/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        macos: {
          bg: '#f5f5f7',
          surface: '#ffffff',
          text: '#1d1d1f',
          secondary: '#86868b',
          accent: '#0071e3',
          'accent-hover': '#0077ed',
          border: '#d2d2d7',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease forwards',
        'slide-in': 'slideIn 0.3s ease-out',
        'tab-enter-right': 'tabEnterRight 0.22s ease-out',
        'tab-enter-left': 'tabEnterLeft 0.22s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        // Content slides in from right when moving forward (→)
        tabEnterRight: {
          from: { opacity: '0', transform: 'translateX(28px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        // Content slides in from left when moving backward (←)
        tabEnterLeft: {
          from: { opacity: '0', transform: 'translateX(-28px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
