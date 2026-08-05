import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Institution from "@/models/Institution";
import User from "@/models/User";
import Course from "@/models/Course";
import Booking from "@/models/Booking";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const parentId = req.nextUrl.searchParams.get("parentId");

  let institutions;
  if (parentId) {
    // Get branches of a parent institution
    institutions = await Institution.find({ parentId }).sort({ createdAt: -1 }).lean();
  } else {
    // Get all parent institutions (no parentId)
    institutions = await Institution.find({ parentId: null }).sort({ createdAt: -1 }).lean();
  }

  // Batch-fetch stats per institution
  const ids = institutions.map((i) => i._id);

  const [userCounts, courseCounts, bookingStats] = await Promise.all([
    User.aggregate([
      { $match: { institutionId: { $in: ids }, role: { $ne: "super_admin" } } },
      { $group: { _id: "$institutionId", count: { $sum: 1 } } },
    ]),
    Course.aggregate([
      { $match: { institutionId: { $in: ids } } },
      { $group: { _id: "$institutionId", count: { $sum: 1 } } },
    ]),
    Booking.aggregate([
      { $match: { institutionId: { $in: ids }, status: "confirmed" } },
      { $lookup: { from: "courses", localField: "courseId", foreignField: "_id", as: "course" } },
      { $unwind: "$course" },
      { $group: { _id: "$institutionId", revenue: { $sum: "$course.price" }, bookings: { $sum: 1 } } },
    ]),
  ]);

  const toMap = (arr: { _id: unknown; count?: number; revenue?: number; bookings?: number }[]) => {
    const m = new Map<string, typeof arr[0]>();
    arr.forEach((x) => m.set(String(x._id ?? ""), x));
    return m;
  };

  const uMap = toMap(userCounts);
  const cMap = toMap(courseCounts);
  const bMap = toMap(bookingStats);

  const result = institutions.map((inst) => {
    const id = String(inst._id ?? "");
    return {
      ...inst,
      _id: id,
      stats: {
        users: uMap.get(id)?.count ?? 0,
        courses: cMap.get(id)?.count ?? 0,
        revenue: bMap.get(id)?.revenue ?? 0,
        bookings: bMap.get(id)?.bookings ?? 0,
      },
    };
  });

  return NextResponse.json(JSON.parse(JSON.stringify(result)));
}
