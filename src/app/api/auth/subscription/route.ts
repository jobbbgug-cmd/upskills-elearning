import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Institution from "@/models/Institution";
import { PLAN_LABELS } from "@/lib/planLimits";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!auth.institutionId) return NextResponse.json({ plan: null });

  await connectDB();
  const inst = await Institution.findById(auth.institutionId)
    .select("plan planExpiresAt isActive name slug")
    .lean() as {
      plan: string;
      planExpiresAt: Date | null;
      isActive: boolean;
      name: string;
      slug: string;
    } | null;

  if (!inst) return NextResponse.json({ plan: null });

  const now = new Date();
  const isExpired = inst.planExpiresAt ? inst.planExpiresAt < now : false;
  const daysLeft = inst.planExpiresAt
    ? Math.max(0, Math.ceil((inst.planExpiresAt.getTime() - now.getTime()) / 86400000))
    : null;

  return NextResponse.json({
    plan: inst.plan,
    planLabel: PLAN_LABELS[inst.plan] ?? inst.plan,
    planExpiresAt: inst.planExpiresAt?.toISOString() ?? null,
    isActive: inst.isActive,
    isExpired,
    daysLeft,
    institutionName: inst.name,
  });
}
