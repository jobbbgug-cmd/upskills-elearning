import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId } from "@/lib/tenant";
import Institution from "@/models/Institution";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || !["admin", "owner", "super_admin"].includes(auth.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();

    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    if (!institutionId) return NextResponse.json({ error: "Institution not found" }, { status: 404 });

    const institution = await Institution.findById(institutionId).lean();
    return NextResponse.json(JSON.parse(JSON.stringify(institution)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
