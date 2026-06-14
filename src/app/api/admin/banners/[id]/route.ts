import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import Banner from "@/models/Banner";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const banner = await Banner.findOneAndUpdate({ _id: id, ...tenantFilter(institutionId) }, body, { new: true });
    if (!banner) return NextResponse.json({ error: "ไม่พบแบนเนอร์" }, { status: 404 });
    return NextResponse.json(JSON.parse(JSON.stringify(banner)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const institutionId = await resolveInstitutionId(_req, auth.institutionId);
    await Banner.findOneAndDelete({ _id: id, ...tenantFilter(institutionId) });
    return NextResponse.json({ message: "ลบแบนเนอร์สำเร็จ" });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
