import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/(student)/"],
    },
    sitemap: "https://upskills-elearning.vercel.app/sitemap.xml",
  };
}
