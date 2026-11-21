/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'sans-serif'],
      },
      backgroundColor: {
        'dark-blue': '#0A192F',
        'dark-black': '#030507',
      },
      colors: {
        'berliz-primary': '#2D7D5B', // Deep green (adjust if needed)
        'berliz-accent': '#38B2AC',  // Teal/blue (adjust if needed)
        'berliz-light': '#EDF6F3',   // Optional light background
        'berliz-dark': '#1F3D33',    // Optional dark accent
        // GN-76 (Nov 21, 2026): the black/white/red brand redesign. Deliberately separate from the
        // existing `dark:` variant system (Settings > Appearance) -- the ticket is explicit that
        // every redesigned screen is dark unconditionally, not a user-toggleable theme, so these
        // are used directly (never behind `dark:`) wherever a screen has been rebuilt to this design.
        'brand-bg': '#0A0A0A',
        'brand-card': '#1A1A1A',
        'brand-border': '#2E2E2E',
        'brand-text': '#FFFFFF',
        'brand-muted': '#9A9A9A',
        'brand-red': '#E62E2E',
      },
    },
  },
  plugins: [
    require('tailwindcss-textshadow'),
  ],
}