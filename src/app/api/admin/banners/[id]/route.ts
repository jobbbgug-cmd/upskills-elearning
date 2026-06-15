import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import Banner from "@/models/Banner";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "admin" && auth.role !== "super_admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    if (body.isActive !== undefined && auth.role !== "super_admin")
      return NextResponse.json({ error: "เฉพาะ Super Admin เท่านั้นที่เปลี่ยนสถานะการแสดงได้" }, { status: 403 });
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const filter = auth.role === "super_admin" ? { _id: id } : { _id: id, ...tenantFilter(institutionId) };
    const banner = await Banner.findOneAndUpdate(filter, body, { new: true });
    if (!banner) return NextResponse.json({ error: "ไม่พบแบนเนอร์" }, { status: 404 });
    return NextResponse.json(JSON.parse(JSON.stringify(banner)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "admin" && auth.role !== "super_admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const institutionId = await resolveInstitutionId(_req, auth.institutionId);
    const filter = auth.role === "super_admin" ? { _id: id } : { _id: id, ...tenantFilter(institutionId) };
    await Banner.findOneAndDelete(filter);
    return NextResponse.json({ message: "ลบแบนเนอร์สำเร็จ" });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
