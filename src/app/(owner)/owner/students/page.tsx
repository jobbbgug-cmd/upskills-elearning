"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, User, GraduationCap, Tag, ChevronRight, Filter, Plus, X, Eye, EyeOff } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Student {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  nickname?: string;
  gradeLevel?: string;
  profileImage?: string;
  status: "pending" | "approved" | "rejected";
  groups?: string[];
  createdAt: string;
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  approved: { label: "อนุมัติแล้ว", cls: "bg-green-100 text-green-700" },
  pending:  { label: "รอการอนุมัติ", cls: "bg-yellow-100 text-yellow-700" },
  rejected: { label: "ถูกปฏิเสธ",   cls: "bg-red-100 text-red-700" },
};

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [grade,    setGrade]    = useState("");
  const [group,    setGroup]    = useState("");
  const [showAdd,  setShowAdd]  = useState(false);
  const [showPw,   setShowPw]   = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [addError, setAddError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", nickname: "", gradeLevel: "", groups: "" });
  const [allGroups, setAllGroups] = useState<string[]>([]);

  const GRADE_LEVELS = [
    "ป.1","ป.2","ป.3","ป.4","ป.5","ป.6",
    "ม.1","ม.2","ม.3","ม.4","ม.5","ม.6",
    "ปวช.","ปวส.","มหาวิทยาลัย","ทั่วไป",
  ];

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (grade)  params.set("grade", grade);
    if (group)  params.set("group", group);
    const res = await fetch(`/api/admin/students?${params}`);
    if (res.ok) {
      const data: Student[] = await res.json();
      setStudents(data);
      const groups = Array.from(new Set(data.flatMap((s) => s.groups ?? []))).sort();
      setAllGroups(groups);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [search, grade, group]);

  const handleAddStudent = async () => {
    setAddError("");
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setAddError("กรุณากรอกชื่อ อีเมล และรหัสผ่าน");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          groups: form.groups ? form.groups.split(",").map((g) => g.trim()).filter(Boolean) : [],
        }),
      });
      const data = await res.json();
      if (!res.ok) { setAddError(data.error ?? "เกิดข้อผิดพลาด"); return; }
      setShowAdd(false);
      setForm({ name: "", email: "", password: "", phone: "", nickname: "", gradeLevel: "", groups: "" });
      load();
    } finally {
      setSaving(false);
    }
  };

  const initials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white";

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการนักเรียน</h1>
          <p className="text-gray-500 text-sm mt-1">ดูและแก้ไขข้อมูลนักเรียนทั้งหมด</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setShowAdd(true); setAddError(""); }}
            className="flex items-center gap-2 px-4 py-2.5 theme-button text-sm font-semibold rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> เพิ่มนักเรียน
          </button>
          <div className="flex items-center gap-2 theme-card border rounded-2xl px-4 py-3">
            <GraduationCap className="w-5 h-5" />
            <div>
              <div className="text-xl font-bold card-title">{students.length}</div>
              <div className="text-xs card-label">นักเรียนทั้งหมด</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-bold text-gray-900">เพิ่มนักเรียนใหม่</h2>
              <button onClick={() => setShowAdd(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4 overflow-y-auto">
              {addError && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">{addError}</div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputCls} placeholder="สมชาย ใจดี" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">ชื่อเล่น</label>
                  <input value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                    className={inputCls} placeholder="เช่น มาย" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">เบอร์โทร</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={inputCls} placeholder="08x-xxx-xxxx" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">อีเมล <span className="text-red-500">*</span></label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={inputCls} placeholder="student@email.com" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">รหัสผ่าน <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className={`${inputCls} pr-10`} placeholder="อย่างน้อย 6 ตัวอักษร" />
                    <button type="button" onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">ระดับชั้น</label>
                  <select value={form.gradeLevel} onChange={(e) => setForm({ ...form, gradeLevel: e.target.value })} className={inputCls}>
                    <option value="">— ไม่ระบุ —</option>
                    {["ป.1","ป.2","ป.3","ป.4","ป.5","ป.6","ม.1","ม.2","ม.3","ม.4","ม.5","ม.6","ปวช.","ปวส.","มหาวิทยาลัย","ทั่วไป"]
                      .map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">กลุ่ม</label>
                  <input value={form.groups} onChange={(e) => setForm({ ...form, groups: e.target.value })}
                    className={inputCls} placeholder="กลุ่ม A, กลุ่ม B" />
                  <p className="text-xs text-gray-400 mt-1">คั่นด้วยคอมม่า</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-5 border-t border-gray-100 shrink-0">
              <button onClick={handleAddStudent} disabled={saving}
                className="flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm">
                {saving ? "กำลังเพิ่ม..." : "เพิ่มนักเรียน"}
              </button>
              <button onClick={() => setShowAdd(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm">
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อ, อีเมล, เบอร์โทร..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 appearance-none"
          >
            <option value="">ทุกระดับชั้น</option>
            {GRADE_LEVELS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        {allGroups.length > 0 && (
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 appearance-none"
            >
              <option value="">ทุกกลุ่ม</option>
              {allGroups.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : students.length === 0 ? (
          <div className="text-center py-16 text-gray-400">ไม่พบนักเรียน</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">นักเรียน</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">ระดับชั้น</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">กลุ่ม</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">สถานะ</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">วันที่สมัคร</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.map((s) => {
                const st = STATUS_LABEL[s.status] ?? STATUS_LABEL.pending;
                return (
                  <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 overflow-hidden">
                          {s.profileImage ? (
                            <Image src={s.profileImage} alt={s.name} width={36} height={36} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-indigo-600">{initials(s.name)}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {s.name}
                            {s.nickname && <span className="ml-1.5 text-xs text-gray-400">({s.nickname})</span>}
                          </p>
                          <p className="text-xs text-gray-400">{s.phone || s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 hidden md:table-cell">
                      {s.gradeLevel || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {s.groups && s.groups.length > 0
                          ? s.groups.map((g) => (
                              <span key={g} className="px-2 py-0.5 bg-violet-50 text-violet-700 text-xs rounded-full border border-violet-100">
                                {g}
                              </span>
                            ))
                          : <span className="text-gray-300 text-sm">—</span>
                        }
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${st.cls}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400 hidden lg:table-cell">
                      {new Date(s.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/students/${s._id}`}
                        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        ดูโปรไฟล์ <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-3 text-right">{students.length} คน</p>
    </div>
  );
}
