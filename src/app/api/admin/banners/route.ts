import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import Banner from "@/models/Banner";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "admin" && auth.role !== "super_admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const banners = await Banner.find(tenantFilter(institutionId)).sort({ order: 1, createdAt: 1 }).lean();
    return NextResponse.json(JSON.parse(JSON.stringify(banners)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "admin" && auth.role !== "super_admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const body = await req.json();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    if (institutionId) body.institutionId = institutionId;
    const banner = await Banner.create(body);
    return NextResponse.json(JSON.parse(JSON.stringify(banner)), { status: 201 });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
