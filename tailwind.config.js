// tailwind.config.js
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ["app/**/*.{js,ts,jsx,tsx}", "components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        amber: { DEFAULT: '#d97706', light: '#fbbf24' },
        mocha: '#a0826d',
        bg: '#111',
      },
      fontFamily: {
        playfair: ["Playfair Display", "serif"],
        inter: ["Inter", "sans-serif"],
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.glass': {
          'backdrop-filter': 'blur(20px)',
          'background-color': 'rgba(255,255,255,0.05)',
        },
      });
    }),
  ],
};
