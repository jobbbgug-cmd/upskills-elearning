import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Institution from "@/models/Institution";
import Course from "@/models/Course";
import Booking from "@/models/Booking";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const { id } = await params;
  const { plan, planExpiresAt, isActive, commissionRate, name } = await req.json();

  // If commission rate is being changed, lock all untracked confirmed bookings
  // to the OLD rate before saving the new one — so historical figures never change
  if (commissionRate !== undefined) {
    const current = await Institution.findById(id).select("commissionRate").lean() as { commissionRate?: number } | null;
    const oldRate: number = current?.commissionRate ?? 0;

    if (oldRate > 0) {
      // Find all courses of this institution
      const courses = await Course.find({ institutionId: id }, { _id: 1, price: 1 }).lean();
      const courseIds = courses.map((c) => c._id);
      const priceMap = new Map(courses.map((c) => [(c._id as { toString(): string }).toString(), c.price as number]));

      // Find confirmed bookings with no stored commission
      const untracked = await Booking.find({
        institutionId: id,
        courseId: { $in: courseIds },
        status: "confirmed",
        commissionAmount: 0,
      }).lean();

      // Bulk-write: set commissionAmount based on old rate
      if (untracked.length > 0) {
        const ops = untracked.map((b) => {
          const price = priceMap.get((b.courseId as { toString(): string }).toString()) ?? 0;
          return {
            updateOne: {
              filter: { _id: b._id },
              update: { $set: { commissionAmount: Math.round(price * oldRate / 100) } },
            },
          };
        });
        await Booking.bulkWrite(ops);
      }
    }
  }

  const update: Record<string, unknown> = {};
  if (name) update.name = name;
  if (plan) update.plan = plan;
  if (planExpiresAt !== undefined) update.planExpiresAt = planExpiresAt ? new Date(planExpiresAt) : null;
  if (isActive !== undefined) update.isActive = isActive;
  if (commissionRate !== undefined) update.commissionRate = commissionRate;

  const institution = await Institution.findByIdAndUpdate(id, update, { new: true });
  if (!institution) return NextResponse.json({ error: "ไม่พบสถาบัน" }, { status: 404 });

  return NextResponse.json(JSON.parse(JSON.stringify(institution)));
}
