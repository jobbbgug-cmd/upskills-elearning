import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import Booking from "@/models/Booking";
import Institution from "@/models/Institution";
import Payout from "@/models/Payout";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth || (auth.role !== "admin" && auth.role !== "super_admin" && auth.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const institutionId = await resolveInstitutionId(req, auth.institutionId);
  const base = tenantFilter(institutionId);

  let commissionRate = 0;
  if (institutionId) {
    const inst = await Institution.findById(institutionId).select("commissionRate").lean() as { commissionRate?: number } | null;
    commissionRate = inst?.commissionRate ?? 0;
  }

  const courseFilter = auth.role === "teacher"
    ? { ...base, instructorId: auth.userId }
    : base;

  const courses = await Course.find(courseFilter, {
    _id: 1, title: 1, price: 1, instructor: 1, instructorId: 1, institutionId: 1, sessions: 1,
  }).lean();

  const courseIds = courses.map((c) => c._id);

  // Build per-institution commission rate map (handles super_admin "all institutions" view)
  const uniqueInstIds = [...new Set(
    courses.map((c) => (c.institutionId as { toString(): string } | undefined)?.toString()).filter(Boolean)
  )] as string[];
  let instRateMap = new Map<string, number>([[institutionId ?? "", commissionRate]]);
  if (uniqueInstIds.length > 0) {
    const insts = await Institution.find({ _id: { $in: uniqueInstIds } }).select("_id commissionRate").lean() as Array<{ _id: unknown; commissionRate?: number }>;
    instRateMap = new Map(insts.map((i) => [(i._id as { toString(): string }).toString(), i.commissionRate ?? 0]));
  }

  const bookings = await Booking.find(
    { ...base, courseId: { $in: courseIds } },
    { courseId: 1, status: 1, createdAt: 1, commissionAmount: 1 }
  ).lean();

  type BookingGroup = {
    confirmed: number; pending: number;
    storedCommission: number;              // sum of commissionAmount saved at confirm-time
    byMonth: Record<string, number>;
    byMonthCommission: Record<string, number>; // stored commission per month
  };
  const bookingMap: Record<string, BookingGroup> = {};

  for (const b of bookings) {
    const key = b.courseId.toString();
    if (!bookingMap[key]) bookingMap[key] = { confirmed: 0, pending: 0, storedCommission: 0, byMonth: {}, byMonthCommission: {} };
    if (b.status === "confirmed") {
      bookingMap[key].confirmed++;
      bookingMap[key].storedCommission += (b.commissionAmount as number) ?? 0;
      const month = new Date(b.createdAt).toISOString().slice(0, 7);
      bookingMap[key].byMonth[month] = (bookingMap[key].byMonth[month] ?? 0) + 1;
      bookingMap[key].byMonthCommission[month] = (bookingMap[key].byMonthCommission[month] ?? 0) + ((b.commissionAmount as number) ?? 0);
    } else if (b.status === "pending_payment") {
      bookingMap[key].pending++;
    }
  }

  const courseStats = courses.map((c) => {
    const id = (c._id as { toString(): string }).toString();
    const instIdStr = (c.institutionId as { toString(): string } | undefined)?.toString() ?? "";
    const stats = bookingMap[id] ?? { confirmed: 0, pending: 0, storedCommission: 0, byMonth: {}, byMonthCommission: {} };
    const courseRate = instRateMap.get(instIdStr) ?? commissionRate;
    const grossRevenue = stats.confirmed * c.price;
    const pendingGross = stats.pending * c.price;
    const commissionAmount = grossRevenue * courseRate / 100;
    const pendingCommission = pendingGross * courseRate / 100;
    return {
      _id: id,
      instId: instIdStr,
      title: c.title,
      instructor: c.instructor,
      instructorId: (c.instructorId as string) ?? "",
      price: c.price,
      confirmedBookings: stats.confirmed,
      pendingBookings: stats.pending,
      revenue: grossRevenue,
      commissionAmount,
      pendingRevenue: pendingGross,
      pendingCommission,
      commissionRate: courseRate,
      byMonth: stats.byMonth,
      byMonthCommission: stats.byMonthCommission,
    };
  });

  const monthlyMap: Record<string, { revenue: number; commission: number }> = {};
  for (const c of courseStats) {
    for (const [month, count] of Object.entries(c.byMonth)) {
      const monthRevenue = count * c.price;
      const monthCommission = c.byMonthCommission[month] ?? 0;
      if (!monthlyMap[month]) monthlyMap[month] = { revenue: 0, commission: 0 };
      monthlyMap[month].revenue += monthRevenue;
      monthlyMap[month].commission += monthCommission;
    }
  }
  const monthly = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { revenue, commission }]) => ({ month, revenue, commission }));

  const totalRevenue = courseStats.reduce((s, c) => s + c.revenue, 0);
  const totalCommissionAmount = courseStats.reduce((s, c) => s + c.commissionAmount, 0);
  const totalPending = courseStats.reduce((s, c) => s + c.pendingRevenue, 0);
  const totalPendingCommission = courseStats.reduce((s, c) => s + c.pendingCommission, 0);
  const totalConfirmed = courseStats.reduce((s, c) => s + c.confirmedBookings, 0);

  // Build net revenue per institution (only institutions that have confirmed bookings)
  const netByInst = new Map<string, number>();
  for (const c of courseStats) {
    if (c.revenue > 0 && c.instId) {
      netByInst.set(c.instId, (netByInst.get(c.instId) ?? 0) + (c.revenue - c.commissionAmount));
    }
  }

  // Outstanding / paid payout: sum only for institutions that have revenue in this view
  let outstanding = 0;
  let paidNetPayout = 0;
  const instIdsWithRevenue = institutionId ? [institutionId] : [...netByInst.keys()];
  if (instIdsWithRevenue.length > 0) {
    const objIds = instIdsWithRevenue.map((id) => new mongoose.Types.ObjectId(id));
    const payoutAgg = await Payout.aggregate([
      { $match: { institutionId: { $in: objIds } } },
      { $group: { _id: { institutionId: "$institutionId", status: "$status" }, total: { $sum: "$netPayout" } } },
    ]);
    const paidPerInst = new Map<string, number>();
    for (const r of payoutAgg) {
      if (r._id.status === "paid") {
        const key = String(r._id.institutionId ?? "");
        paidPerInst.set(key, (paidPerInst.get(key) ?? 0) + r.total);
      }
    }
    for (const [id, net] of netByInst) {
      const paid = paidPerInst.get(id) ?? 0;
      paidNetPayout += paid;
      outstanding += Math.max(0, net - paid);
    }
  }

  // Fetch payout records (with slip) for this institution's view
  let payoutHistory: { _id: string; netPayout: number; status: string; paidAt: string | null; periodLabel: string; slipUrl: string; note: string }[] = [];
  if (instIdsWithRevenue.length > 0) {
    const objIds = instIdsWithRevenue.map((id) => new mongoose.Types.ObjectId(id));
    const payouts = await Payout.find({ institutionId: { $in: objIds } }).sort({ createdAt: -1 }).lean();
    payoutHistory = payouts.map((p) => ({
      _id: (p._id as { toString(): string }).toString(),
      netPayout: p.netPayout,
      status: p.status,
      paidAt: p.paidAt ? new Date(p.paidAt).toISOString() : null,
      periodLabel: p.periodLabel,
      slipUrl: p.slipUrl ?? "",
      note: p.note ?? "",
    }));
  }

  let byTeacher = null;
  if (auth.role === "admin" || auth.role === "super_admin") {
    const teacherMap = new Map<string, { instructor: string; instructorId: string; courses: typeof courseStats }>();
    for (const c of courseStats) {
      const key = c.instructorId || c.instructor;
      if (!teacherMap.has(key)) teacherMap.set(key, { instructor: c.instructor, instructorId: c.instructorId, courses: [] });
      teacherMap.get(key)!.courses.push(c);
    }
    byTeacher = Array.from(teacherMap.values()).map((t) => ({
      instructor: t.instructor,
      instructorId: t.instructorId,
      courses: t.courses,
      totalRevenue: t.courses.reduce((s, c) => s + c.revenue, 0),
      totalConfirmed: t.courses.reduce((s, c) => s + c.confirmedBookings, 0),
      totalPending: t.courses.reduce((s, c) => s + c.pendingBookings, 0),
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  return NextResponse.json({
    role: auth.role,
    courseStats,
    monthly,
    totalRevenue,
    totalCommissionAmount,
    totalPending,
    totalPendingCommission,
    totalConfirmed,
    byTeacher,
    commissionRate,
    outstanding,
    paidNetPayout,
    payoutHistory,
  });
}
