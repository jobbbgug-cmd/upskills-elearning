import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import User from "@/models/User";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; docId: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "super_admin"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id, docId } = await params;
    const institutionId = await resolveInstitutionId(req, auth.institutionId);

    const student = await User.findOneAndUpdate(
      { _id: id, role: "student", ...tenantFilter(institutionId) },
      { $pull: { documents: { _id: docId } } },
      { new: true }
    ).select("documents");

    if (!student) return NextResponse.json({ error: "ไม่พบนักเรียน" }, { status: 404 });
    return NextResponse.json(JSON.parse(JSON.stringify(student.documents)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
