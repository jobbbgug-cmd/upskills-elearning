import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import Booking from "@/models/Booking";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin") {
      return NextResponse.json({ count: 0 });
    }
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const base = tenantFilter(institutionId);
    const count = await Booking.countDocuments({ ...base, status: "pending_payment" });

    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
