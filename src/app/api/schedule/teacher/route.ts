import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import Booking from "@/models/Booking";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth || (auth.role !== "admin" && auth.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const courseFilter = auth.role === "teacher" ? { instructorId: auth.userId } : {};
  const courses = await Course.find(courseFilter, {
    _id: 1, title: 1, coverImage: 1, instructor: 1, sessions: 1,
  }).lean();

  // Count confirmed bookings per (courseId, sessionId)
  const courseIds = courses.map((c) => c._id);
  const bookings = await Booking.find(
    { courseId: { $in: courseIds }, status: "confirmed" },
    { courseId: 1, sessionId: 1 }
  ).lean();

  const countMap: Record<string, number> = {};
  bookings.forEach((b) => {
    const key = `${b.courseId}_${b.sessionId}`;
    countMap[key] = (countMap[key] ?? 0) + 1;
  });

  const events = courses.flatMap((c) =>
    (c.sessions ?? []).map((s) => ({
      courseId: c._id.toString(),
      courseTitle: c.title,
      instructor: c.instructor,
      coverImage: c.coverImage ?? "",
      sessionId: s._id.toString(),
      date: new Date(s.date).toISOString().slice(0, 10),
      startTime: s.startTime,
      endTime: s.endTime,
      zoomLink: s.zoomLink ?? "",
      confirmedStudents: countMap[`${c._id}_${s._id}`] ?? 0,
      maxCapacity: s.maxCapacity,
    }))
  ).sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({ events });
}
