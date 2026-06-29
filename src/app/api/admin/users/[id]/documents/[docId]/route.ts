import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import User from "@/models/User";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; docId: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id, docId } = await params;
    const institutionId = await resolveInstitutionId(req, auth.institutionId);

    const user = await User.findOneAndUpdate(
      { _id: id, ...tenantFilter(institutionId) },
      { $pull: { documents: { _id: docId } } },
      { new: true }
    ).select("-password");

    if (!user) return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });

    return NextResponse.json({ message: "ลบเอกสารสำเร็จ" });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
