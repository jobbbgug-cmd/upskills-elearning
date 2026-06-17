"use client";
import { useState, useEffect } from "react";
import { Bell, Save, Mail, CheckCircle2 } from "lucide-react";

const inputClass =
  "w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500";

export default function SettingsPage() {
  const [notifyEmail, setNotifyEmail] = useState("");
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);

  useEffect(() => {
    fetch("/api/super-admin/system-settings?key=trialNotifyEmail")
      .then((r) => r.json())
      .then((d) => {
        setNotifyEmail(d.value || "jobbbgug@gmail.com");
        setLoading(false);
      });
  }, []);

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
        <p className="text-sm text-gray-500 mb-6">
          ระบบจะส่งอีเมลแจ้งเตือนไปยังที่อยู่นี้เมื่อมีคำขอทดลองใช้งานใหม่เข้ามา
        </p>

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
                เมื่อมีผู้กรอกแบบฟอร์ม "ทดลองใช้งานฟรี" ระบบจะแจ้งเตือนไปยัง email นี้ทันที
              </p>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  บันทึกเรียบร้อย
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
