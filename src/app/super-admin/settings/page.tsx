"use client";

import { useState } from "react";
import { Settings, Save } from "lucide-react";

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ตั้งค่าระบบ</h1>
        <button
          onClick={() => setSaving(true)}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-500 text-center py-8">
          <Settings className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          ฟีเจอร์ตั้งค่าระบบมีการพัฒนาอยู่
        </p>
      </div>
    </div>
  );
}
