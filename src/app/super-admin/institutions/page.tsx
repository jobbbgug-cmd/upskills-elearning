"use client";

import { useEffect, useState } from "react";
import { Building2, Plus, Pencil, Trash2 } from "lucide-react";

interface Institution {
  _id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  status: string;
  plan: string;
  createdAt: string;
}

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const res = await fetch("/api/super-admin/institutions");
        if (res.ok) {
          const data = await res.json();
          setInstitutions(Array.isArray(data) ? data : []);
        } else {
          console.error("Failed to fetch institutions:", res.status);
        }
      } catch (error) {
        console.error("Failed to fetch institutions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutions();
  }, []);

  const filtered = institutions.filter((inst) => statusFilter === "all" || inst.status === statusFilter);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">จัดการสถาบัน</h1>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">จัดการสถาบัน</h1>
          <p className="text-sm text-gray-600 mt-1">รวม {institutions.length} สถาบัน</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
          <Plus className="w-4 h-4" />
          เพิ่มสถาบัน
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label className="text-sm text-gray-600 block mb-2">สถานะ</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-600"
        >
          <option value="all">ทั้งหมด</option>
          <option value="active">ใช้งาน</option>
          <option value="inactive">ไม่ใช้งาน</option>
          <option value="suspended">ระงับ</option>
        </select>
      </div>

      {/* Institutions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">ชื่อสถาบัน</th>
                <th className="text-left py-3 px-4 font-semibold">อีเมล</th>
                <th className="text-left py-3 px-4 font-semibold">โทรศัพท์</th>
                <th className="text-left py-3 px-4 font-semibold">แพ็คเกจ</th>
                <th className="text-left py-3 px-4 font-semibold">สถานะ</th>
                <th className="text-left py-3 px-4 font-semibold">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((institution) => (
                <tr key={institution._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{institution.name}</td>
                  <td className="py-3 px-4 text-gray-600">{institution.email}</td>
                  <td className="py-3 px-4 text-gray-600">{institution.phone}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {institution.plan}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        institution.status === "active"
                          ? "bg-green-100 text-green-700"
                          : institution.status === "inactive"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {institution.status === "active"
                        ? "ใช้งาน"
                        : institution.status === "inactive"
                          ? "ไม่ใช้งาน"
                          : "ระงับ"}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
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
          <p className="text-gray-500">ไม่พบข้อมูลสถาบัน</p>
        </div>
      )}
    </div>
  );
}
