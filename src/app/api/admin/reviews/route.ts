import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import Review from "@/models/Review";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "super_admin"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const filter: Record<string, unknown> = { ...tenantFilter(institutionId) };
    const status = req.nextUrl.searchParams.get("status");
    if (status === "pending")  filter.isApproved = false;
    if (status === "approved") filter.isApproved = true;
    const reviews = await Review.find(filter)
      .populate("studentId", "name profileImage")
      .populate("courseId",  "title")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(JSON.parse(JSON.stringify(reviews)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
