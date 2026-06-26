import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import User from "@/models/User";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "super_admin"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const { name, url, type } = await req.json();
    if (!name || !url) return NextResponse.json({ error: "กรุณาระบุชื่อและ URL เอกสาร" }, { status: 400 });

    const student = await User.findOneAndUpdate(
      { _id: id, role: "student", ...tenantFilter(institutionId) },
      { $push: { documents: { name, url, type: type ?? "other", uploadedAt: new Date() } } },
      { new: true }
    ).select("documents");

    if (!student) return NextResponse.json({ error: "ไม่พบนักเรียน" }, { status: 404 });
    return NextResponse.json(JSON.parse(JSON.stringify(student.documents)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
