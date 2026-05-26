"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ICourse, GradeLevel, ISmartPpt, IYoutubeClip, IDownloadItem } from "@/types";
import { Plus, Trash2, Upload, BookOpen, RefreshCw } from "lucide-react";

interface Teacher { _id: string; name: string; email: string; }

function genJitsiLink() {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  const rand = Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `https://meet.jit.si/UPSkills-${rand}`;
}

const GRADE_LEVELS: GradeLevel[] = [
  "ป.1", "ป.2", "ป.3", "ป.4", "ป.5", "ป.6",
  "ม.1", "ม.2", "ม.3", "ม.4", "ม.5", "ม.6",
  "ปวช.", "ปวส.", "มหาวิทยาลัย", "ทั่วไป",
];

interface Session {
  date: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  zoomLink: string;
}

interface CourseFormProps {
  course?: ICourse;
  mode: "create" | "edit";
  teacherMode?: boolean;
  teacherName?: string;
}

export default function CourseForm({ course, mode, teacherMode = false, teacherName = "" }: CourseFormProps) {
  const router = useRouter();
  const fileRef    = useRef<HTMLInputElement>(null);
  const qrFileRef  = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: course?.title ?? "",
    description: course?.description ?? "",
    coverImage: course?.coverImage ?? "",
    gradeLevels: course?.gradeLevels ?? [] as GradeLevel[],
    instructor: course?.instructor ?? (teacherMode ? teacherName : ""),
    category: course?.category ?? "",
    price: course?.price ?? 0,
    isActive: course?.isActive ?? true,
    qrCodeImage: course?.qrCodeImage ?? "",
    bankAccount: course?.bankAccount ?? "",
    bankName: course?.bankName ?? "",
    linkDigital: course?.linkDigital ?? "",
    linkClip: course?.linkClip ?? "",
    linkSupplementary: course?.linkSupplementary ?? "",
    linkFullbook: course?.linkFullbook ?? "",
    linkDownload: course?.linkDownload ?? "",
    ebookPdfUrl: course?.ebookPdfUrl ?? "",
  });

  const [smartPpts, setSmartPpts] = useState<ISmartPpt[]>(course?.smartPpts ?? []);
  const [teachingClips, setTeachingClips] = useState<IYoutubeClip[]>(course?.teachingClips ?? []);
  const [summaryClips, setSummaryClips] = useState<IYoutubeClip[]>(course?.summaryClips ?? []);
  const [downloadFree, setDownloadFree] = useState<IDownloadItem[]>(course?.downloadFree ?? []);
  const [downloadTeacherCard, setDownloadTeacherCard] = useState<IDownloadItem[]>(course?.downloadTeacherCard ?? []);
  const [downloadAksorn, setDownloadAksorn] = useState<IDownloadItem[]>(course?.downloadAksorn ?? []);

  const [sessions, setSessions] = useState<Session[]>(
    course?.sessions?.map((s) => ({
      date: new Date(s.date).toISOString().slice(0, 10),
      startTime: s.startTime,
      endTime: s.endTime,
      maxCapacity: s.maxCapacity,
      zoomLink: s.zoomLink ?? "",
    })) ?? [{ date: "", startTime: "09:00", endTime: "11:00", maxCapacity: 10, zoomLink: "" }]
  );

  const [loading, setLoading]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    if (!teacherMode) {
      fetch("/api/admin/users/teachers")
        .then((r) => r.json())
        .then((data) => { if (Array.isArray(data)) setTeachers(data); });
    }
  }, [teacherMode]);

  const toggleGrade = (grade: GradeLevel) => {
    setForm((f) => ({
      ...f,
      gradeLevels: f.gradeLevels.includes(grade)
        ? f.gradeLevels.filter((g) => g !== grade)
        : [...f.gradeLevels, grade],
    }));
  };

  const updateSession = (i: number, field: keyof Session, value: string | number) => {
    setSessions((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };

  const addSession = () => {
    setSessions((prev) => [...prev, { date: "", startTime: "09:00", endTime: "11:00", maxCapacity: 10, zoomLink: "" }]);
  };

  const removeSession = (i: number) => {
    if (sessions.length <= 1) return;
    setSessions((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) setForm((f) => ({ ...f, coverImage: data.url }));
      else setError(data.error ?? "อัปโหลดล้มเหลว");
    } finally {
      setUploading(false);
    }
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) setForm((f) => ({ ...f, qrCodeImage: data.url }));
      else setError(data.error ?? "อัปโหลดล้มเหลว");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.gradeLevels.length === 0) { setError("กรุณาเลือกระดับชั้นอย่างน้อย 1 ระดับ"); return; }
    if (sessions.some((s) => !s.date)) { setError("กรุณากรอกวันที่ทุกรอบ"); return; }
    setLoading(true);
    setError("");
    try {
      const payload = { ...form, sessions, smartPpts, teachingClips, summaryClips, downloadFree, downloadTeacherCard, downloadAksorn };
      const url = mode === "create" ? "/api/admin/courses" : `/api/admin/courses/${course?._id}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "เกิดข้อผิดพลาด");
      else router.push("/admin/courses");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Cover image */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">รูปปกคอร์ส</label>
        <div className="flex gap-4 items-start">
          <div className="relative w-40 h-28 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 shrink-0">
            {form.coverImage ? (
              <Image src={form.coverImage} alt="cover" fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <BookOpen className="w-8 h-8 text-indigo-300" />
              </div>
            )}
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {uploading ? "กำลังอัปโหลด..." : "อัปโหลดรูปปก"}
            </button>
            <p className="text-xs text-gray-400 mt-2">JPG, PNG, WebP ขนาดไม่เกิน 10MB</p>
          </div>
        </div>
      </div>

      {/* Basic info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">ชื่อคอร์ส *</label>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="เช่น คณิตศาสตร์พื้นฐาน ม.1" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">คำอธิบาย *</label>
          <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} placeholder="อธิบายรายละเอียดของคอร์ส..." />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">ชื่อผู้สอน *</label>
          {teacherMode ? (
            <input
              value={form.instructor}
              readOnly
              className={`${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed`}
            />
          ) : (
            <select
              required
              value={form.instructor}
              onChange={(e) => setForm({ ...form, instructor: e.target.value })}
              className={inputClass}
            >
              <option value="">— เลือกครูผู้สอน —</option>
              {teachers.map((t) => (
                <option key={t._id} value={t.name}>
                  {t.name} ({t.email})
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">หมวดหมู่ *</label>
          <input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} placeholder="เช่น คณิตศาสตร์, ภาษาอังกฤษ" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">ราคา (บาท)</label>
          <input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={inputClass} />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded text-indigo-600" />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">เปิดให้จองได้</label>
        </div>
      </div>

      {/* Grade levels */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">ระดับชั้นที่เหมาะสม *</label>
        <div className="flex flex-wrap gap-2">
          {GRADE_LEVELS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => toggleGrade(g)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-colors ${
                form.gradeLevels.includes(g)
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700">รอบเรียน</label>
          <button type="button" onClick={addSession} className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            <Plus className="w-4 h-4" />
            เพิ่มรอบ
          </button>
        </div>
        <div className="space-y-4">
          {sessions.map((session, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">รอบที่ {i + 1}</span>
                {sessions.length > 1 && (
                  <button type="button" onClick={() => removeSession(i)} className="text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block">วันที่</label>
                  <input type="date" required value={session.date} onChange={(e) => updateSession(i, "date", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">เวลาเริ่ม</label>
                  <input type="time" value={session.startTime} onChange={(e) => updateSession(i, "startTime", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">เวลาสิ้นสุด</label>
                  <input type="time" value={session.endTime} onChange={(e) => updateSession(i, "endTime", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">ที่นั่งสูงสุด</label>
                  <input type="number" min={1} max={100} value={session.maxCapacity} onChange={(e) => updateSession(i, "maxCapacity", Number(e.target.value))} className={inputClass} />
                </div>
                <div className="md:col-span-3">
                  <label className="text-xs text-gray-500 mb-1 block">Jitsi Meet Link</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={session.zoomLink}
                      onChange={(e) => updateSession(i, "zoomLink", e.target.value)}
                      className={`${inputClass} flex-1`}
                      placeholder="https://meet.jit.si/UPSkills-..."
                    />
                    <button
                      type="button"
                      onClick={() => updateSession(i, "zoomLink", genJitsiLink())}
                      className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0"
                      title="สร้าง Jitsi link อัตโนมัติ"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      สร้าง Link
                    </button>
                  </div>
                  {session.zoomLink?.startsWith("https://meet.jit.si/") && (
                    <a
                      href={session.zoomLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline mt-1 inline-block truncate max-w-full"
                    >
                      ทดสอบเปิด link →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment info */}
      <div className="border border-amber-200 bg-amber-50 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-amber-800 mb-0.5">ข้อมูลการชำระเงิน</h3>
          <p className="text-xs text-amber-600">นักเรียนจะเห็นข้อมูลนี้หลังจองที่นั่งเพื่อโอนเงิน</p>
        </div>

        {/* QR Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">QR Code พร้อมเพย์ / ธนาคาร</label>
          <div className="flex gap-4 items-start">
            <div className="w-32 h-32 rounded-xl border-2 border-dashed border-amber-300 bg-white overflow-hidden flex items-center justify-center shrink-0">
              {form.qrCodeImage ? (
                <img src={form.qrCodeImage} alt="QR Code" className="w-full h-full object-contain p-1" />
              ) : (
                <span className="text-3xl">📷</span>
              )}
            </div>
            <div className="space-y-2">
              <input ref={qrFileRef} type="file" accept="image/*" className="hidden" onChange={handleQrUpload} />
              <button
                type="button"
                onClick={() => qrFileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-amber-300 rounded-xl text-sm text-amber-700 hover:border-amber-500 hover:text-amber-800 transition-colors disabled:opacity-50 bg-white"
              >
                <Upload className="w-4 h-4" />
                {uploading ? "กำลังอัปโหลด..." : "อัปโหลด QR Code"}
              </button>
              <p className="text-xs text-gray-400">รองรับ JPG, PNG ขนาดไม่เกิน 10MB</p>
            </div>
          </div>
        </div>

        {/* Bank info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">เลขที่บัญชี</label>
            <input
              value={form.bankAccount}
              onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
              className={inputClass}
              placeholder="เช่น 000-0-00000-0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อบัญชี</label>
            <input
              value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              className={inputClass}
              placeholder="เช่น นาย สมชาย ใจดี"
            />
          </div>
        </div>
      </div>

      {/* ── Quick links + ebook ── */}
      <div className="border border-blue-200 bg-blue-50 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-blue-800 mb-0.5">ลิงก์ปุ่มนำทาง (4 วงกลมสีส้ม)</h3>
          <p className="text-xs text-blue-600">ใส่ URL ภายนอก หรือเว้นว่างเพื่อใช้ anchor ในหน้าเรียน</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "สื่อดิจิทัล", key: "linkDigital" as const },
            { label: "คลิป", key: "linkClip" as const },
            { label: "สื่อประกอบการสอน", key: "linkSupplementary" as const },
            { label: "สื่อฯ เต็มเล่ม", key: "linkFullbook" as const },
            { label: "ดาวน์โหลดสื่อ (ปุ่มใหญ่)", key: "linkDownload" as const },
            { label: "e-Book PDF URL (กดหน้าปก)", key: "ebookPdfUrl" as const },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <input
                type="url"
                value={form[key] as string}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className={inputClass}
                placeholder="https://..."
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── เนื้อหาการเรียน ── */}
      <div className="border border-green-200 bg-green-50 rounded-2xl p-5 space-y-6">
        <h3 className="text-sm font-semibold text-green-800">เนื้อหาการเรียน</h3>

        {/* Smart PPT */}
        <ArraySection<ISmartPpt>
          title="Smart PPT"
          items={smartPpts}
          setItems={setSmartPpts}
          defaultItem={{ title: "", thumbnailUrl: "", pptUrl: "" }}
          inputClass={inputClass}
          fields={[
            { key: "title", label: "ชื่อ PPT", placeholder: "เช่น หน่วยที่ 1" },
            { key: "thumbnailUrl", label: "URL รูปปก", placeholder: "https://..." },
            { key: "pptUrl", label: "URL ไฟล์ PPT / Google Slides", placeholder: "https://..." },
          ]}
        />

        {/* คลิปประกอบการสอน */}
        <ArraySection<IYoutubeClip>
          title="คลิปประกอบการสอน"
          items={teachingClips}
          setItems={setTeachingClips}
          defaultItem={{ title: "", youtubeUrl: "" }}
          inputClass={inputClass}
          fields={[
            { key: "title", label: "ชื่อคลิป", placeholder: "เช่น หน่วยที่ 1 ตอนที่ 1" },
            { key: "youtubeUrl", label: "YouTube URL", placeholder: "https://youtu.be/..." },
          ]}
        />

        {/* คลิปอักษรเรียนสรุป */}
        <ArraySection<IYoutubeClip>
          title="คลิปอักษรเรียนสรุป"
          items={summaryClips}
          setItems={setSummaryClips}
          defaultItem={{ title: "", youtubeUrl: "" }}
          inputClass={inputClass}
          fields={[
            { key: "title", label: "ชื่อคลิป", placeholder: "เช่น สรุปหน่วยที่ 1" },
            { key: "youtubeUrl", label: "YouTube URL", placeholder: "https://youtu.be/..." },
          ]}
        />

        {/* Download groups */}
        {[
          { label: "สื่อประกอบการสอน [ดาวน์โหลดฟรี]", items: downloadFree, setItems: setDownloadFree },
          { label: "สื่อประกอบการสอน [เฉพาะลูกค้าอักษร (ยื่นบัตรครู)]", items: downloadTeacherCard, setItems: setDownloadTeacherCard },
          { label: "สื่อประกอบการสอน [เฉพาะลูกค้าอักษร]", items: downloadAksorn, setItems: setDownloadAksorn },
        ].map(({ label, items, setItems }) => (
          <ArraySection<IDownloadItem>
            key={label}
            title={label}
            items={items}
            setItems={setItems}
            defaultItem={{ title: "", thumbnailUrl: "", fileUrl: "" }}
            inputClass={inputClass}
            fields={[
              { key: "title", label: "ชื่อไฟล์", placeholder: "เช่น แผนการสอน" },
              { key: "thumbnailUrl", label: "URL รูปปก", placeholder: "https://..." },
              { key: "fileUrl", label: "URL ไฟล์ดาวน์โหลด", placeholder: "https://..." },
            ]}
          />
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-4 rounded-xl border border-red-200">{error}</div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "กำลังบันทึก..." : mode === "create" ? "สร้างคอร์ส" : "บันทึกการแก้ไข"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/courses")}
          className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  );
}

/* ── Reusable dynamic array section ── */
interface FieldDef { key: string; label: string; placeholder: string; }

function ArraySection<T extends object>({
  title, items, setItems, defaultItem, inputClass, fields,
}: {
  title: string;
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  defaultItem: T;
  inputClass: string;
  fields: FieldDef[];
}) {
  const add = () => setItems((prev) => [...prev, { ...defaultItem }]);
  const remove = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));
  const update = (i: number, key: string, value: string) =>
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [key]: value } as T : item));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-700">{title}</span>
        <button type="button" onClick={add} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
          <Plus className="w-3.5 h-3.5" /> เพิ่ม
        </button>
      </div>
      {items.length === 0 && (
        <p className="text-xs text-gray-400 italic">ยังไม่มีรายการ กด "+ เพิ่ม" เพื่อเพิ่ม</p>
      )}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 space-y-2">
            <div className="flex justify-end">
              <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className={`grid gap-2 ${fields.length >= 3 ? "grid-cols-1" : "grid-cols-2"}`}>
              {fields.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-gray-500 mb-0.5 block">{label}</label>
                  <input
                    value={(item as Record<string, string>)[key] ?? ""}
                    onChange={(e) => update(i, key, e.target.value)}
                    className={inputClass}
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
