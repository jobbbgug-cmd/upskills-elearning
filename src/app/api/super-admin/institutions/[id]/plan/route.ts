import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Institution from "@/models/Institution";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const { id } = await params;
  const { plan, planExpiresAt, isActive, commissionRate } = await req.json();

  const update: Record<string, unknown> = {};
  if (plan) update.plan = plan;
  if (planExpiresAt !== undefined) update.planExpiresAt = planExpiresAt ? new Date(planExpiresAt) : null;
  if (isActive !== undefined) update.isActive = isActive;
  if (commissionRate !== undefined) update.commissionRate = commissionRate;

  const institution = await Institution.findByIdAndUpdate(id, update, { new: true });
  if (!institution) return NextResponse.json({ error: "ไม่พบสถาบัน" }, { status: 404 });

  return NextResponse.json(JSON.parse(JSON.stringify(institution)));
}
