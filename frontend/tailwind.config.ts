import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: {
          DEFAULT: "#1a1d23",
          hover: "#2a2d35",
          active: "#33363f",
          border: "#2a2d35",
        },
        primary: {
          DEFAULT: "#6366f1",
          hover: "#5558e6",
          light: "#818cf8",
        },
      },
    },
  },
  plugins: [],
};

export default config;
