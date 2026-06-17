"use client";
import { useState, useEffect } from "react";
import { Bell, Save, Mail, CheckCircle2, Send, AlertCircle } from "lucide-react";

const inputClass =
  "w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500";

export default function SettingsPage() {
  const [notifyEmail, setNotifyEmail] = useState("");
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [testing, setTesting]         = useState(false);
  const [testResult, setTestResult]   = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    fetch("/api/super-admin/system-settings?key=trialNotifyEmail")
      .then((r) => r.json())
      .then((d) => { setNotifyEmail(d.value || "jobbbgug@gmail.com"); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await fetch("/api/super-admin/test-email", { method: "POST" });
    const d = await res.json();
    setTestResult({
      ok: d.ok,
      msg: d.ok
        ? `ส่งสำเร็จ → SMTP: ${d.smtpUser} | NOTIFY: ${d.notifyEmail}`
        : `ส่งไม่ได้: ${d.error} | SMTP_USER: ${d.smtpUser} | SMTP_PASS: ${d.smtpPass}`,
    });
    setTesting(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/super-admin/system-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "trialNotifyEmail", value: notifyEmail }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ตั้งค่าทั่วไป</h1>
        <p className="text-gray-500 text-sm mt-1">จัดการการตั้งค่าระบบส่วนกลาง</p>
      </div>

      {/* Email notification */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-5 h-5 text-violet-500" />
          <h2 className="font-semibold text-gray-900">การแจ้งเตือนผ่านอีเมล</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          ระบบจะส่งอีเมลแจ้งเตือนไปยังที่อยู่นี้เมื่อมี:
        </p>
        <ul className="text-sm text-gray-500 mb-6 space-y-1.5 ml-1">
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />คำขอทดลองใช้งานใหม่เข้ามา</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />คำขอสมัครสมาชิกใหม่เข้ามา</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />แจ้งเตือนการชำระเงินใหม่เข้ามา</li>
        </ul>

        {loading ? (
          <div className="text-sm text-gray-400">กำลังโหลด...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Mail className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />
                อีเมลรับแจ้งเตือนคำขอทดลองใช้งาน
              </label>
              <input
                type="email"
                required
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                placeholder="email@example.com"
                className={inputClass}
              />
              <p className="text-xs text-gray-400 mt-1.5">
                การแจ้งเตือนทั้งหมดจะถูกส่งไปยัง email นี้เพียงที่เดียว
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
              <button
                type="button"
                onClick={handleTest}
                disabled={testing}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {testing ? "กำลังทดสอบ..." : "ทดสอบส่ง email"}
              </button>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" />บันทึกเรียบร้อย
                </span>
              )}
            </div>

            {testResult && (
              <div className={`flex items-start gap-2 text-sm p-3 rounded-xl mt-2 ${testResult.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {testResult.ok ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                <span>{testResult.msg}</span>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
