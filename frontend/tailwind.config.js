/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        bg: "#0A0A0A",
        surface: "#171717",
        elevated: "#262626",
        primary: "#F59E0B",
        primaryHover: "#D97706",
        muted: "#A3A3A3",
      },
      fontFamily: {
        display: ['"Playfair Display"', "serif"],
        body: ['Manrope', "sans-serif"],
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.6s ease forwards",
        slideUp: "slideUp 0.35s ease forwards",
      },
    },
  },
  plugins: [],
};
