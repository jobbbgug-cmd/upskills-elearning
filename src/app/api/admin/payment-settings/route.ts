import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { resolveInstitutionId } from "@/lib/tenant";
import Institution from "@/models/Institution";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "super_admin"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    if (!institutionId) return NextResponse.json({});

    const inst = await Institution.findById(institutionId)
      .select("promptpayNumber bankName bankAccountNumber bankAccountName")
      .lean() as { promptpayNumber?: string; bankName?: string; bankAccountNumber?: string; bankAccountName?: string } | null;
    return NextResponse.json(inst ?? {});
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "super_admin"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    if (!institutionId) return NextResponse.json({ error: "ไม่พบสถาบัน" }, { status: 404 });
    const { promptpayNumber, bankName, bankAccountNumber, bankAccountName } = await req.json();
    const updated = await Institution.findByIdAndUpdate(
      institutionId,
      { $set: { promptpayNumber, bankName, bankAccountNumber, bankAccountName } },
      { new: true }
    ).select("promptpayNumber bankName bankAccountNumber bankAccountName");
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
