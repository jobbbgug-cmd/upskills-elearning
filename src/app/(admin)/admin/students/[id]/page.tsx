"use client";
import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, Camera, Loader2, CheckCircle2, User, Phone, MapPin,
  FileText, Tag, Save, Trash2, Upload, ExternalLink, Plus, X, TrendingUp,
  Video, PenLine, ClipboardCheck, BookOpen,
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { THAI_PROVINCES, THAI_DISTRICTS, THAI_SUB_DISTRICTS } from "@/lib/thaiAddress";

interface StudentDoc {
  _id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: string;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  nickname?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  houseNumber?: string;
  building?: string;
  subDistrict?: string;
  amphoe?: string;
  province?: string;
  gradeLevel?: string;
  profileImage?: string;
  parentName?: string;
  parentPhone?: string;
  parentRelation?: string;
  groups?: string[];
  documents?: StudentDoc[];
  notes?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

const GRADE_LEVELS = [
  "ป.1","ป.2","ป.3","ป.4","ป.5","ป.6",
  "ม.1","ม.2","ม.3","ม.4","ม.5","ม.6",
  "ปวช.","ปวส.","มหาวิทยาลัย","ทั่วไป",
];

const DOC_TYPES = [
  { value: "id_card",     label: "สำเนาบัตรประชาชน" },
  { value: "photo",       label: "รูปถ่าย" },
  { value: "transcript",  label: "ใบแสดงผลการเรียน" },
  { value: "other",       label: "เอกสารอื่น ๆ" },
];

type Tab = "info" | "parent" | "groups" | "documents" | "progress";

interface CourseProgress {
  courseId: string; courseTitle: string;
  video: { watched: number; total: number };
  homework: { title: string; maxScore: number; sub: { status: string; score?: number } | null }[];
  quiz:     { title: string; attempt: { score: number; totalPoints: number; percentage: number } | null }[];
  attendance: { sessionId: string; checkedInAt: string; method: string }[];
}

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [student,   setStudent]   = useState<Student | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState<Tab>("info");
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [uploading, setUploading] = useState(false);

  // form fields
  const [form, setForm] = useState({
    name: "", nickname: "", phone: "", birthDate: "",
    houseNumber: "", building: "", subDistrict: "", amphoe: "", province: "",
    gradeLevel: "", profileImage: "",
    parentName: "", parentPhone: "", parentRelation: "",
    notes: "", status: "approved" as Student["status"],
  });
  const [groups,    setGroups]    = useState<string[]>([]);
  const [newGroup,  setNewGroup]  = useState("");
  const [progress,  setProgress]  = useState<CourseProgress[] | null>(null);
  const [loadingProg, setLoadingProg] = useState(false);

  // province combobox
  const [provinceInput, setProvinceInput] = useState("");
  const [showProvDrop,  setShowProvDrop]  = useState(false);

  // document upload state
  const [docName,  setDocName]  = useState("");
  const [docType,  setDocType]  = useState("other");
  const [docUrl,   setDocUrl]   = useState("");
  const [uploading2, setUploading2] = useState(false);

