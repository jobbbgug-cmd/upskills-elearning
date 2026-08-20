import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import CourseContent from "@/models/CourseContent";
import Institution from "@/models/Institution";
import { tenantFilter } from "@/lib/tenant";

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "teacher" && auth.role !== "teacher-online" && auth.role !== "teacher_online")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const filter = { ...tenantFilter(auth.institutionId) };
    const contents = await CourseContent.find(filter).sort({ createdAt: -1 }).lean();

    let institutionName = "";
    if (auth.institutionId) {
      const inst = await Institution.findById(auth.institutionId).select("name").lean() as { name: string } | null;
      institutionName = inst?.name ?? "";
    }

    return NextResponse.json({
      contents: JSON.parse(JSON.stringify(contents)),
      institutionName,
    });
  } catch (error) {
    console.error("Error fetching contents:", error);
    return NextResponse.json({ error: "Failed to fetch contents" }, { status: 500 });
  }
}
