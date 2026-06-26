import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "teacher" && auth.role !== "super_admin"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const group  = searchParams.get("group") ?? "";
    const grade  = searchParams.get("grade") ?? "";

    const filter: Record<string, unknown> = {
      ...tenantFilter(institutionId),
      role: "student",
    };
    if (search) filter.$or = [
      { name:  { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
    if (group) filter.groups = group;
    if (grade) filter.gradeLevel = grade;

    const students = await User.find(filter)
      .select("-password -documents")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(JSON.parse(JSON.stringify(students)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
