import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "@/styles/globals.css";

/**
 * Self-hosted, subsetted via next/font — zero render-blocking requests,
 * automatic size-adjusted fallbacks (no layout shift on font swap).
 * Two families only: serif for display, sans for UI/body.
 */
const serif = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "THE HERITAGE EDIT — Ultra-Premium African Luxury Attire",
    template: "%s — THE HERITAGE EDIT",
  },
  description:
    "Ultra-premium traditional African attire and world-class luxury — Senator wear, hand-woven Aso Oke, Agbada, and matching footwear, bags, and jewelry. Every piece with heritage, every piece with a story.",
  openGraph: {
    type: "website",
    siteName: "THE HERITAGE EDIT",
    title: "THE HERITAGE EDIT — Ultra-Premium African Luxury Attire",
    description:
      "Ultra-premium traditional African attire and world-class luxury accessories. Every piece with heritage, every piece with a story.",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0D2C22", // heritage green — colors mobile browser chrome
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="min-h-screen bg-ivory">
        {/* Keyboard/screen-reader users skip the marquee + nav in one tab */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]
                     focus:bg-obsidian focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to content
        </a>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              borderRadius: "0px",
              border: "1px solid #EAEAEA",
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
            },
          }}
        />
      </body>
    </html>
  );
}
