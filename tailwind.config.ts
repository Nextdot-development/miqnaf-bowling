import type { Config } from "tailwindcss";

/**
 * Brand colours are defined once in src/lib/brand.ts and injected as CSS
 * custom properties (see src/app/layout.tsx). Tailwind only references the
 * variables, so no hex values live here.
 */
const withAlpha = (name: string) => `rgb(var(--${name}-rgb) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  // Hover styles only on devices that can hover (no sticky hover on touch).
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      screens: {
        /** Landscape ≥1280px: fixed full-screen kiosk layout (no page scroll). */
        kiosk: { raw: "(min-width: 1280px) and (min-aspect-ratio: 4/3)" },
      },
      colors: {
        brand: {
          red: withAlpha("brand-red"),
          navy: withAlpha("brand-navy"),
          gold: withAlpha("brand-gold"),
        },
        ink: {
          DEFAULT: withAlpha("ink"),
          muted: withAlpha("ink-muted"),
          soft: withAlpha("ink-soft"),
        },
        surface: {
          DEFAULT: withAlpha("surface"),
          page: withAlpha("surface-page"),
          sunken: withAlpha("surface-sunken"),
          tint: withAlpha("surface-tint"),
        },
        line: withAlpha("line"),
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      boxShadow: {
        card: "0 1px 2px rgb(var(--brand-navy-rgb) / 0.06), 0 8px 24px -12px rgb(var(--brand-navy-rgb) / 0.18)",
        lift: "0 2px 4px rgb(var(--brand-navy-rgb) / 0.08), 0 18px 40px -18px rgb(var(--brand-navy-rgb) / 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
