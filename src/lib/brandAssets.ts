/**
 * Approved brand artwork, served from public/brand/. The logo PNG is the
 * supplied artwork with its cream background made transparent; replace it
 * with an official transparent/SVG export when one is available.
 */
export const BRAND_ASSETS = {
  productLogo: {
    src: "/brand/miqnaf-logo.png",
    alt: "MIQNAF® (nafithromycin tablet 400 mg)",
    width: 781,
    height: 209,
  },
  /**
   * Favicon: the arrow mark from the MIQNAF logo (public/favicon.ico and
   * public/apple-touch-icon.png). Browsers cache favicons by URL and ignore
   * normal refreshes, so bump `version` whenever the icon file changes.
   */
  favicon: {
    version: 2,
  },
} as const;
