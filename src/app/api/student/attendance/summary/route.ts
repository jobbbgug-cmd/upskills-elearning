import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import Attendance from "@/models/Attendance";
import Course from "@/models/Course";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "student" && auth.role !== "parent")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get courses for user's institution only
    const courseFilter: any = { isActive: true };
    if (auth.institutionId) {
      courseFilter.institutionId = auth.institutionId;
    }
    const courses = await Course.find(courseFilter).select("_id title").lean();

    const summary = await Promise.all(
      courses.map(async (course: any) => {
        // Get all attendance records for this course
        const allRecords = await Attendance.find({ courseId: course._id }).lean();

        // Get student's attendance
        const present = allRecords.filter(
          (r: any) => r.studentId.toString() === auth.userId
        ).length;

        const total = allRecords.length > 0 ? allRecords.length : 1; // Avoid division by zero
        const percentage = Math.round((present / total) * 100);

        return {
          courseId: course._id,
          courseName: course.title,
          total,
          present,
          percentage,
        };
      })
    );

    return NextResponse.json(summary);
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
