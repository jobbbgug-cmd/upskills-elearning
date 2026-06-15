import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { tenantFilter } from "@/lib/tenant";
import Banner from "@/models/Banner";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const institutionId = searchParams.get("institutionId");
    const banners = await Banner.find({ ...tenantFilter(institutionId), isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .lean();
    return NextResponse.json(JSON.parse(JSON.stringify(banners)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
