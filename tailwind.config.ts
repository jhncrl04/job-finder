import type { Config } from "tailwindcss";

/*
  Pastel palette. Each hue has three roles:
  DEFAULT = fill for buttons and tiles, soft = quiet background tint,
  deep = readable text/icon color on top of the tints.
  Rule: never put pastel text on a pastel background; use ink or deep.
*/
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#FBF9FF",
        ink: { DEFAULT: "#2B2A3A", soft: "#6B6A7C", faint: "#9A99AA" },
        line: "#ECE8F7",
        lav: { DEFAULT: "#B9A7F5", soft: "#EEE9FD", deep: "#5B49C2" },
        mint: { DEFAULT: "#BDEBD6", soft: "#E6F7EF", deep: "#2A7554" },
        peach: { DEFAULT: "#FFD6C2", soft: "#FFEFE7", deep: "#A64F27" },
        sky: { DEFAULT: "#BFE3FA", soft: "#E8F5FD", deep: "#1F6A98" },
        rose: { DEFAULT: "#F9C9DA", soft: "#FDEAF1", deep: "#A8325F" },
        butter: { DEFAULT: "#FFF1B8", soft: "#FFF8DB", deep: "#7A6410" },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      keyframes: {
        "slide-in": {
          from: { opacity: "0", transform: "translateX(28px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "rise-in": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "slide-in": "slide-in 0.22s ease-out",
        "rise-in": "rise-in 0.2s ease-out",
      },
      boxShadow: {
        soft: "0 10px 30px -14px rgba(91, 73, 194, 0.28)",
        lift: "0 18px 40px -16px rgba(91, 73, 194, 0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
