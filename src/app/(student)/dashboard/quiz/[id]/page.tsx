"use client";
import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { Clock, ChevronLeft, ChevronRight, Send, AlertTriangle } from "lucide-react";

interface QuizOption { text: string; }
interface QuizQuestion {
  _id: string; question: string; type: "single" | "multiple";
  options: QuizOption[]; points: number;
}
interface Quiz {
  _id: string; title: string; description: string;
  timeLimit: number; questions: QuizQuestion[];
  randomizeOptions: boolean;
}

export default function TakeQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: quizId } = use(params);
  const router = useRouter();
  const [quiz,       setQuiz]       = useState<Quiz | null>(null);
  const [attemptId,  setAttemptId]  = useState<string | null>(null);
  const [order,      setOrder]      = useState<number[]>([]);
  const [answers,    setAnswers]    = useState<Record<string, number[]>>({});
  const [current,    setCurrent]    = useState(0);
  const [timeLeft,   setTimeLeft]   = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [phase,      setPhase]      = useState<"loading" | "started" | "error">("loading");
  const startedAt = useRef<number>(Date.now());
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const init = async () => {
      // Fetch quiz
      const qRes = await fetch(`/api/quiz/${quizId}`);
      if (!qRes.ok) { setError("ไม่พบข้อสอบ"); setPhase("error"); return; }
      const q: Quiz = await qRes.json();

      // Start attempt
      const aRes = await fetch(`/api/quiz/${quizId}/attempts`, { method: "POST" });
      if (!aRes.ok) {
        const err = await aRes.json();
        setError(err.error ?? "เริ่มทำข้อสอบไม่ได้"); setPhase("error"); return;
      }
      const a = await aRes.json();

      setQuiz(q);
      setAttemptId(a.attemptId);
      setOrder(a.questionOrder);
      setTimeLeft(q.timeLimit > 0 ? q.timeLimit * 60 : 0);
      startedAt.current = Date.now();
      setPhase("started");
    };
    init();
  }, [quizId]);

  useEffect(() => {
    if (phase !== "started" || timeLeft === 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); handleSubmit(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleSubmit = async (auto = false) => {
    if (submitting || !quiz || !attemptId) return;
    if (!auto && !confirm("ยืนยันการส่งคำตอบ? ไม่สามารถแก้ไขได้อีก")) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);
    const timeSpent = Math.round((Date.now() - startedAt.current) / 1000);
    const answersArr = quiz.questions.map((q) => ({ questionId: q._id, selected: answers[q._id] ?? [] }));
    const res = await fetch(`/api/quiz/${quizId}/attempts`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attemptId, answers: answersArr, timeSpent }),
    });
    if (res.ok) {
      const result = await res.json();
      sessionStorage.setItem(`quiz_result_${quizId}`, JSON.stringify(result));
      router.push(`/dashboard/quiz/${quizId}/result`);
    } else {
      setSubmitting(false);
      setError("ส่งคำตอบไม่สำเร็จ");
    }
  };

  const toggleAnswer = (qId: string, optIdx: number, type: "single" | "multiple") => {
    setAnswers((prev) => {
      const cur = prev[qId] ?? [];
      if (type === "single") return { ...prev, [qId]: [optIdx] };
      if (cur.includes(optIdx)) return { ...prev, [qId]: cur.filter((i) => i !== optIdx) };
      return { ...prev, [qId]: [...cur, optIdx] };
    });
  };

  const fmtTime = (sec: number) => {
    const m = Math.floor(sec / 60), s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  if (phase === "loading") return <div className="flex items-center justify-center min-h-screen text-gray-400">กำลังโหลดข้อสอบ...</div>;
  if (phase === "error")   return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
      <AlertTriangle className="w-12 h-12 text-red-400" />
      <p className="font-semibold text-gray-800">{error}</p>
      <button onClick={() => router.push("/dashboard/quiz")} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold">กลับ</button>
    </div>
  );
  if (!quiz || order.length === 0) return null;

  const currentQIdx = order[current];
  const currentQ    = quiz.questions[currentQIdx];
  const myAnswer    = answers[currentQ._id] ?? [];
  const answered    = order.filter((i) => (answers[quiz.questions[i]._id] ?? []).length > 0).length;
  const urgent      = quiz.timeLimit > 0 && timeLeft <= 60;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className={`sticky top-0 z-20 border-b px-4 py-3 flex items-center gap-4 ${urgent ? "bg-red-50 border-red-100" : "bg-white border-gray-100"}`}>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate text-sm">{quiz.title}</p>
          <p className="text-xs text-gray-400">ตอบแล้ว {answered}/{order.length} ข้อ</p>
        </div>
        {quiz.timeLimit > 0 && (
          <div className={`flex items-center gap-1.5 font-mono font-bold text-lg ${urgent ? "text-red-500 animate-pulse" : "text-gray-700"}`}>
            <Clock className="w-4 h-4" />{fmtTime(timeLeft)}
          </div>
        )}
        <button onClick={() => handleSubmit(false)} disabled={submitting}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          <Send className="w-3.5 h-3.5" />{submitting ? "กำลังส่ง..." : "ส่งคำตอบ"}
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {/* Question counter dots */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {order.map((qi, i) => {
            const ans = answers[quiz.questions[qi]._id] ?? [];
            const isCurrentQ = i === current;
            const hasAns = ans.length > 0;
            return (
              <button key={i} onClick={() => setCurrent(i)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${isCurrentQ ? "bg-indigo-600 text-white" : hasAns ? "bg-green-100 text-green-700" : "bg-white border border-gray-200 text-gray-400"}`}>
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* Question card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <div className="flex items-start gap-3 mb-5">
            <span className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-sm font-bold shrink-0">{current + 1}</span>
            <div>
              <p className="font-semibold text-gray-900 leading-relaxed">{currentQ.question}</p>
              <p className="text-xs text-gray-400 mt-1">
                {currentQ.type === "single" ? "เลือกคำตอบที่ถูกต้อง 1 ข้อ" : "เลือกคำตอบที่ถูกต้องทั้งหมด"}
                {" · "}{currentQ.points} คะแนน
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {currentQ.options.map((opt, oi) => {
              const selected = myAnswer.includes(oi);
              return (
                <button key={oi} onClick={() => toggleAnswer(currentQ._id, oi, currentQ.type)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${selected ? "border-indigo-500 bg-indigo-50" : "border-gray-100 bg-white hover:border-indigo-200"}`}>
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selected ? "bg-indigo-500 border-indigo-500" : "border-gray-300"}`}>
                    {selected && <span className="w-2 h-2 bg-white rounded-full" />}
                  </span>
                  <span className={`text-sm font-medium ${selected ? "text-indigo-700" : "text-gray-700"}`}>{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Nav buttons */}
        <div className="flex items-center justify-between">
          <button onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-30 transition-colors">
            <ChevronLeft className="w-4 h-4" />ข้อก่อน
          </button>
          <span className="text-sm text-gray-400 font-medium">{current + 1} / {order.length}</span>
          {current < order.length - 1 ? (
            <button onClick={() => setCurrent((c) => Math.min(order.length - 1, c + 1))}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
              ข้อต่อไป<ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={() => handleSubmit(false)} disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              <Send className="w-4 h-4" />{submitting ? "กำลังส่ง..." : "ส่งคำตอบ"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
