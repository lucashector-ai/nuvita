import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        green: {
          DEFAULT: "#5EC991",
          light: "#CAF6EC",
          dark: "#2E7A58",
        },
        dark: {
          DEFAULT: "#353B39",
          2: "#2A2F2D",
        },
        amber: {
          DEFAULT: "#D4893A",
          light: "#FFF7ED",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
