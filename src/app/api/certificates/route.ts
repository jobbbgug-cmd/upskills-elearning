import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import Certificate from "@/models/Certificate";

// GET — student: own certs | admin/teacher: their issued certs
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

    if (auth.role === "teacher-online" || auth.role === "teacher_online" || auth.role === "teacher") {
      filter.issuedBy = auth.userId;
    }

    if (studentId) filter.studentId = studentId;
    const certs = await Certificate.find(filter)
      .populate("studentId", "name email profileImage")
      .populate("courseId",  "title")
      .populate("issuedBy", "name")
      .sort({ issuedAt: -1 })
      .lean();
    return NextResponse.json(JSON.parse(JSON.stringify(certs)));
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[GET /api/certificates] Error:", errorMsg);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

// POST — admin/teacher: issue certificate
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "super_admin" && auth.role !== "teacher-online" && auth.role !== "teacher_online" && auth.role !== "teacher"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const { courseId, studentId, title, description } = await req.json();
    if (!courseId || !title)
      return NextResponse.json({ error: "กรุณาระบุคอร์สและชื่อใบรับรอง" }, { status: 400 });

    console.log("[POST /api/certificates] Creating with:", { courseId, studentId, title, issuedBy: auth.userId });
    const cert = await Certificate.create({
      institutionId: institutionId ?? undefined,
      courseId,
      studentId: studentId && studentId.trim() ? studentId : undefined,
      title,
      description: description ?? "",
      issuedBy: auth.userId,
      issuedAt: new Date(),
    });
    console.log("[POST /api/certificates] Created successfully:", cert._id);
    const populated = await cert.populate([
      { path: "courseId", select: "title" },
      { path: "issuedBy", select: "name" },
    ]);
    return NextResponse.json(JSON.parse(JSON.stringify(populated)), { status: 201 });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[POST /api/certificates] Error:", errorMsg);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด", details: errorMsg }, { status: 500 });
  }
}
