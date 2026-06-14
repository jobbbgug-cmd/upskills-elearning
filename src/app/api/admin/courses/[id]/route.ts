import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import Course from "@/models/Course";
import Booking from "@/models/Booking";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "teacher")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { sessions: newSessions, ...rest } = body;
    await connectDB();

    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const existing = await Course.findOne({ _id: id, ...tenantFilter(institutionId) }).select("sessions instructorId");
    if (!existing) return NextResponse.json({ error: "ไม่พบคอร์ส" }, { status: 404 });
    if (auth.role === "teacher" && existing.instructorId !== auth.userId) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์แก้ไขคอร์สนี้" }, { status: 403 });
    }

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

    revalidatePath(`/admin/courses/${id}`);
    revalidatePath("/admin/courses");

    return NextResponse.json({ course });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "teacher")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    if (auth.role === "teacher") {
      const course = await Course.findOne({ _id: id, ...tenantFilter(institutionId) }).select("instructorId");
      if (!course || course.instructorId !== auth.userId) {
        return NextResponse.json({ error: "ไม่มีสิทธิ์ลบคอร์สนี้" }, { status: 403 });
      }
    }

    await Course.findByIdAndDelete(id);
    await Booking.deleteMany({ courseId: id });

    return NextResponse.json({ message: "ลบคอร์สสำเร็จ" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
