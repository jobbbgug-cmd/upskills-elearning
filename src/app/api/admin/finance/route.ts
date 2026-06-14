import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import FinanceSetting from "@/models/FinanceSetting";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const setting = await FinanceSetting.findOne(tenantFilter(institutionId)).lean();
    return NextResponse.json(setting ?? {});
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const body = await req.json();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const filter = tenantFilter(institutionId);
    const update = institutionId ? { ...body, institutionId } : body;
    const setting = await FinanceSetting.findOneAndUpdate(
      filter,
      { $set: update },
      { new: true, upsert: true }
    );
    return NextResponse.json(JSON.parse(JSON.stringify(setting)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
