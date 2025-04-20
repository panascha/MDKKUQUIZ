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
        primary: '#000B58', // Dark blue color
        secondary: '#003161', // Blue color
        tertiary: '#006A67', // Teal color
        quaternary: '#FFF4B7', // Light teal color
      },
      fontFamily: {
        body: ['Sarabun'], // Custom font family
      },
    },
  },
  plugins: [],
}

