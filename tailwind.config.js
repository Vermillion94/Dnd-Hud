/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dnd-bg': '#1a1a1a',
        'dnd-card': '#2a2a2a',
        'dnd-accent': '#d4af37',
        'dnd-hp': '#dc2626',
        'dnd-mana': '#3b82f6',
      },
      fontFamily: {
        'medieval': ['Cinzel', 'serif'],
      }
    },
  },
  plugins: [],
}
