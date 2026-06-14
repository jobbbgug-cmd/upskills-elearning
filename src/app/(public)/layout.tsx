import { headers } from "next/headers";
import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { connectDB } from "@/lib/mongodb";
import Institution from "@/models/Institution";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const headersList = await headers();
    const slug = headersList.get("x-tenant-slug");
    if (!slug || slug === "default") {
      return { title: "UPSkills — คอร์สเรียนออนไลน์", description: "คอร์สเรียนออนไลน์คุณภาพสูง" };
    }
    await connectDB();
    const inst = await Institution.findOne({ slug, isActive: true })
      .select("name tagline faviconUrl")
      .lean() as { name?: string; tagline?: string; faviconUrl?: string } | null;

    if (!inst) return { title: "UPSkills — คอร์สเรียนออนไลน์" };

    const title = inst.name ? `${inst.name}` : "UPSkills";
    const description = inst.tagline || "คอร์สเรียนออนไลน์คุณภาพสูง";
    const icons = inst.faviconUrl ? [{ url: inst.faviconUrl }] : undefined;

    return { title, description, icons };
  } catch {
    return { title: "UPSkills — คอร์สเรียนออนไลน์" };
  }
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
