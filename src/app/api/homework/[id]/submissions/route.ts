import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Homework, HomeworkSubmission } from "@/models/Homework";

// Admin/teacher: get all submissions for a homework
// Student: get own submission
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id: homeworkId } = await params;

    if (auth.role === "student") {
      const sub = await HomeworkSubmission.findOne({ homeworkId, studentId: auth.userId }).lean();
      return NextResponse.json(sub ? JSON.parse(JSON.stringify(sub)) : null);
    }

    const subs = await HomeworkSubmission.find({ homeworkId })
      .populate("studentId", "name email profileImage gradeLevel")
      .sort({ submittedAt: -1 })
      .lean();
    return NextResponse.json(JSON.parse(JSON.stringify(subs)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

// Student: submit homework
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "student")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id: homeworkId } = await params;
    const hw = await Homework.findById(homeworkId);
    if (!hw) return NextResponse.json({ error: "ไม่พบการบ้าน" }, { status: 404 });

    const { content, attachments } = await req.json();
    const sub = await HomeworkSubmission.findOneAndUpdate(
      { homeworkId, studentId: auth.userId },
      { $set: { courseId: hw.courseId, content: content ?? "", attachments: attachments ?? [], status: "submitted", submittedAt: new Date() } },
      { upsert: true, new: true }
    );
    return NextResponse.json(JSON.parse(JSON.stringify(sub)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
