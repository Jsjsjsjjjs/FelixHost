// tailwind.config.ts

import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ptero: {
          bg: "rgb(10 10 20)",
          surface: "rgb(17 17 30)",
          elevated: "rgb(24 24 40)",
          border: "rgb(30 30 55)",
          accent: "rgb(99 102 241)",
          cyan: "rgb(34 211 238)",
          text: "rgb(241 245 249)",
          muted: "rgb(100 116 139)",
        },
        border: "rgb(30 30 55)",
        background: "rgb(10 10 20)",
        foreground: "rgb(241 245 249)",
        primary: {
          DEFAULT: "rgb(99 102 241)",
          foreground: "white",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...fontFamily.sans],
        mono: ["var(--font-mono)", ...fontFamily.mono],
      },
      borderRadius: {
        lg: "0.625rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "slide-in": "slide-in 0.2s ease-out",
        shimmer: "shimmer 1.5s infinite linear",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
