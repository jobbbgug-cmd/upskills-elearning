import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { tenantFilter } from "@/lib/tenant";
import Course from "@/models/Course";
import Category from "@/models/Category";

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

    let courseQuery = Course.find(query).populate("category", "name").sort(sort);
    if (limit) courseQuery = courseQuery.limit(limit);

    const courses = await courseQuery.lean().exec();

    // Extract category name from populated object
    const coursesWithCategoryNames = courses.map((course: any) => ({
      ...course,
      category: typeof course.category === 'object' ? course.category?.name : course.category,
    }));

    return NextResponse.json({ courses: coursesWithCategoryNames });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
