"use client";
import { useState, useEffect } from "react";
import { Check, X, Search, Trash2, Copy, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
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

function generateRandomPassword(length = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function OnlineRegistrationsPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<OnlineRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [filterRole, setFilterRole] = useState<"all" | "student" | "teacher">("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: "", name: "" });
  const [showApproveModal, setShowApproveModal] = useState<OnlineRegistration | null>(null);
  const [approveForm, setApproveForm] = useState({ password: "" });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({ username: "", password: "" });
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

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

  const handleApprove = async (id: string, email: string) => {
    if (!approveForm.password) {
      alert("กรุณากรอก password");
      return;
    }

    setUpdating(id);
    try {
      const res = await fetch(`/api/super-admin/online-registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "approved",
          username: email,
          password: approveForm.password,
        }),
      });

      const data = await res.json();
      console.log("Approve response:", { status: res.status, data });

      if (!res.ok) {
        throw new Error(data.error || `API Error: ${res.status}`);
      }

      setSuccessData({ username: email, password: approveForm.password });
      setShowSuccessModal(true);
      setShowApproveModal(null);
      setApproveForm({ password: "" });
      await load();
    } catch (error) {
      console.error("Error approving registration:", error);
      alert("เกิดข้อผิดพลาด: " + (error as Error).message);
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

  const copyToClipboard = () => {
    const text = `ยินดีต้อนรับสู่ UPSkills! 🎉\nชื่อผู้ใช้: ${successData.username}\nรหัสผ่าน: ${successData.password}\nเข้าสู่ระบบ: http://localhost:3000/login`;
    navigator.clipboard.writeText(text);
    setCopiedToClipboard(true);
    setTimeout(() => setCopiedToClipboard(false), 2000);
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
                            onClick={() => {
                              setShowApproveModal(reg);
                              setApproveForm({ password: "" });
                            }}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">อนุมัติการสมัคร</h2>
              <p className="text-sm text-gray-600 mt-1">กรุณากำหนดรหัสผ่าน</p>
            </div>

            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อผู้ใช้ (Username)</label>
                <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 font-medium">
                  {showApproveModal.email}
                </div>
                <p className="text-xs text-gray-500 mt-1">ดึงจากอีเมลอัตโนมัติ</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">รหัสผ่าน (Password)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={approveForm.password}
                    onChange={(e) => setApproveForm({ password: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                    placeholder="ป้อนรหัสผ่าน"
                  />
                  <button
                    onClick={() => setApproveForm({ password: generateRandomPassword() })}
                    className="px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                    title="สุ่มรหัสผ่าน"
                  >
                    <RefreshCw className="w-4 h-4" />
                    สุ่ม
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowApproveModal(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleApprove(showApproveModal._id, showApproveModal.email)}
                disabled={updating === showApproveModal._id || !approveForm.password}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {updating === showApproveModal._id ? "กำลังประมวลผล..." : "อนุมัติ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full space-y-6 text-center">
            <div className="text-5xl">🎉</div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-900">บันทึกข้อมูลสำเร็จ</h2>
              <p className="text-sm text-gray-600 mt-1">ยินดีต้อนรับสู่ UPSkills!</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-left">
              <div className="text-sm">
                <p className="text-gray-600">ชื่อผู้ใช้:</p>
                <p className="font-mono text-gray-900 break-all">{successData.username}</p>
              </div>
              <div className="text-sm">
                <p className="text-gray-600">รหัสผ่าน:</p>
                <p className="font-mono text-gray-900">{successData.password}</p>
              </div>
              <div className="text-sm">
                <p className="text-gray-600">เข้าสู่ระบบ:</p>
                <p className="font-mono text-blue-600">http://localhost:3000/login</p>
              </div>
            </div>

            <button
              onClick={copyToClipboard}
              className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                copiedToClipboard
                  ? "bg-green-100 text-green-700"
                  : "bg-violet-100 text-violet-600 hover:bg-violet-200"
              }`}
            >
              <Copy className="w-4 h-4" />
              {copiedToClipboard ? "คัดลอกสำเร็จ" : "คัดลอกข้อมูลทั้งหมด"}
            </button>

            <button
              onClick={() => {
                setShowSuccessModal(false);
                router.push("/super-admin/roles");
              }}
              className="w-full px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
            >
              ไปหน้า Roles
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirm.open}
        title="ยืนยันการลบ"
        message={`ลบการสมัครของ ${deleteConfirm.name}?`}
        type="danger"
        confirmLabel="ลบ"
        cancelLabel="ยกเลิก"
        onConfirm={() => handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ ...deleteConfirm, open: false })}
      />
    </div>
  );
}
