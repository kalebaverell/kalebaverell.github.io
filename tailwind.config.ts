import type { Config } from "tailwindcss";

// VetPath uses CSS custom properties for theming (see app/globals.css).
// Tailwind is used for layout utilities; brand colors map to the CSS variables
// so the design direction (Professional / Warm / Civic) can be swapped at runtime.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        "primary-700": "var(--primary-700)",
        accent: "var(--accent)",
        "accent-soft": "var(--accent-soft)",
        "accent-ink": "var(--accent-ink)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        surface: "var(--surface)",
        line: "var(--border)",
      },
      borderRadius: {
        card: "12px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
