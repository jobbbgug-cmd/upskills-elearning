import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import Quiz from "@/models/Quiz";
import Course from "@/models/Course";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "student" && auth.role !== "parent")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const quizzes = await Quiz.find({ isActive: true })
      .populate("courseId", "title")
      .sort({ createdAt: -1 })
      .lean();

    const result = quizzes.map((q: any) => ({
      _id: q._id,
      title: q.title,
      description: q.description,
      courseId: q.courseId?._id,
      courseName: q.courseId?.title,
      timeLimit: q.timeLimit,
      maxAttempts: q.maxAttempts,
      showResultAfter: q.showResultAfter,
    }));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
