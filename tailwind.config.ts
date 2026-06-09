import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        grass: "#157347",
        clay: "#a15c38",
        paper: "#f7f6f2"
      },
      boxShadow: {
        soft: "0 1px 3px rgba(23, 23, 23, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
