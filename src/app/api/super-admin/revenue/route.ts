import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Course from "@/models/Course";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Fetch all bookings
    const bookings = await Booking.find({}).populate("courseId", "title price instructor");

    // Calculate statistics
    let totalRevenue = 0;
    let totalCommissionAmount = 0;
    let totalPending = 0;
    let totalConfirmed = 0;
    const courseStatsMap: Record<string, any> = {};
    const teacherMap: Record<string, any> = {};
    const monthlyMap: Record<string, any> = {};

    bookings.forEach((booking: any) => {
      const course = booking.courseId;
      if (!course) return;

      const courseId = course._id?.toString() || "";
      const price = course.price || 0;
      const instructor = course.instructor || "Unknown";
      const status = booking.status || "pending";
      const commissionRate = 0.15; // 15% default commission

      if (status === "confirmed") {
        totalRevenue += price;
        totalConfirmed += 1;

        // Course stats
        if (!courseStatsMap[courseId]) {
          courseStatsMap[courseId] = {
            _id: courseId,
            title: course.title || "Unknown",
            instructor: instructor,
            price: price,
            confirmedBookings: 0,
            revenue: 0,
            commissionAmount: 0,
            commissionRate: commissionRate,
          };
        }
        courseStatsMap[courseId].confirmedBookings += 1;
        courseStatsMap[courseId].revenue += price;
        courseStatsMap[courseId].commissionAmount += price * commissionRate;

        // Teacher stats
        if (!teacherMap[instructor]) {
          teacherMap[instructor] = {
            instructor: instructor,
            totalRevenue: 0,
            totalConfirmed: 0,
          };
        }
        teacherMap[instructor].totalRevenue += price;
        teacherMap[instructor].totalConfirmed += 1;

        // Monthly stats
        const bookingDate = booking.createdAt ? new Date(booking.createdAt) : new Date();
        const monthKey = bookingDate.toLocaleDateString("th-TH", { year: "numeric", month: "long" });
        if (!monthlyMap[monthKey]) {
          monthlyMap[monthKey] = {
            month: monthKey,
            revenue: 0,
            commission: 0,
          };
        }
        monthlyMap[monthKey].revenue += price;
        monthlyMap[monthKey].commission += price * commissionRate;

        totalCommissionAmount += price * commissionRate;
      } else if (status === "pending_payment") {
        totalPending += price;
      }
    });

    const response = {
      role: "super_admin",
      courseStats: Object.values(courseStatsMap),
      monthly: Object.values(monthlyMap),
      totalRevenue: totalRevenue,
      totalCommissionAmount: Math.round(totalCommissionAmount),
      totalPending: totalPending,
      totalConfirmed: totalConfirmed,
      byTeacher: Object.values(teacherMap),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[revenue] Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}
