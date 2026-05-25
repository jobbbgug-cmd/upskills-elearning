import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import Course from "@/models/Course";
import Booking from "@/models/Booking";
import mongoose from "mongoose";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

    const { sessionId, seatNumber } = await req.json();
    if (!sessionId) return NextResponse.json({ error: "กรุณาเลือกรอบเวลา" }, { status: 400 });
    if (!seatNumber || typeof seatNumber !== "number")
      return NextResponse.json({ error: "กรุณาเลือกที่นั่ง" }, { status: 400 });

    await connectDB();
    const { id } = await params;
    const course = await Course.findById(id);
    if (!course) return NextResponse.json({ error: "ไม่พบคอร์ส" }, { status: 404 });

    const session = course.sessions.id(sessionId);
    if (!session) return NextResponse.json({ error: "ไม่พบรอบเวลา" }, { status: 404 });

    // Validate seat number
    if (seatNumber < 1 || seatNumber > session.maxCapacity)
      return NextResponse.json({ error: "หมายเลขที่นั่งไม่ถูกต้อง" }, { status: 400 });

    // Check seat already taken
    if (session.bookedSeats?.includes(seatNumber))
      return NextResponse.json({ error: "ที่นั่งนี้ถูกจองแล้ว กรุณาเลือกที่นั่งอื่น" }, { status: 400 });

    // Check user already booked this session
    const existing = await Booking.findOne({
      userId: auth.userId,
      courseId: id,
      sessionId: new mongoose.Types.ObjectId(sessionId),
      status: "confirmed",
    });
    if (existing) return NextResponse.json({ error: "คุณได้จองรอบนี้แล้ว" }, { status: 400 });

    // Create booking — free courses confirm immediately, paid courses wait for payment
    const initialStatus = course.price === 0 ? "confirmed" : "pending_payment";
    await Booking.create({
      userId: auth.userId,
      courseId: id,
      sessionId: new mongoose.Types.ObjectId(sessionId),
      seatNumber,
      status: initialStatus,
    });

    // Update session
    if (!session.bookedSeats) session.bookedSeats = [];
    session.bookedSeats.push(seatNumber);
    session.bookedCount = session.bookedSeats.length;
    await course.save();

    return NextResponse.json({ message: `จองที่นั่ง ${seatNumber} สำเร็จ!` });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

    const { sessionId } = await req.json();
    await connectDB();
    const { id } = await params;

    const booking = await Booking.findOneAndUpdate(
      { userId: auth.userId, courseId: id, sessionId, status: "confirmed" },
      { status: "cancelled" },
      { new: true }
    );
    if (!booking) return NextResponse.json({ error: "ไม่พบการจอง" }, { status: 404 });

    // Remove seat from session
    const course = await Course.findById(id);
    if (course) {
      const session = course.sessions.id(sessionId);
      if (session) {
        session.bookedSeats = (session.bookedSeats ?? []).filter((s: number) => s !== booking.seatNumber);
        session.bookedCount = session.bookedSeats.length;
        await course.save();
      }
    }

    return NextResponse.json({ message: "ยกเลิกการจองสำเร็จ" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
