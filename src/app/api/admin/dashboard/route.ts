import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Course from "@/models/Course";
import User from "@/models/User";
import Institution from "@/models/Institution";
import mongoose from "mongoose";

const MONTH_TH = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth || (auth.role !== "admin" && auth.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const branchId = req.nextUrl.searchParams.get("branchId") ?? "";

  // Resolve institution IDs
  let institutionIds: mongoose.Types.ObjectId[] = [];
  let commissionRate = 0;

  if (auth.institutionId) {
    if (auth.role === "owner" && branchId === "all") {
      const children = await Institution.find({ parentId: auth.institutionId }).select("_id").lean() as { _id: mongoose.Types.ObjectId }[];
      institutionIds = [new mongoose.Types.ObjectId(auth.institutionId), ...children.map((c) => c._id)];
    } else if (auth.role === "owner" && branchId && branchId !== auth.institutionId) {
      institutionIds = [new mongoose.Types.ObjectId(branchId)];
    } else {
      institutionIds = [new mongoose.Types.ObjectId(auth.institutionId)];
    }

    const inst = await Institution.findById(institutionIds[0]).select("commissionRate").lean() as { commissionRate?: number } | null;
    commissionRate = inst?.commissionRate ?? 0;
  }

  const tenantClause = institutionIds.length > 0 ? { institutionId: { $in: institutionIds } } : {};
  const courses = await Course.find(tenantClause).select("_id price title").lean() as unknown as { _id: mongoose.Types.ObjectId; price: number; title: string }[];
  const courseIds = courses.map((c) => c._id);

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  // Monthly revenue + bookings (confirmed) — last 6 months
  const [monthlyRevData, monthlyStudentData, topCoursesData] = await Promise.all([
    Booking.aggregate([
      { $match: { status: "confirmed", courseId: { $in: courseIds }, createdAt: { $gte: sixMonthsAgo } } },
      { $lookup: { from: "courses", localField: "courseId", foreignField: "_id", as: "course" } },
      { $unwind: "$course" },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, revenue: { $sum: "$course.price" }, bookings: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),

    User.aggregate([
      { $match: { role: "student", status: "approved", ...tenantClause, createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),

    Booking.aggregate([
      { $match: { status: "confirmed", courseId: { $in: courseIds } } },
      { $group: { _id: "$courseId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]),
  ]);

  // Build 6-month axis
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1, label: MONTH_TH[d.getMonth()] };
  });

  const monthlyRevenue = months.map((m) => {
    const found = monthlyRevData.find((r: { _id: { year: number; month: number }; revenue: number; bookings: number }) => r._id.year === m.year && r._id.month === m.month);
    return {
      month: m.label,
      revenue: Math.round((found?.revenue ?? 0) * (1 - commissionRate / 100)),
      bookings: found?.bookings ?? 0,
    };
  });

  const monthlyStudents = months.map((m) => {
    const found = monthlyStudentData.find((r: { _id: { year: number; month: number }; count: number }) => r._id.year === m.year && r._id.month === m.month);
    return { month: m.label, count: found?.count ?? 0 };
  });

  // Fetch course titles
  const courseMap = new Map(courses.map((c) => [c._id.toString(), c.title]));
  const topCourses = topCoursesData.map((t: { _id: mongoose.Types.ObjectId; count: number }) => ({
    title: courseMap.get(t._id.toString()) ?? "ไม่ทราบชื่อ",
    count: t.count,
  }));

  return NextResponse.json({ monthlyRevenue, monthlyStudents, topCourses });
}
