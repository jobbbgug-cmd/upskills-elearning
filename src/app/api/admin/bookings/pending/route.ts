import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import Booking from "@/models/Booking";
import Course from "@/models/Course";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "teacher")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const base = tenantFilter(institutionId);

    let count: number;
    if (auth.role === "admin") {
      count = await Booking.countDocuments({ ...base, status: "pending_payment" });
    } else {
      const teacherCourses = await Course.find({ ...base, instructorId: auth.userId }).select("_id");
      const courseIds = teacherCourses.map((c) => c._id);
      count = await Booking.countDocuments({
        ...base,
        status: "pending_payment",
        courseId: { $in: courseIds },
      });
    }

    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