  const fileRef    = useRef<HTMLInputElement>(null);
  const docFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/admin/students/${id}`)
      .then((r) => r.json())
      .then((d: Student) => {
        setStudent(d);
        setForm({
          name:           d.name           ?? "",
          nickname:       d.nickname       ?? "",
          phone:          d.phone          ?? "",
          birthDate:      d.birthDate ? d.birthDate.slice(0, 10) : "",
          houseNumber:    d.houseNumber    ?? "",
          building:       d.building       ?? "",
          subDistrict:    d.subDistrict    ?? "",
          amphoe:         d.amphoe         ?? "",
          province:       d.province       ?? "",
          gradeLevel:     d.gradeLevel     ?? "",
          profileImage:   d.profileImage   ?? "",
          parentName:     d.parentName     ?? "",
          parentPhone:    d.parentPhone    ?? "",
          parentRelation: d.parentRelation ?? "",
          notes:          d.notes          ?? "",
          status:         d.status         ?? "approved",
        });
        setGroups(d.groups ?? []);
        setProvinceInput(d.province ?? "");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res  = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setForm((f) => ({ ...f, profileImage: data.url }));
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/admin/students/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, groups }),
    });
    if (res.ok) {
      const updated = await res.json();
      setStudent(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  const addGroup = () => {
    const g = newGroup.trim();
    if (!g || groups.includes(g)) return;
    setGroups([...groups, g]);
    setNewGroup("");
  };

  const removeGroup = (g: string) => setGroups(groups.filter((x) => x !== g));

  const handleDocFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading2(true);
    const fd = new FormData();
    fd.append("file", file);
    const res  = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) {
      setDocUrl(data.url);
      if (!docName) setDocName(file.name.replace(/\.[^/.]+$/, ""));
    }
    setUploading2(false);
  };

  const handleAddDoc = async () => {
    if (!docName || !docUrl) return;
    const res = await fetch(`/api/admin/students/${id}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: docName, url: docUrl, type: docType }),
    });
    if (res.ok) {
      const docs: StudentDoc[] = await res.json();
      setStudent((s) => s ? { ...s, documents: docs } : s);
      setDocName(""); setDocUrl(""); setDocType("other");
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    const res = await fetch(`/api/admin/students/${id}/documents/${docId}`, { method: "DELETE" });
    if (res.ok) {
      const docs: StudentDoc[] = await res.json();
      setStudent((s) => s ? { ...s, documents: docs } : s);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!student) return <div className="text-center py-20 text-gray-400">ไม่พบนักเรียน</div>;

  const initials = student.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white";

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "info",      label: "ข้อมูลส่วนตัว",   icon: <User className="w-4 h-4" /> },
    { key: "parent",    label: "ผู้ปกครอง",         icon: <Phone className="w-4 h-4" /> },
    { key: "groups",    label: "กลุ่ม / แท็ก",      icon: <Tag className="w-4 h-4" /> },
    { key: "documents", label: "เอกสาร",             icon: <FileText className="w-4 h-4" /> },
    { key: "progress",  label: "ความก้าวหน้า",       icon: <TrendingUp className="w-4 h-4" /> },
  ];

  const handleTabChange = (t: Tab) => {
    setTab(t);
    if (t === "progress" && !progress && !loadingProg) {
      setLoadingProg(true);
      fetch(`/api/admin/students/${id}/progress`)
        .then((r) => r.json())
        .then((d) => setProgress(Array.isArray(d) ? d : []))
        .finally(() => setLoadingProg(false));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/admin/students" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> กลับรายชื่อนักเรียน
      </Link>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
              {form.profileImage ? (
                <Image src={form.profileImage} alt={student.name} width={80} height={80} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-indigo-600">{initials}</span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">{student.name}</h1>
            {student.nickname && <p className="text-sm text-gray-400 mt-0.5">ชื่อเล่น: {student.nickname}</p>}
            <div className="flex flex-wrap gap-2 mt-2">
              {student.gradeLevel && (
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full">{student.gradeLevel}</span>
              )}
              {(student.groups ?? []).map((g) => (
                <span key={g} className="px-2.5 py-1 bg-violet-50 text-violet-700 text-xs rounded-full border border-violet-100">{g}</span>
              ))}
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${student.status === "approved" ? "bg-green-100 text-green-700" : student.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                {student.status === "approved" ? "อนุมัติแล้ว" : student.status === "pending" ? "รอการอนุมัติ" : "ถูกปฏิเสธ"}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              สมัครเมื่อ {new Date(student.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60 transition-colors"
            style={{ background: "linear-gradient(90deg,#4f46e5,#7c3aed)" }}
          >
            {saving  ? <Loader2 className="w-4 h-4 animate-spin" /> :
             saved   ? <CheckCircle2 className="w-4 h-4" /> :
             <Save className="w-4 h-4" />}
            {saving ? "กำลังบันทึก..." : saved ? "บันทึกแล้ว!" : "บันทึก"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === t.key ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.icon} <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab: ข้อมูลส่วนตัว */}
      {tab === "info" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อเล่น</label>
              <input value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} className={inputCls} placeholder="ชื่อเล่น" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">เบอร์โทรศัพท์</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} placeholder="0X-XXXX-XXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">วันเกิด</label>
              <input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ระดับชั้น</label>
              <select value={form.gradeLevel} onChange={(e) => setForm({ ...form, gradeLevel: e.target.value })} className={inputCls}>
                <option value="">— ไม่ระบุ —</option>
                {GRADE_LEVELS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">สถานะ</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Student["status"] })} className={inputCls}>
                <option value="approved">อนุมัติแล้ว</option>
                <option value="pending">รอการอนุมัติ</option>
                <option value="rejected">ถูกปฏิเสธ</option>
              </select>
            </div>
          </div>
          <div className="border border-gray-100 rounded-2xl p-4 space-y-3 bg-gray-50/50">
            <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" /> ที่อยู่
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">เลขที่</label>
                <input
                  value={form.houseNumber}
                  onChange={(e) => setForm({ ...form, houseNumber: e.target.value })}
                  className={inputCls}
                  placeholder="เช่น 123 หมู่ 4"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">อาคาร / หมู่บ้าน</label>
                <input
                  value={form.building}
                  onChange={(e) => setForm({ ...form, building: e.target.value })}
                  className={inputCls}
                  placeholder="เช่น คอนโดA, หมู่บ้านB"
                />
              </div>
              <div className="relative">
                <label className="block text-xs text-gray-500 mb-1">จังหวัด</label>
                <input
                  value={provinceInput}
                  onChange={(e) => {
                    setProvinceInput(e.target.value);
                    setForm((f) => ({ ...f, province: "", amphoe: "", subDistrict: "" }));
                    setShowProvDrop(true);
                  }}
                  onFocus={() => setShowProvDrop(true)}
                  onBlur={() => setTimeout(() => setShowProvDrop(false), 150)}
                  className={inputCls}
                  placeholder="พิมพ์ค้นหาจังหวัด..."
                  autoComplete="off"
                />
                {showProvDrop && (
                  <div className="absolute z-50 w-full mt-1 max-h-52 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg">
                    {THAI_PROVINCES.filter((p) =>
                      !provinceInput || provinceInput === form.province || p.includes(provinceInput)
                    ).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onMouseDown={() => {
                          setForm((f) => ({ ...f, province: p, amphoe: "", subDistrict: "" }));
                          setProvinceInput(p);
                          setShowProvDrop(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          form.province === p
                            ? "bg-indigo-50 text-indigo-700 font-medium"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    {THAI_PROVINCES.filter((p) => p.includes(provinceInput)).length === 0 && provinceInput && provinceInput !== form.province && (
                      <p className="px-4 py-2 text-sm text-gray-400">ไม่พบจังหวัด</p>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">อำเภอ / เขต</label>
                {form.province && (THAI_DISTRICTS[form.province]?.length ?? 0) > 0 ? (
                  <select
                    value={form.amphoe}
                    onChange={(e) => setForm((f) => ({ ...f, amphoe: e.target.value, subDistrict: "" }))}
                    className={inputCls}
                  >
                    <option value="">— เลือกอำเภอ —</option>
                    {THAI_DISTRICTS[form.province].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={form.amphoe}
                    onChange={(e) => setForm({ ...form, amphoe: e.target.value })}
                    className={inputCls}
                    placeholder="อำเภอ / เขต"
                  />
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">ตำบล / แขวง</label>
                {form.amphoe && (THAI_SUB_DISTRICTS[`${form.province}|${form.amphoe}`]?.length ?? 0) > 0 ? (
                  <select
                    value={form.subDistrict}
                    onChange={(e) => setForm((f) => ({ ...f, subDistrict: e.target.value }))}
                    className={inputCls}
                  >
                    <option value="">— เลือกตำบล —</option>
                    {THAI_SUB_DISTRICTS[`${form.province}|${form.amphoe}`].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={form.subDistrict}
                    onChange={(e) => setForm((f) => ({ ...f, subDistrict: e.target.value }))}
                    className={inputCls}
                    placeholder="ตำบล / แขวง"
                  />
                )}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">อีเมล</label>
            <div className="border border-gray-100 rounded-xl px-4 py-2.5 bg-gray-50 text-sm text-gray-400">{student.email}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">หมายเหตุ (admin)</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3} className={`${inputCls} resize-none`} placeholder="บันทึกหมายเหตุสำหรับ admin..." />
          </div>
        </div>
      )}

      {/* Tab: ผู้ปกครอง */}
      {tab === "parent" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อผู้ปกครอง</label>
              <input value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} className={inputCls} placeholder="ชื่อ-นามสกุลผู้ปกครอง" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">เบอร์โทรผู้ปกครอง</label>
              <input value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} className={inputCls} placeholder="0X-XXXX-XXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ความสัมพันธ์</label>
              <select value={form.parentRelation} onChange={(e) => setForm({ ...form, parentRelation: e.target.value })} className={inputCls}>
                <option value="">— ไม่ระบุ —</option>
                <option value="father">บิดา</option>
                <option value="mother">มารดา</option>
                <option value="guardian">ผู้ปกครอง</option>
                <option value="other">อื่น ๆ</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab: กลุ่ม */}
      {tab === "groups" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <p className="text-sm text-gray-500">จัดกลุ่มนักเรียน เช่น "TGAT 2025", "ม.3/1", "คณิต เข้มข้น"</p>
          <div className="flex gap-2">
            <input
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGroup()}
              className={`${inputCls} flex-1`}
              placeholder="ชื่อกลุ่ม..."
            />
            <button onClick={addGroup} className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> เพิ่ม
            </button>
          </div>
          <div className="flex flex-wrap gap-2 min-h-[48px]">
            {groups.length === 0 ? (
              <p className="text-sm text-gray-300">ยังไม่มีกลุ่ม</p>
            ) : groups.map((g) => (
              <span key={g} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 text-sm rounded-full border border-violet-200">
                {g}
                <button onClick={() => removeGroup(g)} className="text-violet-400 hover:text-violet-700 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-400">กด Enter หรือปุ่ม "เพิ่ม" เพื่อเพิ่มกลุ่ม แล้วกด "บันทึก" ที่ด้านบน</p>
        </div>
      )}

      {/* Tab: เอกสาร */}
      {tab === "documents" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          {/* Upload form */}
          <div className="border border-dashed border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
            <p className="text-sm font-medium text-gray-700">เพิ่มเอกสาร</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">ชื่อเอกสาร</label>
                <input value={docName} onChange={(e) => setDocName(e.target.value)} className={inputCls} placeholder="เช่น สำเนาบัตรประชาชน" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">ประเภท</label>
                <select value={docType} onChange={(e) => setDocType(e.target.value)} className={inputCls}>
                  {DOC_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <input ref={docFileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleDocFileChange} />
              <button
                onClick={() => docFileRef.current?.click()}
                disabled={uploading2}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 bg-white hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                {uploading2 ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading2 ? "กำลังอัปโหลด..." : docUrl ? "เลือกไฟล์ใหม่" : "เลือกไฟล์"}
              </button>
              {docUrl && <span className="text-xs text-green-600 self-center">✓ อัปโหลดแล้ว</span>}
              <button
                onClick={handleAddDoc}
                disabled={!docName || !docUrl}
                className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-40"
              >
                <Plus className="w-4 h-4" /> บันทึกเอกสาร
              </button>
            </div>
          </div>

          {/* Document list */}
          <div className="space-y-2">
            {(!student.documents || student.documents.length === 0) ? (
              <p className="text-center text-sm text-gray-300 py-8">ยังไม่มีเอกสาร</p>
            ) : student.documents.map((doc) => {
              const typeLabel = DOC_TYPES.find((t) => t.value === doc.type)?.label ?? doc.type;
              return (
                <div key={doc._id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <FileText className="w-8 h-8 text-indigo-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-400">{typeLabel} · {new Date(doc.uploadedAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer"
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="เปิดเอกสาร">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button onClick={() => handleDeleteDoc(doc._id)}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="ลบเอกสาร">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: ความก้าวหน้า */}
      {tab === "progress" && (
        <div className="space-y-4">
          {loadingProg ? (
            <LoadingSpinner />
          ) : !progress || progress.length === 0 ? (
            <div className="text-center py-16 text-gray-300 bg-white rounded-2xl border border-gray-100">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">นักเรียนยังไม่ได้ลงทะเบียนคอร์สใดเลย</p>
            </div>
          ) : progress.map((cp) => (
            <div key={cp.courseId} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" /> {cp.courseTitle}
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {/* Video */}
                <div className="bg-violet-50 rounded-xl p-3">
                  <Video className="w-4 h-4 text-violet-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{cp.video.watched}/{cp.video.total}</p>
                  <p className="text-xs text-gray-500">คลิปที่ดูแล้ว</p>
                  {cp.video.total > 0 && (
                    <div className="mt-1.5 h-1.5 bg-violet-100 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-400 rounded-full" style={{ width: `${Math.round((cp.video.watched / cp.video.total) * 100)}%` }} />
                    </div>
                  )}
                </div>
                {/* Homework */}
                <div className="bg-amber-50 rounded-xl p-3">
                  <FileText className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{cp.homework.filter((h) => h.sub).length}/{cp.homework.length}</p>
                  <p className="text-xs text-gray-500">ส่งการบ้าน</p>
                </div>
                {/* Quiz */}
                <div className="bg-rose-50 rounded-xl p-3">
                  <PenLine className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{cp.quiz.filter((q) => q.attempt).length}/{cp.quiz.length}</p>
                  <p className="text-xs text-gray-500">ทำข้อสอบ</p>
                </div>
                {/* Attendance */}
                <div className="bg-green-50 rounded-xl p-3">
                  <ClipboardCheck className="w-4 h-4 text-green-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{cp.attendance.length}</p>
                  <p className="text-xs text-gray-500">เข้าเรียน</p>
                </div>
              </div>

              {/* Homework detail */}
              {cp.homework.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">การบ้าน</p>
                  <div className="space-y-1.5">
                    {cp.homework.map((hw, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${hw.sub ? "bg-green-100" : "bg-gray-100"}`}>
                          {hw.sub ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <span className="w-2 h-2 bg-gray-300 rounded-full" />}
                        </span>
                        <span className="flex-1 text-gray-700 truncate">{hw.title}</span>
                        {hw.sub?.status === "graded" && hw.sub.score !== undefined && (
                          <span className="text-xs font-semibold text-indigo-600 shrink-0">{hw.sub.score}/{hw.maxScore}</span>
                        )}
                        {hw.sub?.status === "submitted" && <span className="text-xs text-amber-500 shrink-0">รอตรวจ</span>}
                        {!hw.sub && <span className="text-xs text-gray-400 shrink-0">ยังไม่ส่ง</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quiz detail */}
              {cp.quiz.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">ข้อสอบ</p>
                  <div className="space-y-1.5">
                    {cp.quiz.map((q, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${q.attempt ? (q.attempt.percentage >= 60 ? "bg-green-100" : "bg-red-100") : "bg-gray-100"}`}>
                          {q.attempt
                            ? q.attempt.percentage >= 60
                              ? <CheckCircle2 className="w-3 h-3 text-green-500" />
                              : <span className="w-2 h-2 bg-red-400 rounded-full" />
                            : <span className="w-2 h-2 bg-gray-300 rounded-full" />}
                        </span>
                        <span className="flex-1 text-gray-700 truncate">{q.title}</span>
                        {q.attempt
                          ? <span className={`text-xs font-semibold shrink-0 ${q.attempt.percentage >= 80 ? "text-green-500" : q.attempt.percentage >= 60 ? "text-yellow-500" : "text-red-400"}`}>
                              {q.attempt.score}/{q.attempt.totalPoints} ({q.attempt.percentage}%)
                            </span>
                          : <span className="text-xs text-gray-400 shrink-0">ยังไม่ทำ</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
