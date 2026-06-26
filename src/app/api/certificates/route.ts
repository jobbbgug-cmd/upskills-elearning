import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import Certificate from "@/models/Certificate";

// GET — student: own certs | admin: all
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);

    if (auth.role === "student") {
      const certs = await Certificate.find({ studentId: auth.userId })
        .populate("courseId", "title")
        .populate("issuedBy", "name")
        .sort({ issuedAt: -1 })
        .lean();
      return NextResponse.json(JSON.parse(JSON.stringify(certs)));
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const filter: Record<string, unknown> = { ...tenantFilter(institutionId) };
    if (studentId) filter.studentId = studentId;
    const certs = await Certificate.find(filter)
      .populate("studentId", "name email profileImage")
      .populate("courseId",  "title")
      .populate("issuedBy",  "name")
      .sort({ issuedAt: -1 })
      .lean();
    return NextResponse.json(JSON.parse(JSON.stringify(certs)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

// POST — admin: issue certificate
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "super_admin"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const { studentId, courseId, title, description } = await req.json();
    if (!studentId || !title)
      return NextResponse.json({ error: "กรุณาระบุนักเรียนและชื่อใบรับรอง" }, { status: 400 });

    const cert = await Certificate.create({
      institutionId: institutionId ?? undefined,
      studentId, courseId: courseId || null, title,
      description: description ?? "",
      issuedBy: auth.userId,
      issuedAt: new Date(),
    });
    const populated = await cert.populate([
      { path: "courseId", select: "title" },
      { path: "issuedBy", select: "name" },
    ]);
    return NextResponse.json(JSON.parse(JSON.stringify(populated)), { status: 201 });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
