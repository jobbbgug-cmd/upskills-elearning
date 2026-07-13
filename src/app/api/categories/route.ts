import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { tenantFilter } from "@/lib/tenant";
import Category from "@/models/Category";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const institutionId = searchParams.get("institutionId");
    const type = searchParams.get("type") || "online";

    // Default old categories to "online" type
    const query: Record<string, unknown> = {
      ...tenantFilter(institutionId),
      isActive: true,
    };

    const categories = await Category.find(query).sort({ order: 1, createdAt: 1 });

    // Filter by type, treating missing type as "online"
    const filtered = categories.filter((cat) => (cat.type || "online") === type);

    return NextResponse.json({ categories: filtered });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, description, type = "online" } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "ชื่อหมวดหมู่ไม่ถูกต้อง" }, { status: 400 });
    }

    const existingCategory = await Category.findOne({ name: name.trim(), type });
    if (existingCategory) {
      return NextResponse.json({ error: "หมวดหมู่นี้มีอยู่แล้ว" }, { status: 400 });
    }

    const maxOrder = await Category.findOne({ type }).sort({ order: -1 });
    const nextOrder = (maxOrder?.order || -1) + 1;

    const category = await Category.create({
      name: name.trim(),
      description: description || "",
      order: nextOrder,
      type,
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
