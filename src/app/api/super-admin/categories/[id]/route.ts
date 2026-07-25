import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const { name, description } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "ชื่อหมวดหมู่ไม่ว่าง" }, { status: 400 });
    }

    const category = await Category.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        description: description?.trim() || "",
      },
      { new: true }
    ).lean();

    if (!category) {
      return NextResponse.json({ error: "ไม่พบหมวดหมู่" }, { status: 404 });
    }

    return NextResponse.json(JSON.parse(JSON.stringify(category)));
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const category = await Category.findByIdAndDelete(id).lean();

    if (!category) {
      return NextResponse.json({ error: "ไม่พบหมวดหมู่" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}
