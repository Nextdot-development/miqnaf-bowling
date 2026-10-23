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
} as const;
