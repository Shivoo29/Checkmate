/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e3a8a',
          light: '#3b82f6',
          dark: '#1e40af',
        },
        accent: {
          DEFAULT: '#f59e0b',
        },
        success: {
          DEFAULT: '#10b981',
        },
        danger: {
          DEFAULT: '#ef4444',
        },
      },
    },
  },
  plugins: [],
}
