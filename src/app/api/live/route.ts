import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import LiveSession from "@/models/LiveSession";
import Booking from "@/models/Booking";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);

    if (auth.role === "student") {
      const bookings = await Booking.find({ userId: auth.userId, status: "confirmed" }).select("courseId").lean() as unknown as { courseId: { toString(): string } }[];
      const courseIds = bookings.map((b) => b.courseId.toString());
      const sessions = await LiveSession.find({
        ...tenantFilter(institutionId),
        $or: [{ courseId: { $in: courseIds } }, { courseId: null }],
      })
        .populate("courseId", "title")
        .sort({ scheduledAt: 1 })
        .lean();
      return NextResponse.json(JSON.parse(JSON.stringify(sessions)));
    }

    const filter: Record<string, unknown> = tenantFilter(institutionId);
    if (auth.role === "teacher") filter.createdBy = auth.userId;
    const sessions = await LiveSession.find(filter)
      .populate("courseId", "title")
      .populate("createdBy", "name")
      .sort({ scheduledAt: -1 })
      .lean();
    return NextResponse.json(JSON.parse(JSON.stringify(sessions)));
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
    const { title, description, meetLink, scheduledAt, duration, courseId } = await req.json();
    if (!title || !scheduledAt) return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });

    const session = await LiveSession.create({
      institutionId: institutionId ?? undefined,
      courseId: courseId || null, title, description: description ?? "",
      meetLink: meetLink ?? "", scheduledAt: new Date(scheduledAt),
      duration: duration ?? 60, createdBy: auth.userId,
    });
    const populated = await session.populate([
      { path: "courseId", select: "title" },
      { path: "createdBy", select: "name" },
    ]);
    return NextResponse.json(JSON.parse(JSON.stringify(populated)), { status: 201 });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
