import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { tenantFilter, getTenantId } from "@/lib/tenant";
import FinanceSetting from "@/models/FinanceSetting";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const institutionId = await getTenantId(req);
    const setting = await FinanceSetting.findOne(tenantFilter(institutionId)).lean();
    return NextResponse.json(setting ?? {});
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
