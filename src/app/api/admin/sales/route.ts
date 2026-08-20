import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Course from "@/models/Course";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "teacher" && auth.role !== "teacher-online" && auth.role !== "teacher_online")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    let filter: Record<string, unknown> = { type: "course" };

    // If teacher, only show sales for their courses
    if (auth.role === "teacher" || auth.role === "teacher-online" || auth.role === "teacher_online") {
      const teacherCourses = await Course.find({ createdBy: auth.userId }).select("_id").lean();
      const courseIds = teacherCourses.map(c => c._id);
      filter.courseId = { $in: courseIds };
    }

    const orders = await Order.find(filter)
      .populate("courseId", "title price originalPrice")
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ orders: JSON.parse(JSON.stringify(orders)) });
  } catch (error) {
    console.error("Failed to fetch sales:", error);
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
  }
}
