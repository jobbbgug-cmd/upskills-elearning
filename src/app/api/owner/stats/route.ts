import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId } from "@/lib/tenant";
import User from "@/models/User";
import Course from "@/models/Course";
import Booking from "@/models/Booking";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);

    // Get stats for owner's institution
    const [totalUsers, totalCourses, totalBookings, activeBookings] = await Promise.all([
      User.countDocuments({ institutionId }),
      Course.countDocuments({ institutionId }),
      Booking.countDocuments({ institutionId }),
      Booking.countDocuments({ institutionId, status: "confirmed" }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalCourses,
      totalBookings,
      activeBookings,
      institutionId,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
