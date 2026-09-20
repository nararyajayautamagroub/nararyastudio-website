import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const paths = ["/", "/store", "/design", "/request", "/portfolio", "/projects", "/blog", "/bundles", "/login"];
  return paths.map((path) => ({
    url: base + path,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7
  }));
}
