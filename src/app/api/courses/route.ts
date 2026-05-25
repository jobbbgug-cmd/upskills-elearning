import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const gradeLevel = searchParams.get("gradeLevel");
    const category = searchParams.get("category");

    const query: Record<string, unknown> = { isActive: true };
    if (gradeLevel) query.gradeLevels = gradeLevel;
    if (category) query.category = category;

    const courses = await Course.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ courses });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
