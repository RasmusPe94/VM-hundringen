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
        pitch:   "#0a0f0d",
        surface: "#111814",
        rim:     "#1a2420",
        fence:   "#243028",
        border:  "#2d3d36",
        muted:   "#7a9186",
        body:    "#cdddd6",
        bright:  "#eaf4ef",
        gold:    "#d4a017",
        foam:    "#f0c842",
        turf:    "#1a7a46",
        turf2:   "#15603a",
        amber:   "#b87333",
        danger:  "#c0392b",
        danger2: "#96291e",
      },
      boxShadow: {
        card:  "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
        glow:  "0 0 0 1px rgba(212,160,23,0.15), 0 4px 16px rgba(212,160,23,0.07)",
        turf:  "0 0 0 1px rgba(26,122,70,0.2)",
      },
      backgroundImage: {
        "pitch-fade": "radial-gradient(ellipse at 50% 0%, #1a2e22 0%, #0a0f0d 60%)",
        "gold-shine": "linear-gradient(135deg, #d4a017 0%, #f0c842 50%, #d4a017 100%)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
      },
    }
  },
  plugins: []
};

export default config;
