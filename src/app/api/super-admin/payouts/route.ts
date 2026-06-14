import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Payout from "@/models/Payout";
import Institution from "@/models/Institution";
import Booking from "@/models/Booking";
import Course from "@/models/Course";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const payouts = await Payout.find()
    .populate("institutionId", "name slug")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(JSON.parse(JSON.stringify(payouts)));
}

// Create payout record for an institution for a specific period
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { institutionId, periodLabel } = await req.json();
  if (!institutionId || !periodLabel) {
    return NextResponse.json({ error: "กรุณาระบุ institutionId และ periodLabel" }, { status: 400 });
  }

  await connectDB();

  const institution = await Institution.findById(institutionId)
    .select("commissionRate name")
    .lean() as { commissionRate: number; name: string } | null;
  if (!institution) return NextResponse.json({ error: "ไม่พบสถาบัน" }, { status: 404 });

  // Get all confirmed bookings for this institution in the period (YYYY-MM)
  const [year, month] = periodLabel.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const bookings = await Booking.find({
    institutionId,
    status: "confirmed",
    createdAt: { $gte: start, $lt: end },
  }).lean();

  const courseIds = [...new Set(bookings.map((b) => b.courseId.toString()))];
  const courses = await Course.find({ _id: { $in: courseIds } }).select("_id price").lean() as unknown as Array<{
    _id: { toString(): string };
    price: number;
  }>;
  const priceMap = new Map(courses.map((c) => [c._id.toString(), c.price]));

  const grossRevenue = bookings.reduce((s, b) => s + (priceMap.get(b.courseId.toString()) ?? 0), 0);
  const commissionAmount = Math.round(grossRevenue * (institution.commissionRate / 100) * 100) / 100;
  const netPayout = grossRevenue - commissionAmount;

  const payout = await Payout.findOneAndUpdate(
    { institutionId, periodLabel },
    {
      institutionId,
      periodLabel,
      grossRevenue,
      commissionRate: institution.commissionRate,
      commissionAmount,
      netPayout,
      confirmedBookings: bookings.length,
    },
    { new: true, upsert: true }
  );

  return NextResponse.json(JSON.parse(JSON.stringify(payout)), { status: 201 });
}
