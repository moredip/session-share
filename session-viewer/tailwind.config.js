/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./app.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        custard: {
          50: '#FDF8F0',
          100: '#FAF0DC',
          200: '#F5DFB8',
          300: '#EECB8A',
          400: '#E4B45C',
          500: '#D4A043',   // primary custard gold
          600: '#B8862F',
          700: '#956A24',
          800: '#74521D',
          900: '#5C4118',
        },
        bark: {
          50: '#F7F3F0',
          100: '#EDE5DE',
          200: '#D9C9BC',
          300: '#C2A892',
          400: '#A8846A',
          500: '#8B6914',   // brown outline
          600: '#785A3C',
          700: '#5F4730',
          800: '#483626',
          900: '#35281D',
        },
        sky: {
          50: '#F0F9FC',
          100: '#E1F3F9',
          200: '#C3E7F3',
          300: '#9ED5E8',   // swirl blue
          400: '#6FBFDA',
          500: '#4AA8C9',
          600: '#3589A8',
          700: '#2C6D87',
          800: '#275A6F',
          900: '#244B5C',
        },
        leaf: {
          50: '#F3F6F0',
          100: '#E4EBDE',
          200: '#CAD8BE',
          300: '#A8BF96',
          400: '#85A36E',
          500: '#6B8E4E',   // leaf green
          600: '#54713D',
          700: '#425833',
          800: '#37472B',
          900: '#2F3C26',
        },
        cream: {
          50: '#FDFCFA',
          100: '#FAF6F0',   // background cream
          200: '#F5F0E8',
          300: '#EDE5D8',
          400: '#E2D6C4',
          500: '#D4C4AC',
        },
      },
    },
  },
  plugins: [],
}
