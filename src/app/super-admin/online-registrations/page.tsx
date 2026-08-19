"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, Search, Trash2, CheckCircle, Clock } from "lucide-react";

interface OnlineRegistration {
  _id: string;
  name: string;
  email: string;
  contactChannel: string;
  contactId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function OnlineRegistrationsPage() {
  const [registrations, setRegistrations] = useState<OnlineRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const res = await fetch("/api/super-admin/online-registrations");
      if (res.ok) {
        const data = await res.json();
        setRegistrations(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/super-admin/online-registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      if (res.ok) {
        fetchRegistrations();
      }
    } catch (error) {
      console.error("Failed to approve:", error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`/api/super-admin/online-registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });
      if (res.ok) {
        fetchRegistrations();
      }
    } catch (error) {
      console.error("Failed to reject:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือว่าต้องการลบ?")) return;
    try {
      const res = await fetch(`/api/super-admin/online-registrations/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchRegistrations();
      }
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const filtered = registrations.filter((reg) => {
    const matchFilter = filter === "all" || reg.status === filter;
    const matchSearch = reg.name.toLowerCase().includes(search.toLowerCase()) ||
                       reg.email.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">คำขอสมัครสมาชิกเรียนออนไลน์</h1>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">คำขอสมัครสมาชิกเรียนออนไลน์</h1>
        <p className="text-sm text-gray-600 mt-1">รวม {registrations.length} คำขอ</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อหรืออีเมล..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          {([
            { value: "all" as const, label: "ทั้งหมด", bgActive: "bg-gray-600", bgInactive: "bg-gray-100" },
            { value: "pending" as const, label: "รอตรวจสอบ", bgActive: "bg-yellow-600", bgInactive: "bg-yellow-50" },
            { value: "approved" as const, label: "อนุมัติแล้ว", bgActive: "bg-green-600", bgInactive: "bg-green-50" },
            { value: "rejected" as const, label: "ปฏิเสธ", bgActive: "bg-red-600", bgInactive: "bg-red-50" },
          ] as const).map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.value
                  ? `${f.bgActive} text-white`
                  : `${f.bgInactive} text-gray-700 hover:text-gray-900`
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">ชื่อ</th>
                <th className="text-left py-3 px-4 font-semibold">อีเมล</th>
                <th className="text-left py-3 px-4 font-semibold">ช่องทางติดต่อ</th>
                <th className="text-left py-3 px-4 font-semibold">รายละเอียด</th>
                <th className="text-left py-3 px-4 font-semibold">สถานะ</th>
                <th className="text-left py-3 px-4 font-semibold">วันที่</th>
                <th className="text-right py-3 px-4 font-semibold">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((reg) => (
                <tr key={reg._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{reg.name}</td>
                  <td className="py-3 px-4 text-gray-600">{reg.email}</td>
                  <td className="py-3 px-4">
                    <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {reg.contactChannel}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{reg.contactId}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        reg.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : reg.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {reg.status === "approved"
                        ? "อนุมัติแล้ว"
                        : reg.status === "pending"
                          ? "รอตรวจสอบ"
                          : "ปฏิเสธ"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(reg.createdAt).toLocaleDateString("th-TH")}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {reg.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(reg._id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" />
                          อนุมัติ
                        </button>
                        <button
                          onClick={() => handleReject(reg._id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                          ปฏิเสธ
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(reg._id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-500">ไม่พบคำขอสมัครสมาชิก</p>
        </div>
      )}
    </div>
  );
}
