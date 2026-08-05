import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("x-migration-token");
    if (token !== "migrate-2024") {
      const auth = await getAuthUser();
      if (!auth || auth.role !== "super_admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    await connectDB();

    // Get all categories sorted by creation date
    const categories = await Category.find().sort({ createdAt: 1 });

    // Assign order sequentially
    let orderCounter = 0;
    for (const cat of categories) {
      await Category.findByIdAndUpdate(cat._id, { order: orderCounter });
      orderCounter++;
    }

    return NextResponse.json({
      message: "Migration completed",
      updatedCount: categories.length,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}
