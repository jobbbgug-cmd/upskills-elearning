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
    if (!auth || (auth.role !== "admin" && auth.role !== "teacher"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { action } = await req.json();
    if (!["approve", "reject"].includes(action))
      return NextResponse.json({ error: "action ไม่ถูกต้อง" }, { status: 400 });

    await connectDB();
    const { id } = await params;
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const booking = await Booking.findOne({ _id: id, ...tenantFilter(institutionId) });
    if (!booking) return NextResponse.json({ error: "ไม่พบการจอง" }, { status: 404 });

    booking.status = action === "approve" ? "confirmed" : "rejected";

    // Calculate commission when approving
    if (action === "approve" && institutionId) {
      const [course, institution] = await Promise.all([
        Course.findById(booking.courseId).select("price").lean() as Promise<{ price: number } | null>,
        Institution.findById(institutionId).select("commissionRate").lean() as Promise<{ commissionRate: number } | null>,
      ]);
      if (course && institution) {
        booking.commissionAmount = Math.round(course.price * (institution.commissionRate / 100) * 100) / 100;
      }
    }

    await booking.save();
    return NextResponse.json({ status: booking.status, commissionAmount: booking.commissionAmount });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
