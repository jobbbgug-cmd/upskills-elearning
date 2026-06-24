import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/(student)/"],
    },
    sitemap: "https://www.upskillsth.com/sitemap.xml",
  };
}
