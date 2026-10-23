import type { Metadata, Viewport } from "next";
import { GAME_TITLE } from "@/data/gameData";
import { BRAND, brandCssVariables } from "@/lib/brand";
import { BRAND_ASSETS } from "@/lib/brandAssets";
import "./fonts.css";
import "./globals.css";

export const metadata: Metadata = {
  title: GAME_TITLE,
  description: "Interactive teaching model for scientific discussion among healthcare professionals.",
  robots: { index: false, follow: false },
  icons: {
    icon: [{ url: `/favicon.ico?v=${BRAND_ASSETS.favicon.version}`, sizes: "any" }],
    shortcut: `/favicon.ico?v=${BRAND_ASSETS.favicon.version}`,
    apple: `/apple-touch-icon.png?v=${BRAND_ASSETS.favicon.version}`,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: BRAND.navy,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        {/* Brand tokens generated from src/lib/brand.ts (single source). */}
        <style dangerouslySetInnerHTML={{ __html: brandCssVariables() }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
