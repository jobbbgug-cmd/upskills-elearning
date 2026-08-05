import { MetadataRoute } from "next";

const BASE_URL = "https://www.upskillsth.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/courses`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  ];
}
