import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "THE HERITAGE EDIT — Luxury Fashion Curated",
  description:
    "Discover meticulously curated luxury fashion with rich heritage narratives. Each piece tells a story of craftsmanship, history, and timeless elegance.",
  keywords: ["luxury fashion", "designer", "heritage", "curated", "high fashion"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
