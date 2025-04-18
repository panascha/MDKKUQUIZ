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
        primary: '#000000', // Black color
        red: '#FF6347', // Tomato color
        green: '#4CAF50', // Green color
      },
      fontFamily: {
        thsarabun: ['"TH Sarabun New"', 'sans-serif'], // Added TH Sarabun font
      },
    },
  },
  plugins: [],
}

