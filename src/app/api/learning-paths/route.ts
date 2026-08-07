import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { tenantFilter } from "@/lib/tenant";
import { getAuthUser } from "@/lib/auth";
import LearningPath from "@/models/LearningPath";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const institutionId = searchParams.get("institutionId");

    const query: Record<string, unknown> = {
      ...tenantFilter(institutionId),
      isActive: true,
    };

    const paths = await LearningPath.find(query)
      .sort({ createdAt: -1 })
      .populate("courses", "title slug");

    return NextResponse.json({ paths });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "owner")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { title, description, difficulty, price, discount, discountType, courseIds } = await req.json();

    if (!title?.trim() || !description?.trim() || !Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const path = await LearningPath.create({
      title,
      description,
      difficulty: difficulty || "beginner",
      price: price || 0,
      discount: discount || 0,
      discountType: discountType || "percentage",
      courses: courseIds,
      instructor: auth.name || "Admin",
      institutionId: auth.institutionId,
      isActive: true,
    });

    return NextResponse.json({ path }, { status: 201 });
  } catch (err) {
    console.error("Error creating learning path:", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
