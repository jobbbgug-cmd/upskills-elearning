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

  // Teacher sees only their courses; admin sees all
  const courseFilter = auth.role === "teacher" ? { instructorId: auth.userId } : {};
  const courses = await Course.find(courseFilter, {
    _id: 1, title: 1, price: 1, instructor: 1, instructorId: 1, sessions: 1,
  }).lean();

  const courseIds = courses.map((c) => c._id);

  const bookings = await Booking.find(
    { courseId: { $in: courseIds } },
    { courseId: 1, sessionId: 1, status: 1, createdAt: 1 }
  ).lean();

  // Group bookings by courseId
  type BookingGroup = { confirmed: number; pending: number; cancelled: number; byMonth: Record<string, number> };
  const bookingMap: Record<string, BookingGroup> = {};

  for (const b of bookings) {
    const key = b.courseId.toString();
    if (!bookingMap[key]) bookingMap[key] = { confirmed: 0, pending: 0, cancelled: 0, byMonth: {} };
    if (b.status === "confirmed") {
      bookingMap[key].confirmed++;
      const month = new Date(b.createdAt).toISOString().slice(0, 7); // "2025-06"
      bookingMap[key].byMonth[month] = (bookingMap[key].byMonth[month] ?? 0) + 1;
    } else if (b.status === "pending_payment") {
      bookingMap[key].pending++;
    } else {
      bookingMap[key].cancelled++;
    }
  }

  const courseStats = courses.map((c) => {
    const id = (c._id as { toString(): string }).toString();
    const stats = bookingMap[id] ?? { confirmed: 0, pending: 0, cancelled: 0, byMonth: {} };
    const revenue = stats.confirmed * c.price;
    const pendingRevenue = stats.pending * c.price;
    return {
      _id: id,
      title: c.title,
      instructor: c.instructor,
      price: c.price,
      confirmedBookings: stats.confirmed,
      pendingBookings: stats.pending,
      revenue,
      pendingRevenue,
      byMonth: stats.byMonth,
    };
  });

  // Aggregate monthly totals
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

  return NextResponse.json({ courseStats, monthly, totalRevenue, totalPending, totalConfirmed });
}
