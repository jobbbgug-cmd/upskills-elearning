"use client";
import { useState, useEffect, useCallback } from "react";
import { Award, Search, Plus, Trash2, Download, X, Check, AlertCircle } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Student {
  _id: string;
  name: string;
  email: string;
}

interface Course {
  _id: string;
  title: string;
}

interface Certificate {
  _id: string;
  title: string;
  description: string;
  code: string;
  issuedAt: string;
  studentId: { _id: string; name: string; email: string; profileImage?: string };
  courseId?: { _id: string; title: string } | null;
  issuedBy?: { name: string } | null;
}

interface Institution {
  _id: string;
  name: string;
}

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStudent, setFilterStudent] = useState("");
  const [filterCourse, setFilterCourse] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ studentId: "", courseId: "", title: "", description: "" });
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [certsRes, studentsRes, coursesRes] = await Promise.all([
        fetch("/api/certificates"),
        fetch("/api/admin/users?role=student"),
        fetch("/api/admin/courses"),
      ]);

      if (certsRes.ok) {
        const data = await certsRes.json();
        setCertificates(Array.isArray(data) ? data : []);
      }
      if (studentsRes.ok) {
        const all = await studentsRes.json();
        setStudents(Array.isArray(all) ? all.filter((u: any) => u.role === "student") : []);
      }
      if (coursesRes.ok) {
        const data = await coursesRes.json();
        setCourses(Array.isArray(data) ? data : (data?.courses ? data.courses : []));
      }
    } catch (err) {
      console.error(err);
      setCertificates([]);
      setStudents([]);
      setCourses([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = certificates.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = c.title.toLowerCase().includes(q) ||
                       c.studentId.name.toLowerCase().includes(q) ||
                       c.studentId.email.toLowerCase().includes(q);
    const matchStudent = !filterStudent || c.studentId._id === filterStudent;
    const matchCourse = !filterCourse || c.courseId?._id === filterCourse;
    return matchSearch && matchStudent && matchCourse;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    if (!createForm.studentId || !createForm.title) {
      setCreateError("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      if (res.ok) {
        setCreateSuccess(true);
        setCreateForm({ studentId: "", courseId: "", title: "", description: "" });
        setTimeout(() => { setShowCreate(false); setCreateSuccess(false); }, 1500);
        load();
      } else {
        const err = await res.json();
        setCreateError(err.error || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      setCreateError("เกิดข้อผิดพลาด");
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ลบใบรับรองนี้?")) return;
    try {
      const res = await fetch(`/api/certificates/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCertificates(certs => certs.filter(c => c._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
            ใบรับรองความสำเร็จ
          </h1>
          <p className="text-gray-500 text-sm mt-1">จัดการใบรับรองของนักเรียน</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-colors theme-button"
        >
          <Plus className="w-4 h-4" /> เพิ่มใบรับรอง
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อ อีเมล หรือชื่อใบรับรอง..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 bg-white"
            style={{ '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.5)' } as any}
          />
        </div>

        <select
          value={filterStudent}
          onChange={(e) => setFilterStudent(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.5)' } as any}
        >
          <option value="">ทุกนักเรียน</option>
          {students.map(s => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>

        <select
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.5)' } as any}
        >
          <option value="">ทุกคอร์ส</option>
          {courses.map(c => (
            <option key={c._id} value={c._id}>{c.title}</option>
          ))}
        </select>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">เพิ่มใบรับรองใหม่</h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">นักเรียน *</label>
                  <select
                    required
                    value={createForm.studentId}
                    onChange={(e) => setCreateForm({ ...createForm, studentId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                    style={{ '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.5)' } as any}
                  >
                    <option value="">เลือกนักเรียน</option>
                    {students.map(s => (
                      <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">คอร์ส</label>
                  <select
                    value={createForm.courseId}
                    onChange={(e) => setCreateForm({ ...createForm, courseId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                    style={{ '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.5)' } as any}
                  >
                    <option value="">เลือกคอร์ส (ไม่บังคับ)</option>
                    {courses.map(c => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อใบรับรอง *</label>
                  <input
                    required
                    type="text"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    placeholder="เช่น สำเร็จคอร์ส JavaScript"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                    style={{ '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.5)' } as any}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">รายละเอียด</label>
                  <textarea
                    rows={3}
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    placeholder="รายละเอียดเพิ่มเติม"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white resize-none"
                    style={{ '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.5)' } as any}
                  />
                </div>

                {createError && (
                  <div className="flex items-start gap-2 text-sm p-3 rounded-xl bg-red-50 text-red-700">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{createError}</span>
                  </div>
                )}
                {createSuccess && (
                  <div className="flex items-start gap-2 text-sm p-3 rounded-xl bg-green-50 text-green-700">
                    <Check className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>เพิ่มใบรับรองสำเร็จ</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3 px-6 py-5 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2.5 text-white font-semibold rounded-xl disabled:opacity-50 transition-colors text-sm theme-button"
                >
                  {creating ? "กำลังสร้าง..." : "สร้างใบรับรอง"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
            {certificates.length === 0 ? "ยังไม่มีใบรับรอง" : "ไม่พบผลลัพธ์"}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((cert) => (
              <div key={cert._id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)' }}>
                        <Award className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{cert.title}</h3>
                        <p className="text-xs text-gray-400">รหัส: {cert.code}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                      <span>นักเรียน: {cert.studentId.name}</span>
                      {cert.courseId && <span>คอร์ส: {cert.courseId.title}</span>}
                      <span>ออกเมื่อ: {new Date(cert.issuedAt).toLocaleDateString("th-TH")}</span>
                    </div>
                    {cert.description && (
                      <p className="text-sm text-gray-500 mt-2">{cert.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(cert._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="ลบใบรับรอง"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-3">แสดง {filtered.length} / {certificates.length} ใบรับรอง</p>
    </div>
  );
}
