import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";

export async function POST(req: Request) {
  try {
    // Temporary: check for special migration token
    const token = req.headers.get("x-migration-token");
    if (token !== "migrate-2024") {
      const auth = await getAuthUser();
      if (!auth || auth.role !== "super_admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    await connectDB();

    // Update all categories that don't have type field
    const result = await Category.updateMany(
      { type: { $exists: false } },
      { $set: { type: "onsite" } }
    );

    return NextResponse.json({
      message: "Migration completed",
      modifiedCount: result.modifiedCount,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}
