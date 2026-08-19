"use client";

import { useState, useEffect } from "react";
import { FlaskConical, CheckCircle, XCircle } from "lucide-react";

interface Trial {
  _id: string;
  institutionName: string;
  email: string;
  status: string;
  createdAt: string;
}

export default function TrialsPage() {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrials = async () => {
      try {
        const res = await fetch("/api/super-admin/trial-requests");
        if (res.ok) {
          const data = await res.json();
          setTrials(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch trials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrials();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">คำขอทดลองใช้</h1>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">คำขอทดลองใช้</h1>
        <p className="text-sm text-gray-600 mt-1">รวม {trials.length} คำขอ</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">สถาบัน</th>
                <th className="text-left py-3 px-4 font-semibold">อีเมล</th>
                <th className="text-left py-3 px-4 font-semibold">สถานะ</th>
                <th className="text-left py-3 px-4 font-semibold">วันที่ขอ</th>
                <th className="text-left py-3 px-4 font-semibold">การกระทำ</th>
              </tr>
            </thead>
            <tbody>
              {trials.map((trial) => (
                <tr key={trial._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{trial.institutionName}</td>
                  <td className="py-3 px-4">{trial.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      trial.status === "approved" ? "bg-green-100 text-green-700" : 
                      trial.status === "rejected" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {trial.status === "approved" ? "อนุมัติแล้ว" : 
                       trial.status === "rejected" ? "ปฏิเสธ" : "รอตรวจสอบ"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(trial.createdAt).toLocaleDateString("th-TH")}
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {trials.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-500">ไม่พบคำขอทดลองใช้</p>
        </div>
      )}
    </div>
  );
}
