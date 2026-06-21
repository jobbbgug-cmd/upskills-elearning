import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import Booking from "@/models/Booking";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth || (auth.role !== "admin" && auth.role !== "teacher" && auth.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const institutionId = await resolveInstitutionId(req, auth.institutionId);
  const base = tenantFilter(institutionId);

  const courseFilter = auth.role === "teacher"
    ? { ...base, instructorId: auth.userId }
    : base;

  const courses = await Course.find(courseFilter, {
    _id: 1, title: 1, coverImage: 1, instructor: 1, sessions: 1,
  }).lean();

  const courseIds = courses.map((c) => c._id);
  const bookings = await Booking.find(
    { ...base, courseId: { $in: courseIds }, status: "confirmed" },
    { courseId: 1, sessionId: 1 }
  ).lean();

  const countMap: Record<string, number> = {};
  bookings.forEach((b) => {
    const key = `${b.courseId}_${b.sessionId}`;
    countMap[key] = (countMap[key] ?? 0) + 1;
  });

  const events = courses
    .flatMap((c) => {
      const courseId = (c._id as { toString(): string }).toString();
      return (c.sessions ?? []).map(
        (s: { _id: { toString(): string }; date: Date; startTime: string; endTime: string; zoomLink?: string; maxCapacity: number }) => ({
          courseId,
          courseTitle: c.title,
          instructor: c.instructor,
          coverImage: c.coverImage ?? "",
          sessionId: s._id.toString(),
          date: new Date(s.date).toISOString().slice(0, 10),
          startTime: s.startTime,
          endTime: s.endTime,
          zoomLink: s.zoomLink ?? "",
          confirmedStudents: countMap[`${courseId}_${s._id.toString()}`] ?? 0,
          maxCapacity: s.maxCapacity,
        })
      );
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({ events });
}
