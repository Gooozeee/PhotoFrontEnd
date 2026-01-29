/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      colors: {
        // Custom color palette for photography portfolio
        background: "#000000",
        surface: "#1a1a1a",
        "surface-hover": "#2a2a2a",
        overlay: "rgba(57, 57, 57, 0.85)",
        "overlay-light": "rgba(30, 30, 30, 0.5)",
      },
      spacing: {
        // Common spacing values used throughout
        "nav-height": "80px",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeInImage: {
          from: {
            opacity: "0",
            transform: "scale(0.95)",
          },
          to: {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        slideUp: {
          from: {
            opacity: "0",
            transform: "translateY(10px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        slideDown: {
          from: {
            opacity: "0",
            transform: "translateY(-10px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0) translateZ(0)",
          },
          "50%": {
            transform: "translateY(-8px) translateZ(0)",
          },
        },
        zoomIn: {
          from: {
            opacity: "0",
            transform: "scale(0.85) rotate(-5deg)",
          },
          to: {
            opacity: "1",
            transform: "scale(1) rotate(0deg)",
          },
        },
        zoomOut: {
          from: {
            opacity: "1",
            transform: "scale(1) rotate(0deg)",
          },
          to: {
            opacity: "0",
            transform: "scale(0.85) rotate(5deg)",
          },
        },
        backdropFadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.2s ease-out",
        fadeInImage: "fadeInImage 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        slideUp: "slideUp 0.3s ease-out",
        slideDown: "slideDown 0.3s ease-out",
        float: "float 2s ease-in-out infinite",
        zoomIn: "zoomIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        zoomOut: "zoomOut 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        backdropFadeIn: "backdropFadeIn 0.4s ease-out",
      },
      transitionTimingFunction: {
        bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      backdropBlur: {
        sm: "4px",
      },
    },
  },
  plugins: [],
}
