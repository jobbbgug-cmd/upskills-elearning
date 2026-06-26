import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Institution from "@/models/Institution";
import User from "@/models/User";
import Booking from "@/models/Booking";
import mongoose from "mongoose";

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();

    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [monthlyRevenue, topInstitutions, expiringPlans, newUsersPerMonth] = await Promise.all([
      // Monthly revenue (last 6 months)
      Booking.aggregate([
        { $match: { status: "confirmed", createdAt: { $gte: sixMonthsAgo } } },
        { $lookup: { from: "courses", localField: "courseId", foreignField: "_id", as: "course" } },
        { $unwind: "$course" },
        { $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: { $sum: "$course.price" },
          count:   { $sum: 1 },
        }},
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]) as unknown as { _id: { year: number; month: number }; revenue: number; count: number }[],

      // Top 5 institutions by confirmed bookings revenue
      Booking.aggregate([
        { $match: { status: "confirmed" } },
        { $lookup: { from: "courses", localField: "courseId", foreignField: "_id", as: "course" } },
        { $unwind: "$course" },
        { $group: {
          _id: "$institutionId",
          revenue:  { $sum: "$course.price" },
          bookings: { $sum: 1 },
        }},
        { $sort: { revenue: -1 } },
        { $limit: 5 },
        { $lookup: { from: "institutions", localField: "_id", foreignField: "_id", as: "institution" } },
        { $unwind: { path: "$institution", preserveNullAndEmptyArrays: true } },
        { $project: { name: "$institution.name", slug: "$institution.slug", plan: "$institution.plan", revenue: 1, bookings: 1 } },
      ]) as unknown as { _id: mongoose.Types.ObjectId; name: string; slug: string; plan: string; revenue: number; bookings: number }[],

      // Institutions with plans expiring in next 30 days
      Institution.find({
        planExpiresAt: { $gte: now, $lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) },
        isActive: true,
      }).select("name slug plan planExpiresAt").lean() as unknown as Promise<{
        _id: mongoose.Types.ObjectId; name: string; slug: string; plan: string; planExpiresAt: Date;
      }[]>,

      // New users per month (last 6 months)
      User.aggregate([
        { $match: { role: { $ne: "super_admin" }, createdAt: { $gte: sixMonthsAgo } } },
        { $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        }},
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]) as unknown as { _id: { year: number; month: number }; count: number }[],
    ]);

    const MONTH_TH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

    const revenueChart = monthlyRevenue.map((m) => ({
      label: `${MONTH_TH[m._id.month - 1]} ${m._id.year}`,
      revenue: m.revenue,
      count: m.count,
    }));

    const usersChart = newUsersPerMonth.map((m) => ({
      label: `${MONTH_TH[m._id.month - 1]} ${m._id.year}`,
      count: m.count,
    }));

    return NextResponse.json({
      revenueChart,
      usersChart,
      topInstitutions: JSON.parse(JSON.stringify(topInstitutions)),
      expiringPlans:   JSON.parse(JSON.stringify(expiringPlans)),
    });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
