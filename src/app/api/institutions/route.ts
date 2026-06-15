import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Institution from "@/models/Institution";

export async function GET() {
  try {
    await connectDB();
    const institutions = await Institution.find({ isActive: true })
      .select("_id name")
      .sort({ name: 1 })
      .lean();
    return NextResponse.json(JSON.parse(JSON.stringify(institutions)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
