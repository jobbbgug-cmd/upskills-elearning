import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { tenantFilter, resolveInstitutionId } from "@/lib/tenant";
import Booking from "@/models/Booking";
import Course from "@/models/Course";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

    const { id } = await params;
    await connectDB();

    const institutionId = await resolveInstitutionId(_req, auth.institutionId);

    const booking = await Booking.findOne({ _id: id, ...tenantFilter(institutionId) });
    if (!booking) return NextResponse.json({ error: "ไม่พบการจอง" }, { status: 404 });
    if (booking.userId.toString() !== auth.userId)
      return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
    if (booking.status === "confirmed")
      return NextResponse.json({ error: "ไม่สามารถยกเลิกการจองที่อนุมัติแล้วได้" }, { status: 400 });
    if (booking.status === "cancelled")
      return NextResponse.json({ error: "การจองนี้ถูกยกเลิกแล้ว" }, { status: 400 });

    booking.status = "cancelled";
    await booking.save();

    const course = await Course.findById(booking.courseId);
    if (course) {
      const session = course.sessions.id(booking.sessionId.toString());
      if (session && booking.seatNumber) {
        session.bookedSeats = (session.bookedSeats ?? []).filter(
          (s: number) => s !== booking.seatNumber
        );
        session.bookedCount = session.bookedSeats.length;
        await course.save();
      }
    }

    return NextResponse.json({ message: "ยกเลิกการจองสำเร็จ" });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
