import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import LiveSession from "@/models/LiveSession";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();

    const status = req.nextUrl.searchParams.get("status");
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const sessions = await LiveSession.find(filter)
      .populate("institutionId", "name slug")
      .populate("courseId",      "title")
      .populate("createdBy",     "name")
      .sort({ scheduledAt: -1 })
      .lean();

    return NextResponse.json(JSON.parse(JSON.stringify(sessions)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
