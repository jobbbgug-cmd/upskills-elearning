import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Institution from "@/models/Institution";
import Booking from "@/models/Booking";
import { PLAN_LABELS } from "@/lib/planLimits";
import { tenantFilter } from "@/lib/tenant";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const [pendingCount, me, institution, pendingBookings] = await Promise.all([
    User.countDocuments({ ...tenantFilter(auth.institutionId), status: "pending" }),
    User.findById(auth.userId)
      .select("name email profileImage role institutionId")
      .populate("institutionId", "name")
      .lean(),
    auth.institutionId
      ? Institution.findById(auth.institutionId)
          .select("plan planExpiresAt isActive name logoUrl")
          .lean() as Promise<{ plan: string; planExpiresAt: Date | null; isActive: boolean; name: string; logoUrl?: string } | null>
      : Promise.resolve(null),
    auth.role === "super_admin"
      ? Booking.countDocuments({ status: "pending_payment" })
      : Promise.resolve(0),
  ]);

  const now = new Date();

  return NextResponse.json({
    pendingCount,
    pendingBookings,
    user: me,
    logoUrl: institution?.logoUrl ?? null,
    subscription: institution
      ? {
          plan: institution.plan,
          planLabel: PLAN_LABELS[institution.plan] ?? institution.plan,
          planExpiresAt: institution.planExpiresAt?.toISOString() ?? null,
          isActive: institution.isActive,
          isExpired: institution.planExpiresAt ? institution.planExpiresAt < now : false,
          daysLeft: institution.planExpiresAt
            ? Math.max(0, Math.ceil((institution.planExpiresAt.getTime() - now.getTime()) / 86400000))
            : null,
        }
      : null,
  });
}
