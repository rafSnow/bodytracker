import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#ffffff',
          dark: '#111827',
        },
        card: {
          DEFAULT: '#f9fafb',
          dark: '#1f2937',
        },
        primary: {
          DEFAULT: '#4f46e5',
          dark: '#6366f1',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
    },
  },
  plugins: [],
} satisfies Config
