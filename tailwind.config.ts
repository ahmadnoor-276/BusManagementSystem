import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Navy, echoing the Al Noor Travels logo background.
        brand: {
          50: "#eef1f8",
          100: "#d6ddee",
          500: "#2a4067",
          600: "#16264a",
          700: "#0e1b38",
        },
        // Gold accent from the logo lettering.
        gold: {
          400: "#e0c56b",
          500: "#c9a227",
          600: "#b8901f",
        },
      },
    },
  },
  plugins: [],
};

export default config;
