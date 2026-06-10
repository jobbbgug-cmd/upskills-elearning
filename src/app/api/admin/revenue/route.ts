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
    _id: 1, title: 1, price: 1, instructor: 1, instructorId: 1, sessions: 1,
  }).lean();

  const courseIds = courses.map((c) => c._id);

  const bookings = await Booking.find(
    { courseId: { $in: courseIds } },
    { courseId: 1, status: 1, createdAt: 1 }
  ).lean();

  type BookingGroup = { confirmed: number; pending: number; byMonth: Record<string, number> };
  const bookingMap: Record<string, BookingGroup> = {};

  for (const b of bookings) {
    const key = b.courseId.toString();
    if (!bookingMap[key]) bookingMap[key] = { confirmed: 0, pending: 0, byMonth: {} };
    if (b.status === "confirmed") {
      bookingMap[key].confirmed++;
      const month = new Date(b.createdAt).toISOString().slice(0, 7);
      bookingMap[key].byMonth[month] = (bookingMap[key].byMonth[month] ?? 0) + 1;
    } else if (b.status === "pending_payment") {
      bookingMap[key].pending++;
    }
  }

  const courseStats = courses.map((c) => {
    const id = (c._id as { toString(): string }).toString();
    const stats = bookingMap[id] ?? { confirmed: 0, pending: 0, byMonth: {} };
    return {
      _id: id,
      title: c.title,
      instructor: c.instructor,
      instructorId: (c.instructorId as string) ?? "",
      price: c.price,
      confirmedBookings: stats.confirmed,
      pendingBookings: stats.pending,
      revenue: stats.confirmed * c.price,
      pendingRevenue: stats.pending * c.price,
      byMonth: stats.byMonth,
    };
  });

  // Monthly totals
  const monthlyMap: Record<string, number> = {};
  for (const c of courseStats) {
    for (const [month, count] of Object.entries(c.byMonth)) {
      monthlyMap[month] = (monthlyMap[month] ?? 0) + count * c.price;
    }
  }
  const monthly = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue }));

  const totalRevenue = courseStats.reduce((s, c) => s + c.revenue, 0);
  const totalPending = courseStats.reduce((s, c) => s + c.pendingRevenue, 0);
  const totalConfirmed = courseStats.reduce((s, c) => s + c.confirmedBookings, 0);

  // Admin: group by teacher
  let byTeacher = null;
  if (auth.role === "admin") {
    const teacherMap = new Map<string, { instructor: string; instructorId: string; courses: typeof courseStats }>();
    for (const c of courseStats) {
      const key = c.instructorId || c.instructor;
      if (!teacherMap.has(key)) teacherMap.set(key, { instructor: c.instructor, instructorId: c.instructorId, courses: [] });
      teacherMap.get(key)!.courses.push(c);
    }
    byTeacher = Array.from(teacherMap.values()).map((t) => ({
      instructor: t.instructor,
      instructorId: t.instructorId,
      courses: t.courses,
      totalRevenue: t.courses.reduce((s, c) => s + c.revenue, 0),
      totalConfirmed: t.courses.reduce((s, c) => s + c.confirmedBookings, 0),
      totalPending: t.courses.reduce((s, c) => s + c.pendingBookings, 0),
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  return NextResponse.json({
    role: auth.role,
    courseStats,
    monthly,
    totalRevenue,
    totalPending,
    totalConfirmed,
    byTeacher,
  });
}
