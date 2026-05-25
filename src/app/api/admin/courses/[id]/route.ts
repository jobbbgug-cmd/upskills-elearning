import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import Course from "@/models/Course";
import Booking from "@/models/Booking";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { sessions: newSessions, ...rest } = body;
    console.log("[PUT course] rest fields:", JSON.stringify(rest, null, 2));
    await connectDB();

    const existing = await Course.findById(id).select("sessions");
    if (!existing) return NextResponse.json({ error: "ไม่พบคอร์ส" }, { status: 404 });

    // Preserve _id and bookedSeats from existing sessions
    const mergedSessions = newSessions.map((s: Record<string, unknown>, i: number) => {
      const ex = existing.sessions[i];
      return ex
        ? { ...s, _id: ex._id, bookedSeats: Array.from(ex.bookedSeats ?? []), bookedCount: ex.bookedCount ?? 0 }
        : s;
    });

    const course = await Course.findByIdAndUpdate(
      id,
      { ...rest, sessions: mergedSessions },
      { new: true, runValidators: true }
    );

    console.log("[PUT course] saved bankAccount:", course?.bankAccount, "bankName:", course?.bankName, "qrCodeImage:", course?.qrCodeImage);

    revalidatePath(`/admin/courses/${id}`);
    revalidatePath("/admin/courses");

    return NextResponse.json({ course });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    await Course.findByIdAndDelete(id);
    await Booking.deleteMany({ courseId: id });

    return NextResponse.json({ message: "ลบคอร์สสำเร็จ" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
