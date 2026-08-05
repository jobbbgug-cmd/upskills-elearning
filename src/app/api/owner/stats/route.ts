import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
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
    const [totalStudents, totalCourses, totalBookings] = await Promise.all([
      User.countDocuments({ institutionId, role: "student" }),
      Course.countDocuments({ institutionId }),
      Booking.countDocuments({ institutionId }),
    ]);

    // Calculate total revenue (sum of booking amounts)
    const bookingStats = await Booking.aggregate([
      { $match: { institutionId: institutionId ? new ObjectId(institutionId) : null } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = bookingStats[0]?.total || 0;

    return NextResponse.json({
      totalRevenue,
      totalStudents,
      totalCourses,
      totalBookings,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
