import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        text: "rgb(var(--text) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        brand: {
          50: "#f4f0ff",
          100: "#e8ddff",
          200: "#d3bcff",
          300: "#b58cff",
          400: "#9757ff",
          500: "#8129ff",
          600: "#7112f0",
          700: "#5f0bcc",
          800: "#4f0fa6",
          900: "#421385",
          950: "#28075c",
        },
        solar: {
          400: "#ffc966",
          500: "#ffb020",
          600: "#f2900a",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgb(var(--glow) / 0.55)",
        "glow-lg": "0 0 80px -20px rgb(var(--glow) / 0.65)",
        card: "0 1px 2px rgb(0 0 0 / 0.06), 0 8px 24px -8px rgb(0 0 0 / 0.12)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgb(var(--glow) / 0.22), transparent 70%)",
      },
      keyframes: {
        "spin-slow": { to: { transform: "rotate(360deg)" } },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.6" },
          "80%,100%": { transform: "scale(1.6)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "beam-move": {
          "0%": { transform: "translateX(-30%)" },
          "100%": { transform: "translateX(30%)" },
        },
      },
      animation: {
        "spin-slow": "spin-slow 14s linear infinite",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.2,0.6,0.4,1) infinite",
        shimmer: "shimmer 2.2s linear infinite",
        float: "float 6s ease-in-out infinite",
        "beam-move": "beam-move 8s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [],
};

export default config;
