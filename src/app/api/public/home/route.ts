import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Banner from "@/models/Banner";
import Institution from "@/models/Institution";

export async function GET() {
  try {
    await connectDB();
    const [banners, institutions] = await Promise.all([
      Banner.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean(),
      Institution.find({ isActive: true }).select("_id name").lean(),
    ]);
    const institutionNames: Record<string, string> = {};
    (institutions as unknown as { _id: { toString(): string }; name: string }[]).forEach((i) => {
      institutionNames[i._id.toString()] = i.name;
    });
    return NextResponse.json({
      banners: JSON.parse(JSON.stringify(banners)),
      institutionNames,
      institutionCount: institutions.length,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ banners: [], institutionNames: {}, institutionCount: 0 });
  }
}
