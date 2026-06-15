/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#FAFAF7',
          secondary: '#F3F2EE',
          tertiary: '#ECEAE4',
        },
        border: {
          DEFAULT: '#E0DDD6',
          strong: '#D0CCC4',
        },
        text: {
          primary: '#1A1916',
          secondary: '#7A7770',
          muted: '#B0ADA6',
        },
        green: {
          DEFAULT: '#2D6A4F',
          light: '#E6F5F0',
          mid: '#52B788',
        },
        orange: {
          DEFAULT: '#E07B39',
          light: '#FDF0E6',
          mid: '#F4A261',
        },
        red: {
          DEFAULT: '#B83232',
          light: '#FBEAEA',
        },
        amber: {
          DEFAULT: '#B87214',
          light: '#FBF0DC',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
}