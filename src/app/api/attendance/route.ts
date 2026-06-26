import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import Attendance from "@/models/Attendance";

// GET: admin/teacher list attendance for a session
// Student: get own attendance records
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const { searchParams } = new URL(req.url);
    const courseId  = searchParams.get("courseId");
    const sessionId = searchParams.get("sessionId");

    if (auth.role === "student") {
      const records = await Attendance.find({ studentId: auth.userId, ...tenantFilter(institutionId) })
        .populate("courseId", "title")
        .sort({ checkedInAt: -1 })
        .lean();
      return NextResponse.json(JSON.parse(JSON.stringify(records)));
    }

    const filter: Record<string, unknown> = { ...tenantFilter(institutionId) };
    if (courseId)  filter.courseId  = courseId;
    if (sessionId) filter.sessionId = sessionId;

    const records = await Attendance.find(filter)
      .populate("studentId", "name email profileImage gradeLevel")
      .populate("courseId", "title")
      .sort({ checkedInAt: 1 })
      .lean();
    return NextResponse.json(JSON.parse(JSON.stringify(records)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

// POST: manual check-in by admin/teacher
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "teacher" && auth.role !== "super_admin"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const { courseId, sessionId, studentId, note } = await req.json();
    if (!courseId || !sessionId || !studentId)
      return NextResponse.json({ error: "กรุณาระบุข้อมูลให้ครบ" }, { status: 400 });

    const record = await Attendance.findOneAndUpdate(
      { courseId, sessionId, studentId },
      { $set: { institutionId: institutionId ?? undefined, method: "manual", checkedInAt: new Date(), note } },
      { upsert: true, new: true }
    ).populate("studentId", "name email profileImage gradeLevel");
    return NextResponse.json(JSON.parse(JSON.stringify(record)));
  } catch (e: unknown) {
    if ((e as { code?: number }).code === 11000)
      return NextResponse.json({ error: "เช็คชื่อแล้ว" }, { status: 400 });
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "super_admin"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { courseId, sessionId, studentId } = await req.json();
    await Attendance.findOneAndDelete({ courseId, sessionId, studentId });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
