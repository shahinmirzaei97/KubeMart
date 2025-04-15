/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html"
    ],
    safelist: [
      "translate-x-0",
      "translate-x-full"
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }
  