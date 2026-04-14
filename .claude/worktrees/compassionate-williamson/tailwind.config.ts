import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        esina: {
          50: "#eef9ff",
          100: "#d9f1ff",
          200: "#bce8ff",
          300: "#8edbff",
          400: "#59c4ff",
          500: "#33a6ff",
          600: "#1b87f5",
          700: "#1470e1",
          800: "#175ab6",
          900: "#194d8f",
          950: "#143057",
        },
      },
    },
  },
  plugins: [],
};
export default config;
