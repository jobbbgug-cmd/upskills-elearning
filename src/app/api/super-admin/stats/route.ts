import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Institution from "@/models/Institution";
import User from "@/models/User";
import Course from "@/models/Course";
import Booking from "@/models/Booking";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const [
    totalInstitutions,
    activeInstitutions,
    totalUsers,
    totalCourses,
    totalConfirmed,
    totalPending,
  ] = await Promise.all([
    Institution.countDocuments(),
    Institution.countDocuments({ isActive: true }),
    User.countDocuments({ role: { $ne: "super_admin" } }),
    Course.countDocuments(),
    Booking.countDocuments({ status: "confirmed" }),
    Booking.countDocuments({ status: "pending_payment" }),
  ]);

  // Platform-wide revenue
  const revenuePipeline = await Booking.aggregate([
    { $match: { status: "confirmed" } },
    { $lookup: { from: "courses", localField: "courseId", foreignField: "_id", as: "course" } },
    { $unwind: "$course" },
    { $group: { _id: null, total: { $sum: "$course.price" } } },
  ]);
  const totalRevenue = revenuePipeline[0]?.total ?? 0;

  // By plan
  const byPlan = await Institution.aggregate([
    { $group: { _id: "$plan", count: { $sum: 1 } } },
  ]);
  const planCounts: Record<string, number> = {};
  byPlan.forEach((p) => { planCounts[p._id] = p.count; });

  return NextResponse.json({
    totalInstitutions,
    activeInstitutions,
    totalUsers,
    totalCourses,
    totalConfirmed,
    totalPending,
    totalRevenue,
    planCounts,
  });
}
