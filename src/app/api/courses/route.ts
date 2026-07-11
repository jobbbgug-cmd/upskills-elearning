import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { tenantFilter } from "@/lib/tenant";
import Course from "@/models/Course";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const gradeLevel = searchParams.get("gradeLevel");
    const category = searchParams.get("category");
    const institutionId = searchParams.get("institutionId");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : null;
    const sort = searchParams.get("sort") || "-createdAt";

    const query: Record<string, unknown> = { ...tenantFilter(institutionId), isActive: true };
    if (gradeLevel) query.gradeLevels = gradeLevel;
    if (category) query.category = category;

    let courseQuery = Course.find(query).sort(sort);
    if (limit) courseQuery = courseQuery.limit(limit);

    const courses = await courseQuery.exec();
    return NextResponse.json({ courses });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
