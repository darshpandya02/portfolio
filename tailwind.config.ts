import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

import { springPage, springPill } from "./lib/motion";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        term: {
          bg: "rgb(var(--t-bg-rgb) / <alpha-value>)",
          panel: "rgb(var(--t-panel-rgb) / <alpha-value>)",
          raised: "rgb(var(--t-raised-rgb) / <alpha-value>)",
          border: "rgb(var(--t-border-rgb) / <alpha-value>)",
          fg: "rgb(var(--t-fg-rgb) / <alpha-value>)",
          dim: "rgb(var(--t-dim-rgb) / <alpha-value>)",
          faint: "rgb(var(--t-faint-rgb) / <alpha-value>)",
          green: "rgb(var(--t-green-rgb) / <alpha-value>)",
          cyan: "rgb(var(--t-cyan-rgb) / <alpha-value>)",
          blue: "rgb(var(--t-blue-rgb) / <alpha-value>)",
          yellow: "rgb(var(--t-yellow-rgb) / <alpha-value>)",
          red: "rgb(var(--t-red-rgb) / <alpha-value>)",
          magenta: "rgb(var(--t-magenta-rgb) / <alpha-value>)",
          accent: "rgb(var(--t-accent-rgb) / <alpha-value>)",
        },
      },
      transitionTimingFunction: {
        spring: springPill.easing,
        "spring-page": springPage.easing,
      },
      transitionDuration: {
        spring: `${springPill.durationMs}ms`,
      },
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      keyframes: {
        blink: { "0%, 49%": { opacity: "1" }, "50%, 100%": { opacity: "0" } },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "92%": { opacity: "1" },
          "93%": { opacity: "0.86" },
          "95%": { opacity: "1" },
        },
      },
      animation: {
        blink: "blink 1.05s steps(1) infinite",
        "fade-up": "fade-up 160ms ease-out both",
        flicker: "flicker 6s linear infinite",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("tailwind-scrollbar"),
    // One source of truth for motion: the springs are solved in lib/motion.ts and
    // published as custom properties so plain CSS (including the ::view-transition
    // pseudo elements, which Tailwind cannot reach) uses the same curves.
    plugin(({ addBase }) =>
      addBase({
        ":root": {
          "--spring-page": springPage.easing,
          "--spring-page-duration": `${springPage.durationMs}ms`,
          "--spring-pill": springPill.easing,
          "--spring-pill-duration": `${springPill.durationMs}ms`,
        },
      }),
    ),
  ],
};
export default config;
