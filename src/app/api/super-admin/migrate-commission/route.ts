import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Institution from "@/models/Institution";
import Course from "@/models/Course";
import Booking from "@/models/Booking";

// One-time migration: backfill commissionAmount for confirmed bookings that have 0 stored.
// Safe to call multiple times — only touches bookings with commissionAmount = 0.
export async function POST() {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "super_admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const institutions = await Institution.find({}, { _id: 1, commissionRate: 1 }).lean() as Array<{ _id: unknown; commissionRate?: number }>;

  let totalUpdated = 0;

  for (const inst of institutions) {
    const rate = inst.commissionRate ?? 0;
    if (rate === 0) continue;

    const instId = (inst._id as { toString(): string }).toString();
    const courses = await Course.find({ institutionId: instId }, { _id: 1, price: 1 }).lean();
    if (!courses.length) continue;

    const priceMap = new Map(courses.map((c) => [(c._id as { toString(): string }).toString(), c.price as number]));
    const courseIds = courses.map((c) => c._id);

    const untracked = await Booking.find({
      institutionId: instId,
      courseId: { $in: courseIds },
      status: "confirmed",
      commissionAmount: 0,
    }, { _id: 1, courseId: 1 }).lean();

    if (!untracked.length) continue;

    const ops = untracked.map((b) => {
      const price = priceMap.get((b.courseId as { toString(): string }).toString()) ?? 0;
      return {
        updateOne: {
          filter: { _id: b._id },
          update: { $set: { commissionAmount: Math.round(price * rate / 100) } },
        },
      };
    });

    await Booking.bulkWrite(ops);
    totalUpdated += ops.length;
  }

  return NextResponse.json({ ok: true, updated: totalUpdated });
}
