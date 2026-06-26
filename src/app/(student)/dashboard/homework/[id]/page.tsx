"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, X, Loader2, CheckCircle2, Clock, ExternalLink, Send } from "lucide-react";

interface Homework {
  _id: string; title: string; description: string; dueDate: string; maxScore: number;
  courseId: { title: string }; attachments: { name: string; url: string }[];
}
interface Submission {
  _id: string; content: string; attachments: { name: string; url: string }[];
  score?: number; feedback?: string; status: "submitted" | "graded"; submittedAt: string;
}

export default function StudentHomeworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [hw,        setHw]        = useState<Homework | null>(null);
  const [sub,       setSub]       = useState<Submission | null>(null);
  const [content,   setContent]   = useState("");
  const [files,     setFiles]     = useState<{ name: string; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting,setSubmitting]= useState(false);
  const [done,      setDone]      = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/homework/${id}`).then((r) => r.json()),
      fetch(`/api/homework/${id}/submissions`).then((r) => r.json()),
    ]).then(([h, s]) => {
      setHw(h);
      if (s) {
        setSub(s);
        setContent(s.content ?? "");
        setFiles(s.attachments ?? []);
      }
    });
  }, [id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res  = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setFiles((f) => [...f, { name: file.name, url: data.url }]);
    setUploading(false);
    e.target.value = "";
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await fetch(`/api/homework/${id}/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, attachments: files }),
    });
    if (res.ok) {
      const updated: Submission = await res.json();
      setSub(updated);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    }
    setSubmitting(false);
  };

  if (!hw) return <div className="text-center py-20 text-gray-400">กำลังโหลด...</div>;

  const due    = new Date(hw.dueDate);
  const isPast = due < new Date();
  const isGraded = sub?.status === "graded";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/dashboard/homework" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> กลับรายการการบ้าน
      </Link>

      {/* Homework info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{hw.title}</h1>
            <p className="text-sm text-indigo-600 mt-0.5">{hw.courseId?.title}</p>
          </div>
          <div className="text-right shrink-0">
            <p className={`text-xs font-semibold ${isPast ? "text-red-500" : "text-gray-500"}`}>
              {isPast ? "เลยกำหนดส่งแล้ว" : "กำหนดส่ง"}
            </p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">
              {due.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">คะแนนเต็ม {hw.maxScore}</p>
          </div>
        </div>
        {hw.description && <p className="text-sm text-gray-600 mt-3 whitespace-pre-line">{hw.description}</p>}
        {hw.attachments?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-50">
            <p className="text-xs font-medium text-gray-500 mb-2">ไฟล์ประกอบจากครู</p>
            <div className="flex flex-wrap gap-2">
              {hw.attachments.map((a, i) => (
                <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs rounded-lg hover:bg-indigo-100">
                  <ExternalLink className="w-3 h-3" />{a.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Result (if graded) */}
      {isGraded && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-green-800">ตรวจแล้ว!</p>
              <p className="text-sm text-green-700 mt-0.5">คะแนน <strong>{sub.score}</strong> / {hw.maxScore}</p>
            </div>
          </div>
          {sub.feedback && (
            <div className="mt-3 pt-3 border-t border-green-200">
              <p className="text-xs font-medium text-green-700 mb-1">Feedback จากครู</p>
              <p className="text-sm text-green-800">{sub.feedback}</p>
            </div>
          )}
        </div>
      )}

      {/* Submission form */}
      {!isGraded && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="flex items-center gap-2">
            {sub ? <Clock className="w-4 h-4 text-yellow-500" /> : <Send className="w-4 h-4 text-indigo-500" />}
            <h2 className="font-semibold text-gray-900">{sub ? "งานที่ส่งแล้ว (แก้ไขได้)" : "ส่งการบ้าน"}</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">คำตอบ / คำอธิบาย</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="พิมพ์คำตอบหรืออธิบายงานที่ทำ..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ไฟล์แนบ</label>
            <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? "กำลังอัปโหลด..." : "แนบไฟล์งาน"}
              <input type="file" className="hidden" onChange={handleFileUpload} />
            </label>
            {files.length > 0 && (
              <div className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-xs">
                    <a href={f.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-indigo-600 hover:underline truncate">{f.name}</a>
                    <button onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || isPast || (!content && files.length === 0)}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            style={{ background: "linear-gradient(90deg,#4f46e5,#7c3aed)" }}
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />กำลังส่ง...</>
             : done ? <><CheckCircle2 className="w-4 h-4" />ส่งงานแล้ว!</>
             : <><Send className="w-4 h-4" />{sub ? "อัปเดตงาน" : "ส่งการบ้าน"}</>}
          </button>
          {isPast && <p className="text-center text-xs text-red-500">เลยกำหนดส่งแล้ว ไม่สามารถส่งงานได้</p>}
        </div>
      )}
    </div>
  );
}
