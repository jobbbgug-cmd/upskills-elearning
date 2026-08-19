"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, Search, Trash2, CheckCircle, Clock, Eye, EyeOff, Copy, Check } from "lucide-react";

interface OnlineRegistration {
  _id: string;
  name: string;
  email: string;
  contactChannel: string;
  contactId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

function genPassword(len = 10) {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#";
  return Array.from({ length: len }, () => c[Math.floor(Math.random() * c.length)]).join("");
}

export default function OnlineRegistrationsPage() {
  const [registrations, setRegistrations] = useState<OnlineRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [approvalModal, setApprovalModal] = useState<{ open: boolean; id: string; email: string; password: string }>({ open: false, id: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [approving, setApproving] = useState(false);
  const [successModal, setSuccessModal] = useState<{ open: boolean; username: string; password: string }>({ open: false, username: "", password: "" });
  const [successCopied, setSuccessCopied] = useState(false);

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

  const handleApproveClick = (id: string, email: string) => {
    setApprovalModal({ open: true, id, email, password: "" });
  };

  const handleApprove = async () => {
    if (!approvalModal.password) {
      alert("กรุณากำหนดรหัสผ่าน");
      return;
    }
    setApproving(true);
    try {
      const res = await fetch(`/api/super-admin/online-registrations/${approvalModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "approved",
          password: approvalModal.password,
          username: approvalModal.email,
        }),
      });
      if (res.ok) {
        setSuccessModal({ open: true, username: approvalModal.email, password: approvalModal.password });
        setApprovalModal({ open: false, id: "", email: "", password: "" });
        fetchRegistrations();
      }
    } catch (error) {
      console.error("Failed to approve:", error);
    } finally {
      setApproving(false);
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
                          onClick={() => handleApproveClick(reg._id, reg.email)}
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

      {/* Approval Modal */}
      {approvalModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">อนุมัติคำขอเรียนออนไลน์</h2>
              <p className="text-xs text-gray-400 mt-0.5">กำหนดรหัสผ่านเพื่อสร้าง User ในระบบ</p>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={approvalModal.email}
                  readOnly
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-600 bg-gray-50"
                />
                <p className="text-xs text-gray-400 mt-1">ใช้อีเมลเป็น Username</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={approvalModal.password}
                      onChange={(e) => setApprovalModal({ ...approvalModal, password: e.target.value })}
                      placeholder="กำหนดรหัสผ่าน"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const pwd = genPassword();
                      setApprovalModal({ ...approvalModal, password: pwd });
                      setShowPassword(true);
                    }}
                    className="px-4 py-2.5 text-xs font-semibold rounded-xl whitespace-nowrap bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                  >
                    Gen
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <div className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 bg-gray-50">
                  Online (เรียนออนไลน์)
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-5 border-t border-gray-100">
              <button
                onClick={handleApprove}
                disabled={approving || !approvalModal.password}
                className="flex-1 py-2.5 text-white font-semibold rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
              >
                {approving ? "กำลังประมวลผล..." : "บันทึก"}
              </button>
              <button
                onClick={() => setApprovalModal({ open: false, id: "", email: "", password: "" })}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-5 text-center border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">ยินดีต้อนรับสู่ UPSkills! 🎉</h2>
              <p className="text-xs text-gray-400 mt-1">อนุมัติสำเร็จ</p>
            </div>

            <div className="px-6 py-6 space-y-4">
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">ชื่อผู้ใช้:</p>
                  <p className="text-sm font-mono text-gray-900">{successModal.username}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">รหัสผ่าน:</p>
                  <p className="text-sm font-mono text-gray-900">{successModal.password}</p>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-xs text-gray-500 font-semibold mb-1">เข้าสู่ระบบ:</p>
                  <p className="text-sm font-mono text-blue-600">{typeof window !== "undefined" ? `${window.location.origin}/login` : "http://localhost:3000/login"}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  const text = `ยินดีต้อนรับสู่ UPSkills! 🎉\nชื่อผู้ใช้: ${successModal.username}\nรหัสผ่าน: ${successModal.password}\nเข้าสู่ระบบ: ${typeof window !== "undefined" ? `${window.location.origin}/login` : "http://localhost:3000/login"}`;
                  navigator.clipboard.writeText(text);
                  setSuccessCopied(true);
                  setTimeout(() => setSuccessCopied(false), 2000);
                }}
                className="w-full py-2.5 text-white font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
              >
                {successCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    คัดลอกแล้ว
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    คัดลอกข้อมูล
                  </>
                )}
              </button>
            </div>

            <div className="px-6 py-5 border-t border-gray-100">
              <button
                onClick={() => setSuccessModal({ open: false, username: "", password: "" })}
                className="w-full py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
