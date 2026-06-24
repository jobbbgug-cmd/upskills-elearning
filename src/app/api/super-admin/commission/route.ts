import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Institution from "@/models/Institution";
import Booking from "@/models/Booking";
import Payout from "@/models/Payout";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const institutions = await Institution.find({ isActive: true })
    .select("_id name slug commissionRate plan")
    .lean() as unknown as Array<{ _id: { toString(): string }; name: string; slug: string; commissionRate: number; plan: string }>;

  // Commission aggregated per institution from confirmed bookings
  const commissionAgg = await Booking.aggregate([
    { $match: { status: "confirmed" } },
    { $lookup: { from: "courses", localField: "courseId", foreignField: "_id", as: "course" } },
    { $unwind: "$course" },
    {
      $group: {
        _id: "$institutionId",
        grossRevenue: { $sum: "$course.price" },
        totalCommission: { $sum: "$commissionAmount" },
        bookingCount: { $sum: 1 },
      },
    },
  ]);

  const commMap = new Map(
    commissionAgg.map((r) => [String(r._id ?? ""), r])
  );

  // Paid & pending payouts per institution
  const payoutAgg = await Payout.aggregate([
    { $group: {
      _id: { institutionId: "$institutionId", status: "$status" },
      total: { $sum: "$netPayout" },
    }},
  ]);
  const paidMap = new Map<string, number>();
  const pendingMap = new Map<string, number>();
  for (const r of payoutAgg) {
    const key = String(r._id.institutionId ?? "");
    if (r._id.status === "paid") paidMap.set(key, (paidMap.get(key) ?? 0) + r.total);
    if (r._id.status === "pending") pendingMap.set(key, (pendingMap.get(key) ?? 0) + r.total);
  }

  const result = institutions.map((inst) => {
    const id = inst._id.toString();
    const agg = commMap.get(id);
    const gross = agg?.grossRevenue ?? 0;
    const commission = gross * inst.commissionRate / 100;
    const net = gross - commission;
    const paid = paidMap.get(id) ?? 0;
    return {
      _id: id,
      name: inst.name,
      slug: inst.slug,
      plan: inst.plan,
      commissionRate: inst.commissionRate,
      grossRevenue: gross,
      totalCommission: commission,
      netPayout: net,
      paidNetPayout: paid,
      outstanding: Math.max(0, net - paid),
      bookingCount: agg?.bookingCount ?? 0,
      pendingNetPayout: pendingMap.get(id) ?? 0,
    };
  });

  const platformTotalCommission = result.reduce((s, r) => s + r.totalCommission, 0);
  const platformTotalGross = result.reduce((s, r) => s + r.grossRevenue, 0);
  const platformOutstanding = result.reduce((s, r) => s + r.outstanding, 0);

  return NextResponse.json({
    institutions: result,
    platformTotalCommission,
    platformTotalGross,
    platformOutstanding,
    platformNetRevenue: platformTotalCommission,
  });
}
