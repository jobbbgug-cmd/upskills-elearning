import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "admin" && auth.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const teachers = await User.find({
      ...tenantFilter(institutionId),
      role: "teacher",
      status: "approved",
    })
      .select("_id name email")
      .sort({ name: 1 })
      .lean();
    return NextResponse.json(JSON.parse(JSON.stringify(teachers)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
