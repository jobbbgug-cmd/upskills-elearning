"use client";

import { useEffect, useState } from "react";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  institutionId?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const params = new URLSearchParams();
        if (roleFilter !== "all") params.append("role", roleFilter);
        if (statusFilter !== "all") params.append("status", statusFilter);

        const res = await fetch(`/api/super-admin/users?${params.toString()}`);
        const result = await res.json();
        setUsers(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [roleFilter, statusFilter]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">จัดการผู้ใช้งาน</h1>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">จัดการผู้ใช้งาน</h1>
        <span className="text-sm text-gray-600">รวม {users.length} คน</span>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex gap-4">
        <div>
          <label className="text-sm text-gray-600 block mb-2">บทบาท</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-600"
          >
            <option value="all">ทั้งหมด</option>
            <option value="student">นักเรียน</option>
            <option value="teacher">ครู</option>
            <option value="admin">แอดมิน</option>
            <option value="super_admin">ซูเปอร์แอดมิน</option>
          </select>
        </div>

        <div>
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
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">ชื่อ</th>
                <th className="text-left py-3 px-4 font-semibold">อีเมล</th>
                <th className="text-left py-3 px-4 font-semibold">บทบาท</th>
                <th className="text-left py-3 px-4 font-semibold">สถานะ</th>
                <th className="text-left py-3 px-4 font-semibold">วันสมัคร</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{user.firstName} {user.lastName}</td>
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {user.role === "super_admin" ? "ซูเปอร์แอดมิน" :
                       user.role === "admin" ? "แอดมิน" :
                       user.role === "teacher" ? "ครู" : "นักเรียน"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === "active" ? "bg-green-100 text-green-700" :
                      user.status === "inactive" ? "bg-gray-100 text-gray-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {user.status === "active" ? "ใช้งาน" :
                       user.status === "inactive" ? "ไม่ใช้งาน" : "ระงับ"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString("th-TH")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {users.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-500">ไม่พบข้อมูลผู้ใช้งาน</p>
        </div>
      )}
    </div>
  );
}
