import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import User from "@/models/User";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const institutionId = await resolveInstitutionId(req, auth.institutionId);

    // Get parent info
    const parent = await User.findOne({
      _id: id,
      role: "parent",
      ...tenantFilter(institutionId),
    }).select("studentId studentName").lean();

    if (!parent) return NextResponse.json({ error: "Parent not found" }, { status: 404 });

    // If parent has one student assigned, fetch their info
    if (parent.studentId) {
      const student = await User.findOne({
        _id: parent.studentId,
        role: "student",
        ...tenantFilter(institutionId),
      }).select("name email phone gradeLevel").lean();

      return NextResponse.json(student ? [student] : []);
    }

    return NextResponse.json([]);
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
