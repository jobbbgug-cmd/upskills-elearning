"use client";
import { useState, useEffect } from "react";
import { Bell, Send, Trash2, Users, X } from "lucide-react";

interface Notif {
  _id: string; title: string; body: string; type: string; createdAt: string;
}
interface Cert {
  _id: string; title: string; studentId: { _id: string; name: string }; courseId?: { title: string } | null; issuedAt: string;
}
interface Student { _id: string; name: string; email: string; }

const NOTIF_TYPES = [
  { value: "announcement",    label: "ประกาศทั่วไป" },
  { value: "homework_due",    label: "แจ้งกำหนดส่งการบ้าน" },
  { value: "quiz_available",  label: "ข้อสอบใหม่พร้อมทำ" },
  { value: "certificate",     label: "ออกใบรับรอง" },
  { value: "general",         label: "ทั่วไป" },
];

export default function AdminNotificationsPage() {
  const [tab,        setTab]      = useState<"send" | "certs">("send");
  const [students,   setStudents] = useState<Student[]>([]);
  const [courses,    setCourses]  = useState<{ _id: string; title: string }[]>([]);
  const [certs,      setCerts]    = useState<Cert[]>([]);
  const [sending,    setSending]  = useState(false);
  const [issuingCert, setIssuingCert] = useState(false);

  const [nForm, setNForm] = useState({
    title: "", body: "", link: "", type: "announcement",
    targetRole: "student", targetUserIds: [] as string[],
    sendToAll: true,
  });
  const [cForm, setCForm] = useState({
    studentId: "", courseId: "", title: "", description: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/owner/students?limit=200").then((r) => r.json()),
      fetch("/api/owner/courses").then((r) => r.json()),
      fetch("/api/certificates").then((r) => r.json()),
    ]).then(([s, c, cr]) => {
      setStudents(Array.isArray(s) ? s : s.students ?? []);
      const cs = Array.isArray(c) ? c : c.courses ?? [];
      setCourses(cs);
      setCerts(Array.isArray(cr) ? cr : []);
    });
  }, []);

  const sendNotif = async () => {
    if (!nForm.title) return;
    setSending(true);
    const body: Record<string, unknown> = { title: nForm.title, body: nForm.body, link: nForm.link || undefined, type: nForm.type };
    if (!nForm.sendToAll && nForm.targetUserIds.length > 0) body.targetUserIds = nForm.targetUserIds;
    else body.targetRole = nForm.targetRole;
    const res = await fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) {
      const d = await res.json();
      alert(`ส่งการแจ้งเตือนสำเร็จ ${d.sent} คน`);
      setNForm({ title: "", body: "", link: "", type: "announcement", targetRole: "student", targetUserIds: [], sendToAll: true });
    }
    setSending(false);
  };

  const issueCert = async () => {
    if (!cForm.studentId || !cForm.title) return;
    setIssuingCert(true);
    const res = await fetch("/api/certificates", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...cForm, courseId: cForm.courseId || null }),
    });
    if (res.ok) {
      const cert = await res.json();
      setCerts([cert, ...certs]);
      setCForm({ studentId: "", courseId: "", title: "", description: "" });

      // Auto-send notification to student
      const student = students.find((s) => s._id === cForm.studentId);
      if (student) {
        await fetch("/api/notifications", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetUserIds: [cForm.studentId],
            type: "certificate",
            title: `คุณได้รับใบรับรอง: ${cForm.title}`,
            body: "กดดูใบรับรองและดาวน์โหลด PDF ได้ที่หน้าใบรับรองของคุณ",
            link: "/dashboard/certificates",
          }),
        });
      }
    }
    setIssuingCert(false);
  };

  const deleteCert = async (id: string) => {
    if (!confirm("ลบใบรับรองนี้?")) return;
    const res = await fetch(`/api/certificates/${id}`, { method: "DELETE" });
    if (res.ok) setCerts(certs.filter((c) => c._id !== id));
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">การแจ้งเตือน & ใบรับรอง</h1>
        <p className="text-gray-500 text-sm mt-1">ส่งการแจ้งเตือนและออกใบรับรองให้นักเรียน</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {(["send", "certs"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === t ? "theme-tab-active" : "text-gray-500 hover:text-gray-700"}`}>
            {t === "send" ? <span className="flex items-center gap-1.5"><Bell className="w-4 h-4" />ส่งการแจ้งเตือน</span>
                          : <span className="flex items-center gap-1.5"><span>🏆</span>ออกใบรับรอง</span>}
          </button>
        ))}
      </div>

      {tab === "send" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Send form */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">ส่งการแจ้งเตือน</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ประเภท</label>
              <select value={nForm.type} onChange={(e) => setNForm({ ...nForm, type: e.target.value })} className={inputCls}>
                {NOTIF_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">หัวข้อ <span className="text-red-500">*</span></label>
              <input value={nForm.title} onChange={(e) => setNForm({ ...nForm, title: e.target.value })} className={inputCls} placeholder="หัวข้อการแจ้งเตือน" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">เนื้อหา</label>
              <textarea value={nForm.body} onChange={(e) => setNForm({ ...nForm, body: e.target.value })} rows={3} className={`${inputCls} resize-none`} placeholder="รายละเอียด..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ลิงก์ (ถ้ามี)</label>
              <input value={nForm.link} onChange={(e) => setNForm({ ...nForm, link: e.target.value })} className={inputCls} placeholder="/dashboard/quiz" />
            </div>

            {/* Target */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ส่งถึง</label>
              <div className="flex gap-3 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={nForm.sendToAll} onChange={() => setNForm({ ...nForm, sendToAll: true, targetUserIds: [] })} className="theme-input" />
                  <span className="text-sm text-gray-700">นักเรียนทั้งหมด</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={!nForm.sendToAll} onChange={() => setNForm({ ...nForm, sendToAll: false })} className="theme-input" />
                  <span className="text-sm text-gray-700">เลือกนักเรียน</span>
                </label>
              </div>
              {!nForm.sendToAll && (
                <div>
                  <select onChange={(e) => {
                    const v = e.target.value;
                    if (v && !nForm.targetUserIds.includes(v)) setNForm({ ...nForm, targetUserIds: [...nForm.targetUserIds, v] });
                    e.target.value = "";
                  }} className={inputCls}>
                    <option value="">— เลือกนักเรียน —</option>
                    {students.filter((s) => !nForm.targetUserIds.includes(s._id)).map((s) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                  {nForm.targetUserIds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {nForm.targetUserIds.map((uid) => {
                        const s = students.find((x) => x._id === uid);
                        return (
                          <span key={uid} className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
                            {s?.name ?? uid}
                            <button onClick={() => setNForm({ ...nForm, targetUserIds: nForm.targetUserIds.filter((x) => x !== uid) })}>
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button onClick={sendNotif} disabled={sending || !nForm.title}
              className="w-full flex items-center justify-center gap-2 py-2.5 theme-button font-semibold rounded-xl disabled:opacity-50 transition-colors text-sm">
              <Send className="w-4 h-4" />{sending ? "กำลังส่ง..." : "ส่งการแจ้งเตือน"}
            </button>
          </div>

          {/* Tips */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-700 mb-3 text-sm">ตัวอย่างการใช้งาน</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              {[
                { icon: "📢", text: "ประกาศวันหยุด / เปลี่ยนแปลงตาราง" },
                { icon: "📝", text: "แจ้งกำหนดส่งการบ้าน พร้อมลิงก์ไปหน้าส่งงาน" },
                { icon: "🧪", text: "แจ้งข้อสอบใหม่เปิดให้ทำแล้ว" },
                { icon: "🏆", text: "แจ้งผลคะแนนและออกใบรับรอง" },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-base shrink-0">{item.icon}</span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === "certs" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Issue form */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">ออกใบรับรองใหม่</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">นักเรียน <span className="text-red-500">*</span></label>
              <select value={cForm.studentId} onChange={(e) => setCForm({ ...cForm, studentId: e.target.value })} className={inputCls}>
                <option value="">— เลือกนักเรียน —</option>
                {students.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">คอร์ส (ถ้ามี)</label>
              <select value={cForm.courseId} onChange={(e) => setCForm({ ...cForm, courseId: e.target.value })} className={inputCls}>
                <option value="">— ไม่ระบุคอร์ส —</option>
                {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อใบรับรอง <span className="text-red-500">*</span></label>
              <input value={cForm.title} onChange={(e) => setCForm({ ...cForm, title: e.target.value })} className={inputCls} placeholder="เช่น ใบรับรองผู้เรียนจบหลักสูตร" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">รายละเอียด</label>
              <textarea value={cForm.description} onChange={(e) => setCForm({ ...cForm, description: e.target.value })} rows={2} className={`${inputCls} resize-none`} placeholder="เนื้อหาที่จะแสดงในใบรับรอง..." />
            </div>
            <button onClick={issueCert} disabled={issuingCert || !cForm.studentId || !cForm.title}
              className="w-full flex items-center justify-center gap-2 py-2.5 theme-button font-semibold rounded-xl disabled:opacity-50 transition-colors text-sm">
              🏆 {issuingCert ? "กำลังออก..." : "ออกใบรับรอง"}
            </button>
          </div>

          {/* Cert list */}
          <div>
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" /> ใบรับรองที่ออกแล้ว ({certs.length})
            </h2>
            {certs.length === 0 ? (
              <div className="text-center py-12 text-gray-300 bg-white rounded-2xl border border-gray-100">
                <p className="text-sm">ยังไม่มีใบรับรอง</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {certs.map((c) => (
                  <div key={c._id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                    <span className="text-xl">🏆</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{c.title}</p>
                      <p className="text-xs text-gray-400">{c.studentId?.name} {c.courseId ? `· ${c.courseId.title}` : ""}</p>
                    </div>
                    <button onClick={() => deleteCert(c._id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
