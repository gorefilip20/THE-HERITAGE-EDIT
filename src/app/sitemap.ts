import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://theheritageedit.shop").replace(/\/$/, "");
  const paths = [
    "",
    "/shop",
    "/about",
    "/contact",
    "/shipping-delivery",
    "/returns-exchanges",
    "/privacy-policy",
    "/terms-conditions",
    "/collection/women",
    "/collection/men",
    "/collection/wedding-ceremony",
    "/collection/heritage-classics",
  ];
  return paths.map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: path === "" || path === "/shop" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/shop" ? 0.9 : 0.6,
  }));
}
