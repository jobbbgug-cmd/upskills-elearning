import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import Booking from "@/models/Booking";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { action } = await req.json(); // "approve" | "reject"
    if (!["approve", "reject"].includes(action))
      return NextResponse.json({ error: "action ไม่ถูกต้อง" }, { status: 400 });

    await connectDB();
    const { id } = await params;
    const booking = await Booking.findById(id);
    if (!booking) return NextResponse.json({ error: "ไม่พบการจอง" }, { status: 404 });

    booking.status = action === "approve" ? "confirmed" : "rejected";
    await booking.save();

    return NextResponse.json({ status: booking.status });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
