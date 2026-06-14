import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import Booking from "@/models/Booking";
import Course from "@/models/Course";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "teacher")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const base = tenantFilter(institutionId);

    let filter: Record<string, unknown> = base;
    if (auth.role === "teacher") {
      const teacherCourses = await Course.find({ ...base, instructorId: auth.userId }).select("_id");
      const courseIds = teacherCourses.map((c) => c._id);
      filter = { ...base, courseId: { $in: courseIds } };
    }

    const bookings = await Booking.find(filter)
      .populate("userId", "name email gradeLevel")
      .populate("courseId", "title sessions")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ bookings: JSON.parse(JSON.stringify(bookings)) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
