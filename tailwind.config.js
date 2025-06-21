/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      backgroundColor: {
        'dark-blue': '#0A192F',
        'dark-black': '#030507',
      },
      colors: {
        'berliz-primary': '#2D7D5B', // Deep green (adjust if needed)
        'berliz-accent': '#38B2AC',  // Teal/blue (adjust if needed)
        'berliz-light': '#EDF6F3',   // Optional light background
        'berliz-dark': '#1F3D33',    // Optional dark accent
      },
    },
  },
  plugins: [],
}