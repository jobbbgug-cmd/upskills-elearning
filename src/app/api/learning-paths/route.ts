import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { tenantFilter } from "@/lib/tenant";
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
