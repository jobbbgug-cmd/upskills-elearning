import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { resolveInstitutionId, tenantFilter } from "@/lib/tenant";
import { Quiz } from "@/models/Quiz";
import Booking from "@/models/Booking";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (auth.role === "student") {
      const bookings = await Booking.find({ userId: auth.userId, status: "confirmed" }).select("courseId").lean();
      const courseIds = bookings.map((b) => b.courseId);
      const filter: Record<string, unknown> = { isActive: true, ...tenantFilter(institutionId) };
      if (courseId) filter.courseId = courseId;
      else filter.$or = [{ courseId: { $in: courseIds } }, { courseId: null }];
      const quizzes = await Quiz.find(filter).select("-questions.options.isCorrect -questions.explanation").populate("courseId", "title").sort({ createdAt: -1 }).lean();
      return NextResponse.json(JSON.parse(JSON.stringify(quizzes)));
    }

    const filter: Record<string, unknown> = { ...tenantFilter(institutionId) };
    if (courseId) filter.courseId = courseId;
    const quizzes = await Quiz.find(filter).populate("courseId", "title").populate("createdBy", "name").sort({ createdAt: -1 }).lean();
    return NextResponse.json(JSON.parse(JSON.stringify(quizzes)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "teacher" && auth.role !== "super_admin"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const body = await req.json();
    const { title, courseId, description, timeLimit, randomizeQuestions, randomizeOptions, showResultAfter, maxAttempts } = body;
    if (!title) return NextResponse.json({ error: "กรุณาระบุชื่อข้อสอบ" }, { status: 400 });
    const quiz = await Quiz.create({
      institutionId: institutionId ?? undefined,
      courseId: courseId || null, title, description: description ?? "",
      timeLimit: timeLimit ?? 0, randomizeQuestions: randomizeQuestions ?? false,
      randomizeOptions: randomizeOptions ?? false, showResultAfter: showResultAfter ?? true,
      maxAttempts: maxAttempts ?? 1, createdBy: auth.userId, questions: [],
    });
    return NextResponse.json(JSON.parse(JSON.stringify(quiz)), { status: 201 });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
