"use client";
import { useState, useEffect, useCallback } from "react";
import { Award, Search, Plus, Trash2, X, Check, AlertCircle, FileText } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

const CERTIFICATE_TEMPLATES = [
  {
    id: "completion",
    name: "ใบรับรองสำเร็จการเรียน",
    description: "ใบรับรองแบบมาตรฐานเมื่อศิษย์เรียนจบคอร์ส",
    defaultTitle: "สำเร็จการเรียนคอร์ส {{courseName}}",
    defaultDesc: "ยืนยันว่า ได้เรียนจบและประสบความสำเร็จใน\nคอร์ส {{courseName}}",
  },
  {
    id: "achievement",
    name: "ใบรับรองความสำเร็จ",
    description: "สำหรับเนื้อหาพิเศษหรือโครงการ",
    defaultTitle: "ใบรับรองความสำเร็จ {{courseName}}",
    defaultDesc: "เพื่อยอมรับความสำเร็จและความมุ่งมั่น\nในการเรียน {{courseName}}",
  },
  {
    id: "participation",
    name: "ใบรับรองการเข้าร่วม",
    description: "สำหรับผู้ที่เข้าร่วมกิจกรรมการเรียน",
    defaultTitle: "ใบรับรองการเข้าร่วม {{courseName}}",
    defaultDesc: "เพื่อยอมรับความพยายามและการมีส่วนร่วม\nในการเรียน {{courseName}}",
  },
];

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
  studentId?: { _id: string; name: string; email: string; profileImage?: string } | null;
  courseId?: { _id: string; title: string } | null;
  issuedBy?: { name: string } | null;
}

