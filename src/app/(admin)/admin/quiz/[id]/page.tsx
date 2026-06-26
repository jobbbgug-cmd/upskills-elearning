"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, ArrowLeft, CheckCircle2, XCircle, Medal, Clock } from "lucide-react";

interface QuizOption { text: string; isCorrect: boolean; }
interface QuizQuestion {
  _id?: string; question: string; type: "single" | "multiple";
  options: QuizOption[]; points: number; explanation: string;
}
interface Quiz {
  _id: string; title: string; description: string; timeLimit: number;
  maxAttempts: number; randomizeQuestions: boolean; randomizeOptions: boolean;
  showResultAfter: boolean; isActive: boolean; questions: QuizQuestion[];
  courseId?: { _id: string; title: string } | null;
}
interface Attempt {
  _id: string;
  studentId: { _id: string; name: string; email: string; profileImage?: string };
  score: number; totalPoints: number; percentage: number;
  timeSpent: number; submittedAt: string;
}

const emptyQuestion = (): QuizQuestion => ({
  question: "", type: "single", points: 1, explanation: "",
  options: [
    { text: "", isCorrect: false }, { text: "", isCorrect: false },
    { text: "", isCorrect: false }, { text: "", isCorrect: false },
  ],
});

function fmtTime(sec: number) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function AdminQuizDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [quiz,     setQuiz]     = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [tab,      setTab]      = useState<"questions" | "results">("questions");
  const [saving,   setSaving]   = useState(false);
  const [editing,  setEditing]  = useState<QuizQuestion | null>(null);
  const [editIdx,  setEditIdx]  = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/quiz/${id}`).then((r) => r.json()),
      fetch(`/api/quiz/${id}/attempts`).then((r) => r.json()),
    ]).then(([q, a]) => {
      setQuiz(q);
      setAttempts(Array.isArray(a) ? a : []);
    });
  }, [id]);

  const saveQuestions = async (questions: QuizQuestion[]) => {
    setSaving(true);
    const res = await fetch(`/api/quiz/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions }),
    });
    if (res.ok) {
      const q = await res.json();
      setQuiz(q);
    }
    setSaving(false);
  };

  const openNew = () => { setEditing(emptyQuestion()); setEditIdx(null); };
  const openEdit = (q: QuizQuestion, i: number) => { setEditing({ ...q, options: q.options.map((o) => ({ ...o })) }); setEditIdx(i); };

  const saveQuestion = () => {
    if (!editing || !quiz) return;
    const qs = [...quiz.questions];
    if (editIdx === null) qs.push(editing);
    else qs[editIdx] = editing;
    saveQuestions(qs);
    setEditing(null); setEditIdx(null);
  };

  const deleteQuestion = (i: number) => {
    if (!quiz) return;
    if (!confirm("ลบโจทย์ข้อนี้?")) return;
    const qs = quiz.questions.filter((_, idx) => idx !== i);
    saveQuestions(qs);
  };

  const setOption = (oi: number, text: string) => {
    if (!editing) return;
    const options = editing.options.map((o, i) => (i === oi ? { ...o, text } : o));
    setEditing({ ...editing, options });
  };
  const toggleCorrect = (oi: number) => {
    if (!editing) return;
    let options: QuizOption[];
    if (editing.type === "single") {
      options = editing.options.map((o, i) => ({ ...o, isCorrect: i === oi }));
    } else {
      options = editing.options.map((o, i) => (i === oi ? { ...o, isCorrect: !o.isCorrect } : o));
    }
    setEditing({ ...editing, options });
  };
  const addOption = () => {
    if (!editing || editing.options.length >= 8) return;
    setEditing({ ...editing, options: [...editing.options, { text: "", isCorrect: false }] });
  };
  const removeOption = (oi: number) => {
    if (!editing || editing.options.length <= 2) return;
    setEditing({ ...editing, options: editing.options.filter((_, i) => i !== oi) });
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white";

  if (!quiz) return <div className="text-center py-20 text-gray-400">กำลังโหลด...</div>;

  return (
    <div>
      <div className="mb-6 flex items-start gap-4">
        <button onClick={() => router.back()} className="mt-1 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 truncate">{quiz.title}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {quiz.questions.length} ข้อ
            {quiz.timeLimit > 0 ? ` · ${quiz.timeLimit} นาที` : ""}
            {quiz.courseId ? ` · ${(quiz.courseId as { title: string }).title}` : ""}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {(["questions", "results"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === t ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {t === "questions" ? `โจทย์ (${quiz.questions.length})` : `ผลการสอบ (${attempts.length})`}
          </button>
        ))}
      </div>

      {/* Questions tab */}
      {tab === "questions" && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={openNew}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
              <Plus className="w-4 h-4" /> เพิ่มโจทย์
            </button>
          </div>

          {quiz.questions.length === 0 ? (
            <div className="text-center py-16 text-gray-300">
              <p className="text-sm">ยังไม่มีโจทย์ กดปุ่ม "เพิ่มโจทย์" เพื่อเริ่ม</p>
            </div>
          ) : (
            <div className="space-y-3">
              {quiz.questions.map((q, i) => (
                <div key={q._id ?? i} className="bg-white border border-gray-100 rounded-2xl p-5">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{q.question}</p>
                      <div className="mt-2 space-y-1">
                        {q.options.map((o, oi) => (
                          <div key={oi} className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg ${o.isCorrect ? "bg-green-50 text-green-700" : "text-gray-500"}`}>
                            {o.isCorrect ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <span className="w-3.5 h-3.5 shrink-0 border border-gray-200 rounded-full inline-block" />}
                            {o.text}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-3 mt-2 text-xs text-gray-400">
                        <span className="capitalize">{q.type === "single" ? "เลือกตอบเดียว" : "เลือกตอบหลายข้อ"}</span>
                        <span>{q.points} คะแนน</span>
                        {q.explanation && <span className="text-indigo-400">มีคำอธิบาย</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => openEdit(q, i)} className="p-1.5 text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Save className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteQuestion(i)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Results tab */}
      {tab === "results" && (
        <div>
          {attempts.length === 0 ? (
            <div className="text-center py-16 text-gray-300">
              <p className="text-sm">ยังไม่มีนักเรียนทำข้อสอบนี้</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-xs">
                    <th className="px-5 py-3 text-left font-medium w-8">#</th>
                    <th className="px-5 py-3 text-left font-medium">ชื่อ</th>
                    <th className="px-5 py-3 text-right font-medium">คะแนน</th>
                    <th className="px-5 py-3 text-right font-medium">%</th>
                    <th className="px-5 py-3 text-right font-medium">เวลา</th>
                    <th className="px-5 py-3 text-right font-medium">ผล</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((a, i) => {
                    const passed = a.percentage >= 60;
                    return (
                      <tr key={a._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                        <td className="px-5 py-3.5 text-gray-400">
                          {i === 0 ? <Medal className="w-4 h-4 text-yellow-400" />
                            : i === 1 ? <Medal className="w-4 h-4 text-gray-400" />
                            : i === 2 ? <Medal className="w-4 h-4 text-amber-600" />
                            : <span className="text-xs">{i + 1}</span>}
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-gray-900">{a.studentId?.name ?? "—"}</p>
                          <p className="text-xs text-gray-400">{a.studentId?.email}</p>
                        </td>
                        <td className="px-5 py-3.5 text-right font-semibold text-gray-900">
                          {a.score}/{a.totalPoints}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className={`font-bold ${a.percentage >= 80 ? "text-green-500" : a.percentage >= 60 ? "text-yellow-500" : "text-red-400"}`}>
                            {a.percentage}%
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right text-gray-400 flex items-center justify-end gap-1">
                          <Clock className="w-3.5 h-3.5" />{fmtTime(a.timeSpent)}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {passed
                            ? <span className="inline-flex items-center gap-1 text-green-600 text-xs"><CheckCircle2 className="w-3.5 h-3.5" />ผ่าน</span>
                            : <span className="inline-flex items-center gap-1 text-red-400 text-xs"><XCircle className="w-3.5 h-3.5" />ไม่ผ่าน</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Question editor modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-bold text-gray-900">{editIdx === null ? "เพิ่มโจทย์" : "แก้ไขโจทย์"}</h2>
              <button onClick={() => { setEditing(null); setEditIdx(null); }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4 overflow-y-auto">
              {/* Question text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">โจทย์ <span className="text-red-500">*</span></label>
                <textarea value={editing.question} onChange={(e) => setEditing({ ...editing, question: e.target.value })}
                  rows={3} className={`${inputCls} resize-none`} placeholder="พิมพ์โจทย์ข้อสอบ..." />
              </div>
              {/* Type + Points */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ประเภท</label>
                  <select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value as "single" | "multiple" })} className={inputCls}>
                    <option value="single">เลือกตอบเดียว</option>
                    <option value="multiple">เลือกตอบหลายข้อ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">คะแนน</label>
                  <input type="number" value={editing.points} onChange={(e) => setEditing({ ...editing, points: Number(e.target.value) })}
                    min={1} className={inputCls} />
                </div>
              </div>
              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ตัวเลือก <span className="text-xs text-gray-400 font-normal ml-1">
                    {editing.type === "single" ? "กดปุ่มกลมเพื่อเลือกคำตอบที่ถูก" : "กดปุ่มสี่เหลี่ยมเพื่อเลือกคำตอบที่ถูก (หลายข้อได้)"}
                  </span>
                </label>
                <div className="space-y-2">
                  {editing.options.map((o, oi) => (
                    <div key={oi} className={`flex items-center gap-2 p-2.5 rounded-xl border ${o.isCorrect ? "border-green-300 bg-green-50" : "border-gray-200 bg-white"}`}>
                      <button type="button" onClick={() => toggleCorrect(oi)}
                        className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${o.isCorrect ? "bg-green-500 border-green-500" : "border-gray-300 hover:border-green-400"}`}>
                        {o.isCorrect && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </button>
                      <input value={o.text} onChange={(e) => setOption(oi, e.target.value)}
                        className="flex-1 text-sm bg-transparent outline-none placeholder-gray-300" placeholder={`ตัวเลือก ${oi + 1}...`} />
                      {editing.options.length > 2 && (
                        <button onClick={() => removeOption(oi)} className="text-gray-300 hover:text-red-400 shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                  ))}
                </div>
                {editing.options.length < 8 && (
                  <button onClick={addOption} className="mt-2 flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium">
                    <Plus className="w-3.5 h-3.5" /> เพิ่มตัวเลือก
                  </button>
                )}
              </div>
              {/* Explanation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">คำอธิบาย (ถ้ามี)</label>
                <textarea value={editing.explanation} onChange={(e) => setEditing({ ...editing, explanation: e.target.value })}
                  rows={2} className={`${inputCls} resize-none`} placeholder="แสดงให้นักเรียนเห็นหลังส่งคำตอบ..." />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-5 border-t border-gray-100 shrink-0">
              <button onClick={saveQuestion} disabled={saving || !editing.question}
                className="flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm">
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
              <button onClick={() => { setEditing(null); setEditIdx(null); }}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm">ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
