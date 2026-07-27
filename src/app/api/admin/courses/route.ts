import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import Institution from "@/models/Institution";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "teacher")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const tenantClause = auth.institutionId ? { institutionId: auth.institutionId } : {};
    const filter = auth.role === "teacher" ? { ...tenantClause, instructorId: auth.userId } : tenantClause;

    const courses = await Course.find(filter).sort({ createdAt: -1 }).lean();

    let institutionName = "";
    if (auth.institutionId) {
      const inst = await Institution.findById(auth.institutionId).select("name").lean() as { name: string } | null;
      institutionName = inst?.name ?? "";
    }

    return NextResponse.json({
      courses: JSON.parse(JSON.stringify(courses)),
      institutionName,
    });
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}
