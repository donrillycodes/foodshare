import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#1A7A4A",
          "green-dk": "#145E38",
          "green-lt": "#E8F5EE",
          "green-mid": "#2D9E64",
        },
      },
    },
  },
  plugins: [],
};

export default config;