export default function ManageCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStudent, setFilterStudent] = useState("");
  const [filterCourse, setFilterCourse] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [showTemplateSelect, setShowTemplateSelect] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [selectedCertPreview, setSelectedCertPreview] = useState<Certificate | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "" });
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ courseId: "", studentId: "", studentName: "", title: "", description: "" });
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
                       (c.studentId?.name.toLowerCase().includes(q) ?? false) ||
                       (c.studentId?.email.toLowerCase().includes(q) ?? false) ||
                       (c.courseId?.title.toLowerCase().includes(q) ?? false);
    const matchStudent = !filterStudent || c.studentId?._id === filterStudent;
    const matchCourse = !filterCourse || c.courseId?._id === filterCourse;
    return matchSearch && matchStudent && matchCourse;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    if (!createForm.courseId || !createForm.title) {
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
        setCreateForm({ courseId: "", studentId: "", studentName: "", title: "", description: "" });
        setSelectedTemplate(null);
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
        setSelectedCertPreview(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditOpen = (cert: Certificate) => {
    setEditForm({ title: cert.title, description: cert.description });
    setShowEdit(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");
    if (!editForm.title) {
      setEditError("กรุณากรอกชื่อใบรับรอง");
      return;
    }

    if (!selectedCertPreview) return;
    setEditing(true);
    try {
      const res = await fetch(`/api/certificates/${selectedCertPreview._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditSuccess(true);
        setTimeout(() => { setShowEdit(false); setEditSuccess(false); }, 1500);
        load();
        const updatedCert = await res.json();
        setSelectedCertPreview(updatedCert);
      } else {
        const err = await res.json();
        setEditError(err.error || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      setEditError("เกิดข้อผิดพลาด");
    }
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-600" />
            ใบรับรองความสำเร็จ
          </h1>
          <p className="text-gray-500 text-sm mt-1">จัดการใบรับรองสำหรับนักเรียนของคุณ</p>
        </div>
        <button
          onClick={() => setShowTemplateSelect(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
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
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          />
        </div>

        <select
          value={filterStudent}
          onChange={(e) => setFilterStudent(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">ทุกนักเรียน</option>
          {students.map(s => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>

        <select
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">ทุกคอร์ส</option>
          {courses.map(c => (
            <option key={c._id} value={c._id}>{c.title}</option>
          ))}
        </select>
      </div>

      {/* Template Selection Modal */}
      {showTemplateSelect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[650px] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">เลือก Template ใบรับรอง</h2>
              <button onClick={() => {
                setShowTemplateSelect(false);
                setPreviewTemplate(null);
              }} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-1 overflow-hidden">
              {/* Templates List */}
              <div className="w-1/3 overflow-y-auto bg-white p-6 space-y-4">
                <div className="mb-2">
                  <h3 className="text-sm font-bold text-gray-900">เลือก Template</h3>
                </div>
                {CERTIFICATE_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setPreviewTemplate(template.id)}
                    className={`w-full p-4 rounded-2xl text-left transition-all transform hover:scale-105 ${
                      previewTemplate === template.id
                        ? "border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg"
                        : "border-2 border-gray-200 bg-white hover:border-purple-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg flex-shrink-0 ${
                        previewTemplate === template.id
                          ? "bg-purple-200"
                          : "bg-gray-100"
                      }`}>
                        <FileText className={`w-6 h-6 ${
                          previewTemplate === template.id
                            ? "text-purple-600"
                            : "text-gray-600"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900">{template.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Preview Section */}
              <div className="w-2/3 h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 p-2 flex flex-col items-center justify-between">
                {previewTemplate ? (
                  <>
                    {CERTIFICATE_TEMPLATES.map((template) => (
                      previewTemplate === template.id && (
                        <div key={template.id} className="w-full h-full flex flex-col items-center gap-1 p-3 overflow-y-auto">
                          {/* Certificate Preview - A4 Landscape */}
                          <div className="relative flex-shrink-0" style={{ width: '100%', height: '450px' }}>
                            {/* Certificate background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col relative rounded-lg overflow-hidden" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(200,200,220,0.1), transparent), radial-gradient(circle at 80% 80%, rgba(200,200,220,0.1), transparent)' }}>
                              {/* Logo area */}
                              <div className="h-12 flex items-center justify-start px-6 pt-3">
                                <img src="/logo.png" alt="UPSkills" className="h-8 object-contain" />
                              </div>

                              {/* Main content area */}
                              <div className="flex-1 flex flex-col justify-center items-center px-12 py-4 text-center relative">
                                {/* Certificate title */}
                                <h1 className="text-5xl font-bold text-blue-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>CERTIFICATE</h1>
                                <p className="text-2xl text-yellow-600 font-semibold tracking-widest mb-6">OF APPRECIATION</p>

                                {/* Presented to text */}
                                <p className="text-sm text-gray-800 mb-3 font-medium">This Certificate is Presented To</p>

                                {/* Name area */}
                                <h2 className="text-4xl text-yellow-600 mb-3" style={{ fontStyle: 'italic', fontFamily: 'Brush Script MT, cursive' }}>
                                  {createForm.studentName || "ชื่อจริง นามสกุล"}
                                </h2>

                                <div className="w-48 border-t-2 border-gray-400 mb-6"></div>

                                {/* Description */}
                                <p className="text-sm text-gray-800 mb-8 max-w-2xl leading-relaxed font-normal whitespace-pre-wrap">
                                  {template.defaultDesc.replace(/{{courseName}}/g, courses.find(c => c._id === createForm.courseId)?.title || "[ชื่อคอร์ส]")}
                                </p>

                                {/* Signature lines */}
                                <div className="w-full flex justify-center gap-24 mt-auto pb-12">
                                  <div className="text-center">
                                    <div className="border-t border-gray-400 w-28 mb-2"></div>
                                    <span className="text-xs text-gray-700 font-semibold">Head of Event</span>
                                  </div>
                                  <div className="text-center">
                                    <div className="border-t border-gray-400 w-28 mb-2"></div>
                                    <span className="text-xs text-gray-700 font-semibold">Manager</span>
                                  </div>
                                </div>
                              </div>

                              {/* Decorative medal badge - Center bottom */}
                              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                                <div className="relative flex flex-col items-center">
                                  {/* Medal circle */}
                                  <div className="w-20 h-20 rounded-full border-4 border-blue-700 flex items-center justify-center bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-lg">
                                    <div className="w-16 h-16 rounded-full border-2 border-yellow-200 flex items-center justify-center">
                                      <svg className="w-10 h-10 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                      </svg>
                                    </div>
                                  </div>
                                  {/* Ribbon */}
                                  <div className="flex gap-1 mt-2">
                                    <div className="w-3 h-8 bg-blue-700"></div>
                                    <div className="w-3 h-8 bg-yellow-500"></div>
                                    <div className="w-3 h-8 bg-blue-700"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Confirmation Button */}
                          <div className="w-full flex gap-2 flex-shrink-0 pb-4 pt-2">
                            <button
                              onClick={() => {
                                setSelectedTemplate(template.id);
                                setShowTemplateSelect(false);
                                setShowCreate(true);
                                setPreviewTemplate(null);
                              }}
                              className="flex-1 py-2.5 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-md text-sm"
                            >
                              ยืนยันการเลือก
                            </button>
                            <button
                              onClick={() => setPreviewTemplate(null)}
                              className="px-4 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors text-sm"
                            >
                              ยกเลิก
                            </button>
                          </div>
                        </div>
                      )
                    ))}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-12 h-full">
                    <FileText className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-base font-medium">เลือก Template เพื่อดูตัวอย่าง</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">เพิ่มใบรับรองใหม่</h2>
                {selectedTemplate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Template: {CERTIFICATE_TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setShowCreate(false);
                  setSelectedTemplate(null);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">คอร์ส *</label>
                  <select
                    required
                    value={createForm.courseId}
                    onChange={(e) => {
                      setCreateForm({ ...createForm, courseId: e.target.value });
                      if (selectedTemplate && !createForm.title) {
                        const template = CERTIFICATE_TEMPLATES.find(t => t.id === selectedTemplate);
                        const selectedCourse = courses.find(c => c._id === e.target.value);
                        if (template && selectedCourse) {
                          setCreateForm(prev => ({
                            ...prev,
                            courseId: e.target.value,
                            title: template.defaultTitle.replace("{{courseName}}", selectedCourse.title),
                            description: template.defaultDesc,
                          }));
                        }
                      }
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="">เลือกคอร์ส</option>
                    {courses.map(c => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                {selectedTemplate && (
                  <button
                    type="button"
                    onClick={() => {
                      const template = CERTIFICATE_TEMPLATES.find(t => t.id === selectedTemplate);
                      const selectedCourse = courses.find(c => c._id === createForm.courseId);
                      if (template && selectedCourse) {
                        setCreateForm(prev => ({
                          ...prev,
                          title: template.defaultTitle.replace("{{courseName}}", selectedCourse.title),
                          description: template.defaultDesc,
                        }));
                      }
                    }}
                    className="text-xs px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    ✨ ใช้ template
                  </button>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อใบรับรอง *</label>
                  <input
                    required
                    type="text"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    placeholder={selectedTemplate ? CERTIFICATE_TEMPLATES.find(t => t.id === selectedTemplate)?.defaultTitle : "เช่น สำเร็จคอร์ส JavaScript"}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">รายละเอียด</label>
                  <textarea
                    rows={3}
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    placeholder={selectedTemplate ? CERTIFICATE_TEMPLATES.find(t => t.id === selectedTemplate)?.defaultDesc : "รายละเอียดเพิ่มเติม"}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white resize-none"
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
                  className="flex-1 py-2.5 bg-purple-600 text-white font-semibold rounded-xl disabled:opacity-50 transition-colors text-sm hover:bg-purple-700"
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
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex">
        {loading ? (
          <div className="w-full flex items-center justify-center min-h-96">
            <LoadingSpinner />
          </div>
        ) : filtered.length === 0 ? (
          <div className="w-full text-center py-16 text-gray-400">
            <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
            {certificates.length === 0 ? "ยังไม่มีใบรับรอง" : "ไม่พบผลลัพธ์"}
          </div>
        ) : (
          <>
            <div className="w-1/2 divide-y divide-gray-50 overflow-y-auto max-h-96">
              {filtered.map((cert) => (
                <div
                  key={cert._id}
                  onClick={() => setSelectedCertPreview(cert)}
                  className={`p-5 hover:bg-gray-50 transition-colors cursor-pointer ${
                    selectedCertPreview?._id === cert._id ? "bg-purple-50 border-l-4 border-purple-600" : ""
                  }`}
                >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-purple-100">
                        <Award className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{cert.title}</h3>
                        <p className="text-xs text-gray-400">รหัส: {cert.code}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 flex-wrap">
                      {cert.studentId && <span>นักเรียน: {cert.studentId.name}</span>}
                      {cert.courseId && <span>คอร์ส: {cert.courseId.title}</span>}
                      <span>ออกเมื่อ: {new Date(cert.issuedAt).toLocaleDateString("th-TH")}</span>
                    </div>
                    {cert.description && (
                      <p className="text-sm text-gray-500 mt-2">{cert.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditOpen(cert);
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="แก้ไขใบรับรอง"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(cert._id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="ลบใบรับรอง"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            </div>

            {/* Preview Panel */}
            <div className="w-1/2 border-l border-gray-200 p-6 flex flex-col items-center justify-center overflow-y-auto">
              {selectedCertPreview ? (
                <div className="w-full flex flex-col items-center gap-4">
                  {/* Certificate Preview */}
                  <div className="relative flex-shrink-0" style={{ width: '100%', height: '300px' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col relative rounded-lg overflow-hidden" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(200,200,220,0.1), transparent), radial-gradient(circle at 80% 80%, rgba(200,200,220,0.1), transparent)' }}>
                      {/* Logo area */}
                      <div className="h-10 flex items-center justify-start px-6 pt-2">
                        <img src="/logo.png" alt="UPSkills" className="h-6 object-contain" />
                      </div>

                      {/* Main content area */}
                      <div className="flex-1 flex flex-col justify-center items-center px-10 py-2 text-center relative pb-16">
                        <h1 className="text-3xl font-bold text-blue-900" style={{ fontFamily: 'Georgia, serif' }}>CERTIFICATE</h1>
                        <p className="text-lg text-yellow-600 font-semibold tracking-widest mb-2">OF APPRECIATION</p>

                        <p className="text-xs text-gray-800 mb-1 font-medium">This Certificate is Presented To</p>

                        <h2 className="text-2xl text-yellow-600 mb-2" style={{ fontStyle: 'italic', fontFamily: 'Brush Script MT, cursive' }}>
                          {selectedCertPreview.studentId?.name || "ชื่อจริง นามสกุล"}
                        </h2>

                        <div className="w-32 border-t border-gray-400 mb-2"></div>

                        <p className="text-xs text-gray-700 max-w-xs leading-relaxed font-normal whitespace-pre-wrap mb-2">
                          {selectedCertPreview.description}
                        </p>

                        {/* Signature lines */}
                        <div className="w-full flex justify-between px-4 mt-auto">
                          <div className="text-center">
                            <div className="border-t border-gray-400 w-12 mb-1" style={{ fontSize: '9px' }}></div>
                            <span className="text-xs text-gray-700 font-semibold">Head of Event</span>
                          </div>
                          <div className="text-center">
                            <div className="border-t border-gray-400 w-12 mb-1"></div>
                            <span className="text-xs text-gray-700 font-semibold">Manager</span>
                          </div>
                        </div>
                      </div>

                      {/* Decorative medal badge */}
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                        <div className="relative flex flex-col items-center">
                          <div className="w-14 h-14 rounded-full border-3 border-blue-700 flex items-center justify-center bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-lg">
                            <div className="w-11 h-11 rounded-full border border-yellow-200 flex items-center justify-center">
                              <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex gap-0.5 mt-1">
                            <div className="w-2 h-5 bg-blue-700"></div>
                            <div className="w-2 h-5 bg-yellow-500"></div>
                            <div className="w-2 h-5 bg-blue-700"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>เลือกใบรับรองเพื่อดูรายละเอียด</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <p className="text-xs text-gray-400">แสดง {filtered.length} / {certificates.length} ใบรับรอง</p>

      {/* Edit Modal */}
      {showEdit && selectedCertPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">แก้ไขใบรับรอง</h2>
              <button
                onClick={() => setShowEdit(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อใบรับรอง *</label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">รายละเอียด</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  />
                </div>

                {editError && (
                  <div className="flex items-start gap-2 text-sm p-3 rounded-xl bg-red-50 text-red-700">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{editError}</span>
                  </div>
                )}
                {editSuccess && (
                  <div className="flex items-start gap-2 text-sm p-3 rounded-xl bg-green-50 text-green-700">
                    <Check className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>แก้ไขสำเร็จ</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3 px-6 py-5 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={editing}
                  className="flex-1 py-2.5 bg-purple-600 text-white font-semibold rounded-xl disabled:opacity-50 transition-colors text-sm hover:bg-purple-700"
                >
                  {editing ? "กำลังบันทึก..." : "บันทึก"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
