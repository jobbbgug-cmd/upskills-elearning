import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Coupon from "@/models/Coupon";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();

    const institutionId = req.nextUrl.searchParams.get("institutionId");
    const filter: Record<string, unknown> = {};
    if (institutionId) filter.institutionId = institutionId;

    const coupons = await Coupon.find(filter)
      .populate("institutionId", "name slug")
      .populate("courseIds",     "title")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(JSON.parse(JSON.stringify(coupons)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
