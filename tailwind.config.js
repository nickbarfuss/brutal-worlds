/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  safelist: [
    'bg-indigo-800',
    'bg-pink-800',
    'border-indigo-500',
    'border-pink-500',
    'bg-indigo-600',
    'bg-pink-600',
    'text-indigo-200',
    'text-pink-200',
    'text-indigo-400',
    'text-pink-400',
  ],
  plugins: [],
}
