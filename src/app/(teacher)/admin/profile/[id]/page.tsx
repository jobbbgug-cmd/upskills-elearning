"use client";
import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, Camera, Loader2, CheckCircle2, User, Phone, MapPin,
  FileText, Tag, Save, Trash2, Upload, ExternalLink, Plus, X, TrendingUp,
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "parent" | "admin" | "owner" | "super_admin";
  phone?: string;
  profileImage?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  // Parent-specific
  studentId?: string;
  studentName?: string;
  // Student-specific
  gradeLevel?: string;
  parentName?: string;
  parentPhone?: string;
  parentRelation?: string;
  groups?: string[];
  documents?: StudentDoc[];
}

interface StudentDoc {
  _id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: string;
}

type Tab = "info" | "documents" | "students" | "parent" | "groups" | "progress";

const DOC_TYPES = [
  { value: "id_card",     label: "สำเนาบัตรประชาชน" },
  { value: "photo",       label: "รูปถ่าย" },
  { value: "transcript",  label: "ใบแสดงผลการเรียน" },
  { value: "other",       label: "เอกสารอื่น ๆ" },
];

const GRADE_LEVELS = [
  "ป.1","ป.2","ป.3","ป.4","ป.5","ป.6",
  "ม.1","ม.2","ม.3","ม.4","ม.5","ม.6",
  "ปวช.","ปวส.","มหาวิทยาลัย","ทั่วไป",
];

const PARENT_RELATIONS: Record<string, string> = {
  father: "บิดา",
  mother: "มารดา",
  guardian: "ผู้ปกครอง",
  other: "อื่น ๆ",
};

