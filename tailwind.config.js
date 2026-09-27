/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/views/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#FFFAF3",
        cream: "#FFF2DB",
        peach: "#FFE5B6",
        coral: {
          DEFAULT: "#FF6244",
          hover: "#E54D31",
          soft: "#FFF0EB",
          border: "#FFD2C9",
        },
        ink: {
          DEFAULT: "#171512",
          muted: "#665E53",
          subtle: "#998E80",
          faint: "#D4CBBD",
        },
        line: {
          light: "rgba(23, 21, 18, 0.07)",
          medium: "rgba(23, 21, 18, 0.12)",
          dark: "rgba(23, 21, 18, 0.22)",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "var(--font-instrument)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-manrope)", "Manrope", "Inter", "sans-serif"],
        accent: ["var(--font-space)", "Space Grotesk", "sans-serif"],
      },
      letterSpacing: {
        editorial: "0.005em",
        tighter: "-0.015em",
        tight: "-0.005em",
        normal: "0.005em",
        wide: "0.06em",
        widest: "0.15em",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
