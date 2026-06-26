import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Quiz, QuizAttempt } from "@/models/Quiz";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id } = await params;

    const quiz = await Quiz.findById(id).populate("courseId", "title").lean();
    if (!quiz) return NextResponse.json({ error: "ไม่พบข้อสอบ" }, { status: 404 });

    // Students don't get correct answers
    if (auth.role === "student") {
      const safe = JSON.parse(JSON.stringify(quiz));
      safe.questions = safe.questions.map((q: Record<string, unknown>) => ({
        ...q,
        options: (q.options as Array<{ text: string; isCorrect: boolean }>).map(({ text }) => ({ text })),
        explanation: undefined,
      }));
      return NextResponse.json(safe);
    }
    return NextResponse.json(JSON.parse(JSON.stringify(quiz)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "admin" && auth.role !== "teacher" && auth.role !== "super_admin"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const allowed = ["title","description","courseId","timeLimit","randomizeQuestions",
                     "randomizeOptions","showResultAfter","maxAttempts","isActive","questions"];
    const update: Record<string, unknown> = {};
    for (const k of allowed) if (body[k] !== undefined) update[k] = body[k];
    const quiz = await Quiz.findByIdAndUpdate(id, update, { new: true });
    if (!quiz) return NextResponse.json({ error: "ไม่พบข้อสอบ" }, { status: 404 });
    return NextResponse.json(JSON.parse(JSON.stringify(quiz)));
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
    await Promise.all([Quiz.findByIdAndDelete(id), QuizAttempt.deleteMany({ quizId: id })]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
