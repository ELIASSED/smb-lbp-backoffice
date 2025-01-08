/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/pages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: '#33658A',
          light: '#009D9D',
        },
        beige: {
          DEFAULT: '#F2E7D6',
        },
        yellow: {
          DEFAULT: '#F6B732',
          dark: '#E5A52C',
        },
        gray: {
          light: '#F9F9F9',
          medium: '#BFBFBF',
          dark: '#333333',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Marianne', 'Roboto', 'Arial', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
        mono: ['Courier New', 'Menlo', 'monospace'],
      },
      fontSize: {
        xs: '.75rem',
        sm: '.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '4rem',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        xl: '1rem',
      },
      boxShadow: {
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),      // Plugin pour styliser les formulaires
    require('@tailwindcss/typography'), // Plugin pour styliser le texte
  ],
};
