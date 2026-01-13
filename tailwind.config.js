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
        'wood-dark': '#2c1810',
        'wood-medium': '#4a2c1a',
        'wood-light': '#6b4423',
        'parchment': '#f4e4c1',
      },
      fontFamily: {
        'medieval': ['Cinzel', 'serif'],
      },
      backgroundImage: {
        'wood-texture': "url(\"data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='wood' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Crect width='100' height='100' fill='%234a2c1a'/%3E%3Cpath d='M0 10 Q25 8 50 10 T100 10' stroke='%233a1c0a' stroke-width='2' fill='none' opacity='0.3'/%3E%3Cpath d='M0 30 Q25 28 50 30 T100 30' stroke='%233a1c0a' stroke-width='2' fill='none' opacity='0.3'/%3E%3Cpath d='M0 60 Q25 58 50 60 T100 60' stroke='%233a1c0a' stroke-width='2' fill='none' opacity='0.3'/%3E%3Cpath d='M0 80 Q25 78 50 80 T100 80' stroke='%233a1c0a' stroke-width='2' fill='none' opacity='0.3'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23wood)'/%3E%3C/svg%3E\")",
        'parchment-texture': "url(\"data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3CfeColorMatrix values='0 0 0 0 0.96 0 0 0 0 0.89 0 0 0 0 0.76 0 0 0 0.1 0'/%3E%3C/filter%3E%3Crect width='200' height='200' fill='%23f4e4c1' filter='url(%23noise)'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'medieval': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(212, 175, 55, 0.1)',
        'inset-wood': 'inset 0 2px 4px rgba(0, 0, 0, 0.6), inset 0 -2px 4px rgba(255, 255, 255, 0.1)',
      }
    },
  },
  plugins: [],
}
