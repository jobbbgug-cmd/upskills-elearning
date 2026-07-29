import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import Course from "@/models/Course";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const query: Record<string, unknown> = { isActive: true };
    if (type && ["online", "onsite", "live online"].includes(type)) {
      query.type = type;
    }

    const categories = await Category.find(query).sort({ order: 1, createdAt: -1 }).lean();

    // Get course counts for each category
    const courseCounts: Record<string, number> = {};
    const courseAgg = await Course.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    courseAgg.forEach((item) => {
      courseCounts[item._id?.toString() || ""] = item.count;
    });

    const categoriesWithCount = categories.map((cat: any) => ({
      _id: cat._id,
      name: cat.name,
      description: cat.description,
      type: cat.type,
      isActive: cat.isActive,
      order: cat.order,
      createdAt: cat.createdAt,
      count: courseCounts[cat._id?.toString() || ""] || 0,
    }));

    return NextResponse.json({ categories: categoriesWithCount });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const { name, description, type = "online", order } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "ชื่อหมวดหมู่ไม่ถูกต้อง" }, { status: 400 });
    }

    if (!["online", "onsite", "live online"].includes(type)) {
      return NextResponse.json({ error: "ประเภทหมวดหมู่ไม่ถูกต้อง" }, { status: 400 });
    }

    const existingCategory = await Category.findOne({ name: name.trim(), type });
    if (existingCategory) {
      return NextResponse.json({ error: "หมวดหมู่นี้มีอยู่แล้ว" }, { status: 400 });
    }

    // Calculate order if not provided
    let finalOrder = order;
    if (finalOrder === undefined) {
      const maxOrderDoc = await Category.findOne({ type }).sort({ order: -1 }).lean() as any;
      finalOrder = (maxOrderDoc?.order || 0) + 1;
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || "",
      type,
      order: finalOrder,
      isActive: true,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
