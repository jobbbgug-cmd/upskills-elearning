"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock, Trophy, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface ResultQuestion {
  _id: string; question: string; type: string;
  points: number; explanation?: string;
  options:     { text: string; isCorrect: boolean; index: number }[];
  myAnswer:    number[];
  correctIdxs: number[];
  earned:      number;
}
interface Result {
  score: number; totalPoints: number; percentage: number;
  questions: ResultQuestion[];
}

function fmtTime(sec: number) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m} นาที ${s} วินาที`;
}

export default function QuizResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: quizId } = use(params);
  const router = useRouter();
  const [result,   setResult]   = useState<Result | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    const stored = sessionStorage.getItem(`quiz_result_${quizId}`);
    if (stored) {
      setResult(JSON.parse(stored));
    } else {
      // Fallback: fetch last submitted attempt from API — but we don't have questions+answers there
      router.push(`/dashboard/quiz`);
    }
  }, [quizId, router]);

  const toggle = (i: number) => setExpanded((prev) => {
    const s = new Set(prev);
    if (s.has(i)) s.delete(i); else s.add(i);
    return s;
  });

  if (!result) return <LoadingSpinner fullPage />;

  const passed = result.percentage >= 60;
  const correct = result.questions.filter((q) => q.earned > 0).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Score card */}
        <div className={`rounded-3xl p-8 text-center mb-8 ${passed ? "bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200" : "bg-gradient-to-br from-red-50 to-orange-50 border border-red-200"}`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${passed ? "bg-green-100" : "bg-red-100"}`}>
            <Trophy className={`w-9 h-9 ${passed ? "text-green-500" : "text-red-400"}`} />
          </div>
          <p className={`text-4xl font-extrabold mb-1 ${passed ? "text-green-700" : "text-red-600"}`}>{result.percentage}%</p>
          <p className={`text-sm font-semibold mb-3 ${passed ? "text-green-600" : "text-red-500"}`}>{passed ? "ผ่าน" : "ไม่ผ่าน"}</p>
          <div className="flex justify-center gap-8 text-sm text-gray-600">
            <div><span className="font-bold text-gray-900 text-xl">{result.score}</span><span className="text-gray-400">/{result.totalPoints}</span><br /><span className="text-xs text-gray-400">คะแนน</span></div>
            <div><span className="font-bold text-gray-900 text-xl">{correct}</span><span className="text-gray-400">/{result.questions.length}</span><br /><span className="text-xs text-gray-400">ข้อที่ถูก</span></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-8">
          <Link href="/dashboard/quiz" className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-2xl text-sm text-center hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" /> รายการข้อสอบ
          </Link>
        </div>

        {/* Per-question review */}
        <h2 className="text-base font-bold text-gray-900 mb-4">เฉลยรายข้อ</h2>
        <div className="space-y-3">
          {result.questions.map((q, i) => {
            const isCorrect = q.earned > 0;
            const open = expanded.has(i);
            return (
              <div key={q._id} className={`bg-white rounded-2xl border overflow-hidden ${isCorrect ? "border-green-100" : "border-red-100"}`}>
                <button onClick={() => toggle(i)} className="w-full flex items-start gap-3 p-4 text-left">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${isCorrect ? "bg-green-50 text-green-500" : "bg-red-50 text-red-400"}`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">{q.question}</p>
                    <p className={`text-xs mt-0.5 font-semibold ${isCorrect ? "text-green-500" : "text-red-400"}`}>
                      {isCorrect ? `+${q.earned} คะแนน` : `0/${q.points} คะแนน`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isCorrect ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
                    {open ? <ChevronUp className="w-4 h-4 text-gray-300" /> : <ChevronDown className="w-4 h-4 text-gray-300" />}
                  </div>
                </button>

                {open && (
                  <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-2">
                    {q.options.map((opt) => {
                      const isMine    = q.myAnswer.includes(opt.index);
                      const isAnsCorr = opt.isCorrect;
                      let cls = "border-gray-100 text-gray-500";
                      if (isAnsCorr && isMine)  cls = "border-green-300 bg-green-50 text-green-700";
                      else if (isAnsCorr)        cls = "border-green-200 bg-green-50/50 text-green-600";
                      else if (isMine && !isAnsCorr) cls = "border-red-200 bg-red-50 text-red-600";
                      return (
                        <div key={opt.index} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-sm ${cls}`}>
                          {isAnsCorr ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                            : isMine ? <XCircle className="w-4 h-4 shrink-0" />
                            : <span className="w-4 h-4 shrink-0" />}
                          {opt.text}
                          {isMine && !isAnsCorr && <span className="ml-auto text-xs font-medium text-red-400">คำตอบของคุณ</span>}
                          {isAnsCorr && <span className="ml-auto text-xs font-medium text-green-500">เฉลย</span>}
                        </div>
                      );
                    })}
                    {q.explanation && (
                      <div className="mt-2 px-3 py-2.5 bg-indigo-50 rounded-xl text-xs text-indigo-700 leading-relaxed">
                        <span className="font-semibold">คำอธิบาย: </span>{q.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
