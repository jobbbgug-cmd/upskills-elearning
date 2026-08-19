"use client";
import { useState, useEffect } from "react";
import { Check, X, Search, Trash2, Eye } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import LoadingSpinner from "@/components/LoadingSpinner";

interface OnlineRegistration {
  _id: string;
  name: string;
  email: string;
  role: "student" | "teacher";
  contactChannel: string;
  contactId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

const STATUS_BADGES = {
  pending: { label: "รออนุมัติ", cls: "bg-yellow-100 text-yellow-700" },
  approved: { label: "อนุมัติแล้ว", cls: "bg-green-100 text-green-700" },
  rejected: { label: "ปฏิเสธ", cls: "bg-red-100 text-red-700" },
};

export default function OnlineRegistrationsPage() {
  const [registrations, setRegistrations] = useState<OnlineRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [filterRole, setFilterRole] = useState<"all" | "student" | "teacher">("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: "", name: "" });
  const [showApproveModal, setShowApproveModal] = useState<OnlineRegistration | null>(null);
  const [approveForm, setApproveForm] = useState({ username: "", password: "" });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/online-registrations");
      if (res.ok) setRegistrations(await res.json());
    } catch (error) {
      console.error("Error loading registrations:", error);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = registrations.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    const matchRole = filterRole === "all" || r.role === filterRole;
    return matchSearch && matchStatus && matchRole;
  });

  const handleApprove = async (id: string) => {
    if (!approveForm.username || !approveForm.password) {
      alert("กรุณากรอก username และ password");
      return;
    }

    setUpdating(id);
    try {
      const res = await fetch(`/api/super-admin/online-registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "approved",
          username: approveForm.username,
          password: approveForm.password,
        }),
      });
      if (res.ok) {
        await load();
        setShowApproveModal(null);
        setApproveForm({ username: "", password: "" });
      }
    } catch (error) {
      console.error("Error approving registration:", error);
    }
    setUpdating(null);
  };

  const handleReject = async (id: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/super-admin/online-registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });
      if (res.ok) await load();
    } catch (error) {
      console.error("Error rejecting registration:", error);
    }
    setUpdating(null);
  };

  const handleDelete = async (id: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/super-admin/online-registrations/${id}`, { method: "DELETE" });
      if (res.ok) {
        await load();
        setDeleteConfirm({ open: false, id: "", name: "" });
      }
    } catch (error) {
      console.error("Error deleting registration:", error);
    }
    setUpdating(null);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">สมัครเรียนออนไลน์</h1>
        <p className="text-sm text-gray-600 mt-1">รายการสมัครเรียนออนไลน์จากผู้ใช้</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหา ชื่อ หรือ อีเมล"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="all">สถานะทั้งหมด</option>
            <option value="pending">รออนุมัติ</option>
            <option value="approved">อนุมัติแล้ว</option>
            <option value="rejected">ปฏิเสธ</option>
          </select>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="all">บทบาททั้งหมด</option>
            <option value="student">นักเรียน</option>
            <option value="teacher">ครู</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600">ทั้งหมด</p>
          <p className="text-2xl font-bold text-gray-900">{registrations.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600">รออนุมัติ</p>
          <p className="text-2xl font-bold text-yellow-600">{registrations.filter(r => r.status === "pending").length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600">อนุมัติแล้ว</p>
          <p className="text-2xl font-bold text-green-600">{registrations.filter(r => r.status === "approved").length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600">ปฏิเสธ</p>
          <p className="text-2xl font-bold text-red-600">{registrations.filter(r => r.status === "rejected").length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ชื่อ</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">อีเมล</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">บทบาท</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ช่องทาง</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">สถานะ</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">วันที่สมัคร</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((reg) => (
                <tr key={reg._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{reg.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{reg.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${reg.role === "teacher" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                      {reg.role === "teacher" ? "ครู" : "นักเรียน"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{reg.contactChannel} ({reg.contactId})</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_BADGES[reg.status].cls}`}>
                      {STATUS_BADGES[reg.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(reg.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      {reg.status === "pending" && (
                        <>
                          <button
                            onClick={() => setShowApproveModal(reg)}
                            disabled={updating === reg._id}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                            title="อนุมัติ"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(reg._id)}
                            disabled={updating === reg._id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                            title="ปฏิเสธ"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setDeleteConfirm({ open: true, id: reg._id, name: reg.name })}
                        disabled={updating === reg._id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                        title="ลบ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">ไม่มีข้อมูล</p>
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">อนุมัติการสมัครของ {showApproveModal.name}</h2>
            <p className="text-sm text-gray-600">กรุณากำหนด username และ password สำหรับบัญชีนี้</p>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  placeholder="ป้อน username"
                  value={approveForm.username}
                  onChange={(e) => setApproveForm({ ...approveForm, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="ป้อน password"
                  value={approveForm.password}
                  onChange={(e) => setApproveForm({ ...approveForm, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowApproveModal(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleApprove(showApproveModal._id)}
                disabled={updating === showApproveModal._id || !approveForm.username || !approveForm.password}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {updating === showApproveModal._id ? "กำลังประมวลผล..." : "อนุมัติ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
        title="ยืนยันการลบ"
        description={`ลบการสมัครของ ${deleteConfirm.name}?`}
        onConfirm={() => handleDelete(deleteConfirm.id)}
        loading={updating === deleteConfirm.id}
      />
    </div>
  );
}
