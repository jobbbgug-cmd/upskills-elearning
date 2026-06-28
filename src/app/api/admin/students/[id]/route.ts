import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import User from "@/models/User";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "teacher" && auth.role !== "super_admin"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;
    const institutionId = await resolveInstitutionId(_req, auth.institutionId);

    const student = await User.findOne({ _id: id, role: "student", ...tenantFilter(institutionId) })
      .select("-password")
      .lean();
    if (!student) return NextResponse.json({ error: "ไม่พบนักเรียน" }, { status: 404 });

    return NextResponse.json(JSON.parse(JSON.stringify(student)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "super_admin"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const body = await req.json();

    const allowed = ["name","nickname","phone","birthDate","address","gradeLevel",
                     "houseNumber","building","subDistrict","amphoe","province",
                     "parentName","parentPhone","parentRelation","groups","notes","profileImage","status"];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) update[key] = body[key];
    }

    const student = await User.findOneAndUpdate(
      { _id: id, role: "student", ...tenantFilter(institutionId) },
      update,
      { new: true }
    ).select("-password");

    if (!student) return NextResponse.json({ error: "ไม่พบนักเรียน" }, { status: 404 });
    return NextResponse.json(JSON.parse(JSON.stringify(student)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
