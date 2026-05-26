import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import Booking from "@/models/Booking";
import Course from "@/models/Course";

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "teacher")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();

    let count: number;
    if (auth.role === "admin") {
      count = await Booking.countDocuments({ status: "pending_payment" });
    } else {
      const teacherCourses = await Course.find({ instructorId: auth.userId }).select("_id");
      const courseIds = teacherCourses.map((c) => c._id);
      count = await Booking.countDocuments({ status: "pending_payment", courseId: { $in: courseIds } });
    }

    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
