/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/pages/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        black: '#000000', // Black color
        darkblue: '#000B58', // Dark blue color
        blue: '#003161', // Blue color
        green: '006A67', // Green color
        yellow: '#FFF4B7', // Yellow color
      },
      fontFamily: {
        thsarabun: ['"TH Sarabun New"', 'sans-serif'], // Added TH Sarabun font
      },
    },
  },
  plugins: [],
}

