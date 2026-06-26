import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import { Homework } from "@/models/Homework";
import Booking from "@/models/Booking";

// Admin/teacher: list all homework | Student: list homework for enrolled courses
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (auth.role === "student") {
      const bookings = await Booking.find({ userId: auth.userId, status: "confirmed" }).select("courseId").lean();
      const courseIds = bookings.map((b) => b.courseId);
      const filter: Record<string, unknown> = { courseId: { $in: courseIds }, isActive: true, ...tenantFilter(institutionId) };
      if (courseId) filter.courseId = courseId;
      const hw = await Homework.find(filter).populate("courseId", "title").sort({ dueDate: 1 }).lean();
      return NextResponse.json(JSON.parse(JSON.stringify(hw)));
    }

    const filter: Record<string, unknown> = { ...tenantFilter(institutionId) };
    if (courseId) filter.courseId = courseId;
    const hw = await Homework.find(filter).populate("courseId", "title").populate("createdBy", "name").sort({ createdAt: -1 }).lean();
    return NextResponse.json(JSON.parse(JSON.stringify(hw)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "teacher" && auth.role !== "super_admin"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const { courseId, title, description, dueDate, maxScore, attachments } = await req.json();
    if (!courseId || !title || !dueDate) return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });

    const hw = await Homework.create({
      institutionId: institutionId ?? undefined,
      courseId, title, description: description ?? "",
      dueDate: new Date(dueDate),
      maxScore: maxScore ?? 100,
      attachments: attachments ?? [],
      createdBy: auth.userId,
    });
    return NextResponse.json(JSON.parse(JSON.stringify(hw)), { status: 201 });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
