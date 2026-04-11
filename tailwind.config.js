/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "sans-serif"],
        heading: ["Archivo", "sans-serif"],
      },
      colors: {
        background: "#09090B",
        surface: "#18181B",
        "surface-hover": "#27272A",
        "surface-active": "#3F3F46",
      },
      animation: {
        float: "float 2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
}