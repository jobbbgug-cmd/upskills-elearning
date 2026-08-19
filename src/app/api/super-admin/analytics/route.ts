import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Course from "@/models/Course";
import Booking from "@/models/Booking";
import Institution from "@/models/Institution";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Fetch all data in parallel
    const [users, courses, bookings, institutions] = await Promise.all([
      User.find({}),
      Course.find({ isActive: true }),
      Booking.find({}),
      Institution.find({ isActive: true }),
    ]);

    // Calculate metrics
    const totalUsers = users.length;
    const activeUsers = users.filter((u: any) => u.status === "approved").length;

    const totalCourses = courses.length;
    const activeCourses = courses.filter((c: any) => c.isActive).length;

    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter((b: any) => b.status === "confirmed").length;

    const totalRevenue = bookings
      .filter((b: any) => b.status === "confirmed")
      .reduce((sum: number, b: any) => {
        const course = courses.find((c: any) => c._id?.toString() === b.courseId?.toString());
        return sum + (course?.price || 0);
      }, 0);

    const totalInstitutions = institutions.length;

    // Users by role
    const usersByRole: Record<string, number> = {};
    users.forEach((u: any) => {
      const role = u.role || "unknown";
      usersByRole[role] = (usersByRole[role] || 0) + 1;
    });

    // Courses by type
    const coursesByType: Record<string, number> = {};
    courses.forEach((c: any) => {
      const type = c.type || "online";
      coursesByType[type] = (coursesByType[type] || 0) + 1;
    });

    // Bookings trend (last 7 days)
    const bookingsTrend: Array<{ date: string; count: number }> = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("th-TH");
      const count = bookings.filter((b: any) => {
        const bookingDate = b.createdAt ? new Date(b.createdAt) : null;
        return bookingDate?.toLocaleDateString("th-TH") === dateStr;
      }).length;
      bookingsTrend.push({ date: dateStr, count });
    }

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalCourses,
      activeCourses,
      totalBookings,
      confirmedBookings,
      totalRevenue: Math.round(totalRevenue),
      totalInstitutions,
      usersByRole,
      coursesByType,
      bookingsTrend,
    });
  } catch (error) {
    console.error("[analytics] Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}
