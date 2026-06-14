import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import User from "@/models/User";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "teacher"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;
    const institutionId = await resolveInstitutionId(_req, auth.institutionId);
    const user = await User.findOneAndUpdate(
      { _id: id, ...tenantFilter(institutionId) },
      { status: "rejected" },
      { new: true }
    );
    if (!user) return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });

    return NextResponse.json({ message: "ปฏิเสธสำเร็จ" });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
