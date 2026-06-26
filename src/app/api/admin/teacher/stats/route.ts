import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import Course from "@/models/Course";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { HomeworkSubmission } from "@/models/Homework";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "teacher" && auth.role !== "admin" && auth.role !== "super_admin"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);

    // Teacher's own courses
    const courseFilter: Record<string, unknown> = { ...tenantFilter(institutionId) };
    if (auth.role === "teacher") courseFilter.instructorId = auth.userId;
    const courses = await Course.find(courseFilter).select("_id title price isActive").lean() as unknown as { _id: mongoose.Types.ObjectId; title: string; price: number; isActive: boolean }[];
    const courseIds = courses.map((c) => c._id);

    // Stats
    const [enrollments, pendingHw, upcomingSchedule] = await Promise.all([
      Booking.aggregate([
        { $match: { courseId: { $in: courseIds }, status: "confirmed" } },
        { $group: { _id: "$courseId", count: { $sum: 1 } } },
      ]),
      HomeworkSubmission.find({ courseId: { $in: courseIds }, status: "submitted" })
        .populate({ path: "homeworkId", select: "title courseId" })
        .sort({ submittedAt: -1 })
        .limit(20)
        .lean(),
      Promise.resolve([]), // Schedule comes from course sessions
    ]);

    const enrollMap = Object.fromEntries(enrollments.map((e: { _id: { toString(): string }; count: number }) => [e._id.toString(), e.count]));
    const totalStudents = enrollments.reduce((s: number, e: { count: number }) => s + e.count, 0);
    const totalRevenue = courses.reduce((s, c) => s + (c.price * (enrollMap[c._id.toString()] ?? 0)), 0);

    const courseStats = courses.map((c) => ({
      _id:      c._id.toString(),
      title:    c.title,
      price:    c.price,
      isActive: c.isActive,
      enrolled: enrollMap[c._id.toString()] ?? 0,
    }));

    return NextResponse.json({
      totalCourses:  courses.length,
      activeCourses: courses.filter((c) => c.isActive).length,
      totalStudents,
      totalRevenue,
      courseStats,
      pendingHomework: JSON.parse(JSON.stringify(pendingHw)),
    });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
