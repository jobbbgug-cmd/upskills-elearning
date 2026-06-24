import { MetadataRoute } from "next";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";

const BASE_URL = "https://www.upskillsth.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();
  const courses = await Course.find({ status: "published" }, { _id: 1, updatedAt: 1 }).lean();

  const courseUrls: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${BASE_URL}/courses/${c._id}`,
    lastModified: c.updatedAt ?? new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/courses`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    ...courseUrls,
  ];
}
