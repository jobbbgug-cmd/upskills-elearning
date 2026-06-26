import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import Coupon from "@/models/Coupon";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "super_admin"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const coupons = await Coupon.find(tenantFilter(institutionId))
      .populate("courseIds", "title")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(JSON.parse(JSON.stringify(coupons)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "super_admin"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    if (!institutionId) return NextResponse.json({ error: "ไม่พบสถาบัน" }, { status: 404 });
    const body = await req.json();
    const { code, type, value, maxUses, expiresAt, courseIds } = body;
    if (!code || !type || !value) return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
    const coupon = await Coupon.create({
      institutionId,
      code: code.toUpperCase().trim(),
      type,
      value: Number(value),
      maxUses: maxUses ? Number(maxUses) : null,
      expiresAt: expiresAt || null,
      courseIds: courseIds ?? [],
    });
    return NextResponse.json(coupon, { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000)
      return NextResponse.json({ error: "โค้ดนี้ถูกใช้แล้ว" }, { status: 409 });
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
