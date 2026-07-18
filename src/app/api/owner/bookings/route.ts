import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId } from "@/lib/tenant";
import Booking from "@/models/Booking";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || !["admin", "owner", "super_admin"].includes(auth.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);

    const filter: Record<string, unknown> = {};
    if (institutionId) filter.institutionId = institutionId;

    const bookings = await Booking.find(filter)
      .populate("userId", "name email gradeLevel")
      .populate("courseId", "title sessions institutionId")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ bookings: JSON.parse(JSON.stringify(bookings)) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
