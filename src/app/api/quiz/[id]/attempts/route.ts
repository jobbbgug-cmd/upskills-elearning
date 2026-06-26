import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Quiz, QuizAttempt, IQuizQuestion, IQuizOption } from "@/models/Quiz";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function gradeAttempt(questions: IQuizQuestion[], answers: { questionId: string; selected: number[] }[]) {
  let score = 0;
  const totalPoints = questions.reduce((s, q) => s + q.points, 0);
  for (const q of questions) {
    const ans = answers.find((a) => a.questionId === q._id.toString());
    if (!ans) continue;
    const correctIdxs = q.options
      .map((o, i) => (o.isCorrect ? i : -1))
      .filter((i) => i >= 0)
      .sort();
    const selectedSorted = [...ans.selected].sort();
    if (JSON.stringify(correctIdxs) === JSON.stringify(selectedSorted)) {
      score += q.points;
    }
  }
  return { score, totalPoints, percentage: totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0 };
}

// GET — admin: all attempts with ranking | student: own attempt
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id: quizId } = await params;

    if (auth.role === "student") {
      const attempt = await QuizAttempt.findOne({ quizId, studentId: auth.userId, status: "submitted" })
        .sort({ submittedAt: -1 }).lean();
      return NextResponse.json(attempt ? JSON.parse(JSON.stringify(attempt)) : null);
    }

    const attempts = await QuizAttempt.find({ quizId, status: "submitted" })
      .populate("studentId", "name email profileImage gradeLevel")
      .sort({ score: -1, timeSpent: 1 })
      .lean();
    return NextResponse.json(JSON.parse(JSON.stringify(attempts)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

// POST — student: start attempt
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "student")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id: quizId } = await params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz || !quiz.isActive)
      return NextResponse.json({ error: "ไม่พบข้อสอบ" }, { status: 404 });

    // Check attempt limit
    if (quiz.maxAttempts > 0) {
      const count = await QuizAttempt.countDocuments({ quizId, studentId: auth.userId, status: "submitted" });
      if (count >= quiz.maxAttempts)
        return NextResponse.json({ error: `ทำข้อสอบได้สูงสุด ${quiz.maxAttempts} ครั้ง` }, { status: 400 });
    }

    // Clear any in-progress attempt
    await QuizAttempt.deleteMany({ quizId, studentId: auth.userId, status: "in_progress" });

    const order = quiz.randomizeQuestions
      ? shuffle(quiz.questions.map((_: unknown, i: number) => i))
      : quiz.questions.map((_: unknown, i: number) => i);

    const attempt = await QuizAttempt.create({
      quizId, studentId: auth.userId,
      courseId: quiz.courseId ?? null,
      answers: [], score: 0, totalPoints: 0, percentage: 0,
      startedAt: new Date(), timeSpent: 0, status: "in_progress",
      questionOrder: order,
    });
    return NextResponse.json({ attemptId: attempt._id.toString(), questionOrder: order });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

// PATCH — student: submit answers
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "student")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id: quizId } = await params;
    const { attemptId, answers, timeSpent } = await req.json();

    const [quiz, attempt] = await Promise.all([
      Quiz.findById(quizId),
      QuizAttempt.findOne({ _id: attemptId, studentId: auth.userId, status: "in_progress" }),
    ]);
    if (!quiz || !attempt)
      return NextResponse.json({ error: "ไม่พบข้อสอบหรือการทำข้อสอบ" }, { status: 404 });

    const { score, totalPoints, percentage } = gradeAttempt(quiz.questions, answers);

    attempt.answers    = answers;
    attempt.score      = score;
    attempt.totalPoints = totalPoints;
    attempt.percentage = percentage;
    attempt.timeSpent  = timeSpent ?? 0;
    attempt.submittedAt = new Date();
    attempt.status     = "submitted";
    await attempt.save();

    // Return with correct answers for review
    const result = {
      score, totalPoints, percentage,
      questions: quiz.questions.map((q: IQuizQuestion) => ({
        _id:         q._id,
        question:    q.question,
        type:        q.type,
        points:      q.points,
        explanation: q.explanation,
        options:     q.options.map((o: IQuizOption, i: number) => ({ text: o.text, isCorrect: o.isCorrect, index: i })),
        myAnswer:    answers.find((a: { questionId: string }) => a.questionId === q._id.toString())?.selected ?? [],
        correctIdxs: q.options.map((o: IQuizOption, i: number) => (o.isCorrect ? i : -1)).filter((i: number) => i >= 0),
        earned:      (() => {
          const ans = answers.find((a: { questionId: string }) => a.questionId === q._id.toString());
          if (!ans) return 0;
          const ci = q.options.map((o: IQuizOption, i: number) => (o.isCorrect ? i : -1)).filter((i: number) => i >= 0).sort();
          return JSON.stringify(ci) === JSON.stringify([...ans.selected].sort()) ? q.points : 0;
        })(),
      })),
    };
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
