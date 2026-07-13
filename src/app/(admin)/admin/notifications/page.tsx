"use client";
import { useState, useEffect } from "react";
import { Bell, Send, Users, X } from "lucide-react";

interface Student { _id: string; name: string; email: string; }

const NOTIF_TYPES = [
  { value: "announcement",    label: "ประกาศทั่วไป" },
  { value: "homework_due",    label: "แจ้งกำหนดส่งการบ้าน" },
  { value: "quiz_available",  label: "ข้อสอบใหม่พร้อมทำ" },
  { value: "general",         label: "ทั่วไป" },
];

export default function AdminNotificationsPage() {
  const [students,   setStudents] = useState<Student[]>([]);
  const [sending,    setSending]  = useState(false);

  const [nForm, setNForm] = useState({
    title: "", body: "", link: "", type: "announcement",
    targetRole: "student", targetUserIds: [] as string[],
    sendToAll: true,
  });

  useEffect(() => {
    fetch("/api/admin/students?limit=200").then((r) => r.json())
      .then((s) => setStudents(Array.isArray(s) ? s : s.students ?? []));
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

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">การแจ้งเตือน</h1>
        <p className="text-gray-500 text-sm mt-1">ส่งการแจ้งเตือนให้นักเรียน</p>
      </div>

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
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="text-base shrink-0">{item.icon}</span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