interface StudentItem {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  gradeLevel?: string;
}

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("info");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [myRole, setMyRole] = useState<string>("");

  // Form fields
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    profileImage: "",
  });

  // Parent's students list
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Document management
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("other");
  const [docUrl, setDocUrl] = useState("");
  const [uploading2, setUploading2] = useState(false);
  const [documents, setDocuments] = useState<StudentDoc[]>([]);

  // Student-specific
  const [groups, setGroups] = useState<string[]>([]);
  const [newGroup, setNewGroup] = useState("");
  const [progress, setProgress] = useState<any[] | null>(null);
  const [loadingProg, setLoadingProg] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const docFileRef = useRef<HTMLInputElement>(null);

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white";

  useEffect(() => {
    const loadData = async () => {
      const [userRes, meRes] = await Promise.all([
        fetch(`/api/admin/users/${id}`),
        fetch("/api/auth/me"),
      ]);

      if (userRes.ok) {
        const d: UserProfile = await userRes.json();
        setUser(d);
        setForm({
          name: d.name ?? "",
          email: d.email ?? "",
          phone: d.phone ?? "",
          profileImage: d.profileImage ?? "",
        });
        setDocuments(d.documents ?? []);
        setGroups(d.groups ?? []);
      }

      if (meRes.ok) {
        const meData = await meRes.json();
        setMyRole(meData.user?.role ?? "");
      }

      setLoading(false);
    };

    loadData();
  }, [id]);

  useEffect(() => {
    if (user?.role === "parent") {
      loadParentStudents();
    }
  }, [user?.role, id]);

  const loadParentStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await fetch(`/api/admin/users/${id}/students`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setStudents(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load students:", err);
    }
    setLoadingStudents(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setForm((f) => ({ ...f, profileImage: data.url }));
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        phone: form.phone,
        profileImage: form.profileImage,
      }),
    });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  const handleDocFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading2(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) {
      setDocUrl(data.url);
      if (!docName) setDocName(file.name.replace(/\.[^/.]+$/, ""));
    }
    setUploading2(false);
  };

  const handleAddDoc = async () => {
    if (!docName || !docUrl) return;
    const res = await fetch(`/api/admin/users/${id}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: docName, url: docUrl, type: docType }),
    });
    if (res.ok) {
      const doc = await res.json();
      setDocuments([...documents, doc]);
      setDocName("");
      setDocUrl("");
      setDocType("other");
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    const res = await fetch(`/api/admin/users/${id}/documents/${docId}`, { method: "DELETE" });
    if (res.ok) {
      setDocuments(documents.filter((d) => d._id !== docId));
    }
  };

  const addGroup = () => {
    const g = newGroup.trim();
    if (!g || groups.includes(g)) return;
    setGroups([...groups, g]);
    setNewGroup("");
  };

  const removeGroup = (g: string) => setGroups(groups.filter((x) => x !== g));

  if (loading) return <LoadingSpinner />;
  if (!user) return <div className="text-center py-20 text-gray-400">ไม่พบผู้ใช้</div>;

  const initials = user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const getTabs = (): { key: Tab; label: string; icon: React.ReactNode }[] => {
    if (user?.role === "parent") {
      return [
        { key: "info",      label: "ข้อมูลส่วนตัว", icon: <User className="w-4 h-4" /> },
        { key: "students",  label: "นักเรียน",      icon: <Phone className="w-4 h-4" /> },
        { key: "documents", label: "เอกสาร",        icon: <FileText className="w-4 h-4" /> },
      ];
    }
    if (user?.role === "student") {
      return [
        { key: "info",      label: "ข้อมูลส่วนตัว",   icon: <User className="w-4 h-4" /> },
        { key: "parent",    label: "ผู้ปกครอง",      icon: <Phone className="w-4 h-4" /> },
        { key: "groups",    label: "กลุ่ม / แท็ก",   icon: <Tag className="w-4 h-4" /> },
        { key: "documents", label: "เอกสาร",         icon: <FileText className="w-4 h-4" /> },
        { key: "progress",  label: "ความก้าวหน้า",   icon: <TrendingUp className="w-4 h-4" /> },
      ];
    }
    return [
      { key: "info",      label: "ข้อมูลส่วนตัว", icon: <User className="w-4 h-4" /> },
      { key: "documents", label: "เอกสาร",        icon: <FileText className="w-4 h-4" /> },
    ];
  };

  const TABS = getTabs();

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

  const roleLabel: Record<string, string> = {
    student: "นักเรียน",
    teacher: "ครู",
    parent: "ผู้ปกครอง",
    admin: "Admin",
    owner: "Owner",
    super_admin: "Super Admin",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> กลับรายชื่อผู้ใช้
      </Link>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full theme-card flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
              {form.profileImage ? (
                <Image src={form.profileImage} alt={user.name} width={80} height={80} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold theme-link">{initials}</span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-7 h-7 theme-button rounded-full flex items-center justify-center shadow transition-colors disabled:opacity-60"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">{user.name}</h1>
            <p className="text-sm text-gray-500">{roleLabel[user.role]}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${user.status === "approved" ? "bg-green-100 text-green-700" : user.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                {user.status === "approved" ? "อนุมัติแล้ว" : user.status === "pending" ? "รอการอนุมัติ" : "ถูกปฏิเสธ"}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              สมัครเมื่อ {new Date(user.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 theme-button rounded-xl text-sm font-semibold disabled:opacity-60 transition-colors"
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
              tab === t.key ? "theme-tab-active" : "text-gray-500 hover:text-gray-700"
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อ-นามสกุล</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">อีเมล</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} placeholder="user@gmail.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">เบอร์โทรศัพท์</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} placeholder="0X-XXXX-XXXX" />
            </div>
          </div>
        </div>
      )}

      {/* Tab: เอกสาร */}
      {tab === "documents" && (
        <div className="space-y-6">
          {/* Upload form */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">เพิ่มเอกสาร</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                className={inputCls}
                placeholder="ชื่อเอกสาร"
              />
              <select value={docType} onChange={(e) => setDocType(e.target.value)} className={inputCls}>
                {DOC_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <input
                  ref={docFileRef}
                  type="file"
                  onChange={handleDocFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => docFileRef.current?.click()}
                  disabled={uploading2}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {uploading2 ? <Loader2 className="w-4 h-4 animate-spin inline" /> : docUrl ? "✓ เลือกแล้ว" : "เลือกไฟล์"}
                </button>
              </div>
            </div>
            <button
              onClick={handleAddDoc}
              disabled={uploading2 || !docName || !docUrl}
              className="px-4 py-2.5 theme-button rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" /> เพิ่มเอกสาร
            </button>
          </div>

          {/* Documents list */}
          {documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc._id}
                  className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">{doc.name}</p>
                    <p className="text-xs text-gray-500">
                      {DOC_TYPES.find((t) => t.value === doc.type)?.label}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:theme-link transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDeleteDoc(doc._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">ไม่มีเอกสาร</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: นักเรียน (Parent only) */}
      {tab === "students" && user.role === "parent" && (
        <div className="space-y-4">
          {loadingStudents ? (
            <LoadingSpinner />
          ) : students.length > 0 ? (
            students.map((s) => (
              <Link
                key={s._id}
                href={`/admin/students/${s._id}`}
                className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-all flex items-center justify-between group theme-item-hover"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 group-hover-text">{s.name}</p>
                  <div className="flex gap-2 text-xs text-gray-500 mt-1">
                    {s.gradeLevel && <span>{s.gradeLevel}</span>}
                    {s.phone && <span>•</span>}
                    {s.phone && <span>{s.phone}</span>}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-300 group-hover-text transition-colors shrink-0 ml-2" />
              </Link>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">ไม่มีนักเรียน</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: ผู้ปกครอง (Student only) */}
      {tab === "parent" && user.role === "student" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อผู้ปกครอง</label>
              <input value={user.parentName ?? ""} className={inputCls + " opacity-50 cursor-not-allowed"} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">เบอร์โทรผู้ปกครอง</label>
              <input value={user.parentPhone ?? ""} className={inputCls + " opacity-50 cursor-not-allowed"} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ความสัมพันธ์</label>
              <input value={user.parentRelation ? PARENT_RELATIONS[user.parentRelation] || user.parentRelation : ""} className={inputCls + " opacity-50 cursor-not-allowed"} disabled placeholder="— ไม่ระบุ —" />
            </div>
          </div>
        </div>
      )}

      {/* Tab: กลุ่ม / แท็ก (Student only) */}
      {tab === "groups" && user.role === "student" && (
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
              <div key={g} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm border border-indigo-200">
                {g}
                <button onClick={() => removeGroup(g)} className="hover:text-indigo-900">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: ความก้าวหน้า (Student only) */}
      {tab === "progress" && user.role === "student" && (
        <div className="space-y-4">
          {loadingProg ? (
            <LoadingSpinner />
          ) : progress && progress.length > 0 ? (
            progress.map((course) => (
              <div key={course.courseId} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <h3 className="font-semibold text-gray-900">{course.courseTitle}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {course.video?.total > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">วิดีโอ</p>
                      <p className="text-lg font-bold text-indigo-600">{course.video.watched}/{course.video.total}</p>
                    </div>
                  )}
                  {course.homework?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">งานมอบหมาย</p>
                      <p className="text-lg font-bold text-green-600">{course.homework.filter((h: any) => h.sub).length}/{course.homework.length}</p>
                    </div>
                  )}
                  {course.quiz?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">ข้อสอบ</p>
                      <p className="text-lg font-bold text-purple-600">{course.quiz.filter((q: any) => q.attempt).length}/{course.quiz.length}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">ไม่มีข้อมูลความก้าวหน้า</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
