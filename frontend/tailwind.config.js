/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Nocturne Design System
        bg: '#161826',
        surface: '#232532',
        text: '#e9e9ed',
        accent: '#9184d9',
        'accent-2': '#a7a1db',
        neutral: {
          100: '#f3f5fe',
          200: '#e4e7f5',
          300: '#cfd3e5',
          400: '#b2b6ca',
          500: '#9397ab',
          600: '#75798c',
          700: '#595d6c',
          800: '#3f424d',
          900: '#292b31',
        },
        accent: {
          100: '#f5f4ff',
          200: '#e7e5fe',
          300: '#d2cefd',
          400: '#b5abfc',
          500: '#968ae0',
          600: '#796cbf',
          700: '#5d5294',
          800: '#423a6a',
          900: '#2b2741',
        },
      },
      fontFamily: {
        heading: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        1: '2.8px',
        2: '5.6px',
        3: '8.4px',
        4: '11.2px',
        6: '16.8px',
        8: '22.4px',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '14px',
      },
      boxShadow: {
        sm: '0 0 0 1px #3f424d',
        md: '0 0 0 1px #595d6c, 0 6px 18px rgba(0,0,0,0.55)',
        lg: '0 0 0 1px #9397ab, 0 16px 40px rgba(0,0,0,0.65)',
      },
    },
  },
  plugins: [],
}
