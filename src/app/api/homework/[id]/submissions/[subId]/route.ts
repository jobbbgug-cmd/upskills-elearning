import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { HomeworkSubmission } from "@/models/Homework";

// Admin/teacher: grade a submission
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; subId: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "teacher" && auth.role !== "super_admin"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { subId } = await params;
    const { score, feedback } = await req.json();
    const sub = await HomeworkSubmission.findByIdAndUpdate(
      subId,
      { score, feedback, status: "graded", gradedAt: new Date(), gradedBy: auth.userId },
      { new: true }
    ).populate("studentId", "name email");
    if (!sub) return NextResponse.json({ error: "ไม่พบการส่งงาน" }, { status: 404 });
    return NextResponse.json(JSON.parse(JSON.stringify(sub)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
