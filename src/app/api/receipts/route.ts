import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import Receipt from "@/models/Receipt";
import Booking from "@/models/Booking";
import Course from "@/models/Course";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);

    if (auth.role === "student") {
      const receipts = await Receipt.find({ studentId: auth.userId })
        .populate("courseId",  "title price")
        .populate("issuedBy",  "name")
        .sort({ issuedAt: -1 })
        .lean();
      return NextResponse.json(JSON.parse(JSON.stringify(receipts)));
    }

    const receipts = await Receipt.find(tenantFilter(institutionId))
      .populate("studentId", "name email")
      .populate("courseId",  "title price")
      .populate("issuedBy",  "name")
      .sort({ issuedAt: -1 })
      .lean();
    return NextResponse.json(JSON.parse(JSON.stringify(receipts)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

// POST — admin issues receipt for a booking
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "super_admin"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const { bookingId, note } = await req.json();
    if (!bookingId) return NextResponse.json({ error: "กรุณาระบุ bookingId" }, { status: 400 });

    const existing = await Receipt.findOne({ bookingId });
    if (existing) return NextResponse.json(JSON.parse(JSON.stringify(existing)));

    const booking = await Booking.findById(bookingId).lean() as {
      userId: { toString(): string }; courseId: { toString(): string };
    } | null;
    if (!booking) return NextResponse.json({ error: "ไม่พบการจอง" }, { status: 404 });

    const course = await Course.findById(booking.courseId).select("price").lean() as { price: number } | null;

    const receipt = await Receipt.create({
      institutionId: institutionId ?? undefined,
      bookingId, studentId: booking.userId, courseId: booking.courseId,
      amount: course?.price ?? 0, issuedBy: auth.userId, note: note ?? "",
    });
    const populated = await receipt.populate([
      { path: "studentId", select: "name email" },
      { path: "courseId",  select: "title price" },
      { path: "issuedBy",  select: "name" },
    ]);
    return NextResponse.json(JSON.parse(JSON.stringify(populated)), { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000)
      return NextResponse.json({ error: "มีใบเสร็จสำหรับการจองนี้แล้ว" }, { status: 409 });
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
