"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, User, CheckCircle2, Clock, Star, MessageSquare, ExternalLink } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Submission {
  _id: string;
  studentId: { _id: string; name: string; email: string; profileImage?: string; gradeLevel?: string };
  content: string;
  attachments: { name: string; url: string }[];
  score?: number;
  feedback?: string;
  status: "submitted" | "graded";
  submittedAt: string;
}
interface Homework {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  courseId: { title: string };
  attachments: { name: string; url: string }[];
}

export default function HomeworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [hw,   setHw]   = useState<Homework | null>(null);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [grading, setGrading] = useState<string | null>(null);
  const [gradeForm, setGradeForm] = useState<{ score: string; feedback: string }>({ score: "", feedback: "" });

  useEffect(() => {
    Promise.all([
      fetch(`/api/homework/${id}`).then((r) => r.json()),
      fetch(`/api/homework/${id}/submissions`).then((r) => r.json()),
    ]).then(([h, s]) => { setHw(h); setSubs(Array.isArray(s) ? s : []); });
  }, [id]);

  const openGrade = (sub: Submission) => {
    setGrading(sub._id);
    setGradeForm({ score: sub.score?.toString() ?? "", feedback: sub.feedback ?? "" });
  };

  const handleGrade = async (subId: string) => {
    const res = await fetch(`/api/homework/${id}/submissions/${subId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score: Number(gradeForm.score), feedback: gradeForm.feedback }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSubs((prev) => prev.map((s) => s._id === subId ? { ...s, ...updated } : s));
      setGrading(null);
    }
  };

  if (!hw) return <LoadingSpinner />;

  const graded    = subs.filter((s) => s.status === "graded").length;
  const submitted = subs.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/owner/homework" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> กลับรายการการบ้าน
      </Link>

      {/* Homework info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{hw.title}</h1>
            <p className="text-sm text-indigo-600 mt-0.5">{hw.courseId?.title}</p>
            {hw.description && <p className="text-sm text-gray-500 mt-2">{hw.description}</p>}
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm text-gray-500">กำหนดส่ง</p>
            <p className="text-sm font-semibold text-gray-900">{new Date(hw.dueDate).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
            <p className="text-xs text-gray-400 mt-1">คะแนนเต็ม {hw.maxScore}</p>
          </div>
        </div>
        {hw.attachments?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {hw.attachments.map((a, i) => (
              <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs rounded-lg hover:bg-indigo-100 transition-colors">
                <ExternalLink className="w-3 h-3" />{a.name}
              </a>
            ))}
          </div>
        )}
        <div className="flex gap-6 mt-4 pt-4 border-t border-gray-50">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{submitted}</div>
            <div className="text-xs text-gray-400">ส่งงานแล้ว</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{graded}</div>
            <div className="text-xs text-gray-400">ตรวจแล้ว</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">{submitted - graded}</div>
            <div className="text-xs text-gray-400">รอตรวจ</div>
          </div>
        </div>
      </div>

      {/* Submissions */}
      <div className="space-y-3">
        {subs.length === 0 ? (
          <div className="text-center py-16 text-gray-300 bg-white rounded-2xl border border-gray-100">
            <User className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">ยังไม่มีนักเรียนส่งงาน</p>
          </div>
        ) : subs.map((sub) => (
          <div key={sub._id} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 overflow-hidden">
                {sub.studentId?.profileImage
                  ? <Image src={sub.studentId.profileImage} alt={sub.studentId.name} width={40} height={40} className="w-full h-full object-cover" />
                  : <span className="text-sm font-bold text-indigo-600">{sub.studentId?.name?.[0]?.toUpperCase()}</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900">{sub.studentId?.name}</p>
                  {sub.studentId?.gradeLevel && <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">{sub.studentId.gradeLevel}</span>}
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${sub.status === "graded" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {sub.status === "graded" ? "ตรวจแล้ว" : "รอตรวจ"}
                  </span>
                  {sub.status === "graded" && sub.score !== undefined && (
                    <span className="text-xs font-bold text-indigo-600">{sub.score}/{hw.maxScore}</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  ส่งเมื่อ {new Date(sub.submittedAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
                {sub.content && <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">{sub.content}</p>}
                {sub.attachments?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {sub.attachments.map((a, i) => (
                      <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 text-xs rounded-lg hover:bg-gray-100 border border-gray-200">
                        <ExternalLink className="w-3 h-3" />{a.name}
                      </a>
                    ))}
                  </div>
                )}
                {sub.feedback && (
                  <div className="mt-2 px-3 py-2 bg-green-50 rounded-xl text-xs text-green-700">
                    <strong>Feedback:</strong> {sub.feedback}
                  </div>
                )}
              </div>
              <button onClick={() => openGrade(sub)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors shrink-0">
                {sub.status === "graded" ? <><Star className="w-4 h-4" />แก้คะแนน</> : <><CheckCircle2 className="w-4 h-4" />ตรวจงาน</>}
              </button>
            </div>

            {/* Grade form */}
            {grading === sub._id && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">คะแนน (เต็ม {hw.maxScore})</label>
                    <input type="number" value={gradeForm.score} onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })}
                      min={0} max={hw.maxScore}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1"><MessageSquare className="inline w-3 h-3 mr-1" />Feedback</label>
                  <textarea value={gradeForm.feedback} onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                    rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="คำแนะนำถึงนักเรียน..." />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleGrade(sub._id)}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
                    บันทึกคะแนน
                  </button>
                  <button onClick={() => setGrading(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-xl hover:bg-gray-200 transition-colors">
                    ยกเลิก
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
