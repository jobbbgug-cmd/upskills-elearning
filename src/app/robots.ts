import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/(student)/"],
    },
    sitemap: "https://upskillsth.com/sitemap.xml",
  };
}
