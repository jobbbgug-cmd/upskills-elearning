import { cookies } from "next/headers";
import Link from "next/link";
import { FileText, Clock, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";

interface Quiz {
  _id: string; title: string; description: string;
  timeLimit: number; maxAttempts: number; questions: unknown[];
  courseId?: { _id: string; title: string } | null;
}

async function getQuizzes(): Promise<Quiz[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return [];
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/quiz`, {
    headers: { Cookie: `token=${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function getAttempts(quizId: string, token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/quiz/${quizId}/attempts`, {
    headers: { Cookie: `token=${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function StudentQuizPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value ?? "";
  const quizzes = await getQuizzes();

  const quizzesWithAttempts = await Promise.all(
    quizzes.map(async (q) => {
      const attempt = await getAttempts(q._id, token);
      return { ...q, attempt };
    })
  );

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ข้อสอบ</h1>
        <p className="text-gray-500 text-sm mt-1">ข้อสอบที่พร้อมให้ทำ</p>
      </div>

      {quizzesWithAttempts.length === 0 ? (
        <div className="text-center py-20 text-gray-300">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">ยังไม่มีข้อสอบ</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quizzesWithAttempts.map(({ attempt, ...q }) => {
            const done = attempt?.status === "submitted";
            return (
              <div key={q._id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${done ? "bg-green-50" : "bg-indigo-50"}`}>
                  {done
                    ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                    : <FileText className="w-5 h-5 text-indigo-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{q.title}</p>
                  {q.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{q.description}</p>}
                  <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-400">
                    {q.courseId && <span className="text-indigo-500">{(q.courseId as { title: string }).title}</span>}
                    <span>{q.questions.length} ข้อ</span>
                    {q.timeLimit > 0 && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{q.timeLimit} นาที</span>}
                    {done && (
                      <span className={`font-semibold ${attempt.percentage >= 80 ? "text-green-500" : attempt.percentage >= 60 ? "text-yellow-500" : "text-red-400"}`}>
                        {attempt.score}/{attempt.totalPoints} คะแนน ({attempt.percentage}%)
                      </span>
                    )}
                  </div>
                </div>
                {done ? (
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Link href={`/dashboard/quiz/${q._id}/result`}
                      className="text-xs text-indigo-500 hover:text-indigo-700 font-medium flex items-center gap-1">
                      ดูผล <ChevronRight className="w-3 h-3" />
                    </Link>
                    {q.maxAttempts === 0 && (
                      <Link href={`/dashboard/quiz/${q._id}`}
                        className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                        ทำอีกครั้ง
                      </Link>
                    )}
                  </div>
                ) : (
                  <Link href={`/dashboard/quiz/${q._id}`}
                    className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shrink-0">
                    เริ่มสอบ <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                )}
                {!done && q.maxAttempts > 0 && (
                  <div className="shrink-0 text-xs text-gray-300 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{q.maxAttempts}ครั้ง
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
