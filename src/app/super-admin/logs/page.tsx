"use client";

import { useState, useEffect } from "react";

interface Log {
  _id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/super-admin/activity-logs");
        if (res.ok) {
          const data = await res.json();
          setLogs(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">บันทึกกิจกรรม</h1>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">บันทึกกิจกรรม</h1>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">การกระทำ</th>
                <th className="text-left py-3 px-4 font-semibold">ผู้ใช้</th>
                <th className="text-left py-3 px-4 font-semibold">เวลา</th>
                <th className="text-left py-3 px-4 font-semibold">รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{log.action}</td>
                  <td className="py-3 px-4">{log.user}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(log.timestamp).toLocaleString("th-TH")}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {logs.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-500">ไม่พบบันทึกกิจกรรม</p>
        </div>
      )}
    </div>
  );
}
