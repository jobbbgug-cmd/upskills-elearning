import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import Booking from "@/models/Booking";
import Course from "@/models/Course";
import Institution from "@/models/Institution";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "super_admin" && auth.role !== "admin"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { action } = await req.json();
    if (!["approve", "reject"].includes(action))
      return NextResponse.json({ error: "action ไม่ถูกต้อง" }, { status: 400 });

    await connectDB();
    const { id } = await params;
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const filter = auth.role === "admin" ? { _id: id, ...tenantFilter(institutionId) } : { _id: id };
    const booking = await Booking.findOne(filter);
    if (!booking) return NextResponse.json({ error: "ไม่พบการจอง" }, { status: 404 });

    booking.status = action === "approve" ? "confirmed" : "rejected";

    if (action === "approve") {
      const instId = booking.institutionId;
      const [course, institution] = await Promise.all([
        Course.findById(booking.courseId).select("price").lean() as Promise<{ price: number } | null>,
        instId ? Institution.findById(instId).select("commissionRate").lean() as Promise<{ commissionRate: number } | null> : Promise.resolve(null),
      ]);
      if (course) {
        const rate = institution?.commissionRate ?? 0;
        // Lock commission at current rate — this value will never change retroactively
        booking.commissionAmount = Math.round(course.price * rate / 100);
      }
    }

    await booking.save();
    return NextResponse.json({ status: booking.status, commissionAmount: booking.commissionAmount });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
