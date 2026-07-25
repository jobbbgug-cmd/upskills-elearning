import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const typeParam = req.nextUrl.searchParams.get("type");
    const filter: { type?: string } = {};
    if (typeParam && ["online", "onsite"].includes(typeParam)) {
      filter.type = typeParam;
    }

    const categories = await Category.find(filter).sort({ name: 1 }).lean();

    // Add default type for categories that don't have it (migration)
    const categoriesWithType = categories.map((cat: any) => ({
      ...cat,
      type: cat.type || "onsite", // Default to onsite for old categories
    }));

    return NextResponse.json(JSON.parse(JSON.stringify(categoriesWithType)));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { name, description, type } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "ชื่อหมวดหมู่ไม่ว่าง" }, { status: 400 });
    }

    if (!type || !["online", "onsite"].includes(type)) {
      return NextResponse.json({ error: "เลือกประเภท (online/onsite)" }, { status: 400 });
    }

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return NextResponse.json({ error: "หมวดหมู่นี้มีอยู่แล้ว" }, { status: 400 });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description?.trim() || "",
      type,
      isActive: true,
    });

    return NextResponse.json(JSON.parse(JSON.stringify(category)), { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
