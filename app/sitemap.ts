import { MetadataRoute } from "next";
import { OFFERS } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://janeyradiance.com";

  const staticPages = [
    "",
    "/services",
    "/team",
    "/contact",
    "/book",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1.0 : 0.8,
  }));

  const offerPages = Object.keys(OFFERS).map((slug) => ({
    url: `${baseUrl}/offers/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticPages, ...offerPages];
}
