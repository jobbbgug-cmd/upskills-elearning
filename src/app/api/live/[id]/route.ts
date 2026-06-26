import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import LiveSession from "@/models/LiveSession";
import Notification from "@/models/Notification";
import Booking from "@/models/Booking";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "teacher" && auth.role !== "super_admin"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const allowed = ["title","description","meetLink","scheduledAt","duration","courseId","replayLink","status"];
    const update: Record<string, unknown> = {};
    for (const k of allowed) if (body[k] !== undefined) update[k] = body[k];
    if (body.scheduledAt) update.scheduledAt = new Date(body.scheduledAt);

    const session = await LiveSession.findByIdAndUpdate(id, update, { new: true })
      .populate("courseId", "title")
      .populate("createdBy", "name");
    if (!session) return NextResponse.json({ error: "ไม่พบ Live Session" }, { status: 404 });

    // Notify students when going live (only once)
    if (body.status === "live" && !session.notified) {
      const courseId = session.courseId?._id ?? session.courseId;
      const bookings = await Booking.find({ courseId, status: "confirmed" }).select("userId").lean() as unknown as { userId: { toString(): string } }[];
      const userIds = bookings.map((b) => b.userId.toString());
      if (userIds.length > 0) {
        await Notification.insertMany(userIds.map((uid) => ({
          userId: uid,
          type: "announcement",
          title: `🔴 Live เริ่มแล้ว: ${session.title}`,
          body: session.meetLink ? "กดเพื่อเข้าร่วม" : "กดดูตารางเรียน",
          link: session.meetLink || "/dashboard/live",
        })));
        await session.updateOne({ notified: true });
      }
    }

    return NextResponse.json(JSON.parse(JSON.stringify(session)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "super_admin"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id } = await params;
    await LiveSession.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
