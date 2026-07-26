import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { tenantFilter } from "@/lib/tenant";
import Category from "@/models/Category";
import Course from "@/models/Course";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const institutionId = searchParams.get("institutionId");
    const type = searchParams.get("type");

    const query: Record<string, unknown> = {
      ...tenantFilter(institutionId),
      isActive: true,
    };

    if (type && ["online", "onsite", "live online"].includes(type)) {
      query.type = type;
    }

    const categories = await Category.find(query).sort({ order: 1, createdAt: -1 });

    // Get course counts for each category
    const courseCounts: Record<string, number> = {};
    const courseAgg = await Course.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    courseAgg.forEach((item) => {
      courseCounts[item._id || ""] = item.count;
    });

    const categoriesWithCount = categories.map((cat: any) => ({
      _id: cat._id,
      name: cat.name,
      type: cat.type,
      count: courseCounts[cat.name] || 0,
    }));

    return NextResponse.json({ categories: categoriesWithCount });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, description } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "ชื่อหมวดหมู่ไม่ถูกต้อง" }, { status: 400 });
    }

    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      return NextResponse.json({ error: "หมวดหมู่นี้มีอยู่แล้ว" }, { status: 400 });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || "",
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
