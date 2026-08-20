"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ICourse, GradeLevel } from "@/types";
import { Plus, Trash2, Upload, BookOpen, RefreshCw, ExternalLink, Pencil, X } from "lucide-react";
import Toast from "@/components/ui/Toast";
import RichTextEditor from "@/components/RichTextEditor";

interface ContentOption { _id: string; name: string; description: string; type?: "online" | "live online" | "onsite"; }

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

interface Lesson {
  id: string;
  name: string;
  videoLink: string;
  duration: string;
}

interface CourseFormProps {
  course?: ICourse;
  mode: "create" | "edit";
  courseType?: "online" | "onsite" | "live online";
  teacherMode?: boolean;
  teacherName?: string;
  redirectUrl?: string;
}

export default function CourseForm({ course, mode, courseType, teacherMode = false, teacherName = "", redirectUrl = "/admin/courses" }: CourseFormProps) {
  const router = useRouter();
  const fileRef    = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: course?.title ?? "",
    description: course?.description ?? "",
    coverImage: course?.coverImage ?? "",
    gradeLevels: course?.gradeLevels ?? [] as GradeLevel[],
    instructor: course?.instructor ?? (teacherMode ? teacherName : ""),
    category: course?.category && typeof course.category === "object" ? (course.category as any)._id : (course?.category as string) ?? "",
    price: course?.price ?? 0,
    originalPrice: course?.originalPrice ?? 0,
    isActive: course?.isActive ?? true,
    linkDigital: course?.linkDigital ?? "",
    linkClip: course?.linkClip ?? "",
    linkSupplementary: course?.linkSupplementary ?? "",
    linkFullbook: course?.linkFullbook ?? "",
    linkDownload: course?.linkDownload ?? "",
    ebookPdfUrl: course?.ebookPdfUrl ?? "",
    courseType: (courseType ?? course?.type ?? "online") as "online" | "onsite" | "live online",
    duration: course?.duration ?? 0,
    difficulty: (course as any)?.difficulty ?? "medium",
  });

  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState(0);

  const [contentId, setContentId] = useState<string>(course?.contentId ?? "");
  const [contentOptions, setContentOptions] = useState<ContentOption[]>([]);

  const [sessions, setSessions] = useState<Session[]>(
    course?.sessions?.map((s) => ({
      date: new Date(s.date).toISOString().slice(0, 10),
      startTime: s.startTime,
      endTime: s.endTime,
      maxCapacity: s.maxCapacity,
      zoomLink: s.zoomLink ?? "",
    })) ?? [{ date: "", startTime: "09:00", endTime: "11:00", maxCapacity: 10, zoomLink: "" }]
  );

  const [whatYouWillLearn, setWhatYouWillLearn] = useState<string>((course as any)?.whatYouWillLearn ?? "");
  const [courseDetails, setCourseDetails] = useState<string>((course as any)?.courseDetails ?? "");
  const [lessons, setLessons] = useState<Lesson[]>((course as any)?.lessons ?? []);

  const [loading, setLoading]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState("");
  const [toast, setToast]       = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [categories, setCategories] = useState<{ name: string; _id: string }[]>([]);
  const closeToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (!teacherMode) {
      fetch("/api/admin/users/teachers")
        .then((r) => r.json())
        .then((data) => { if (Array.isArray(data)) setTeachers(data); });
    }
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data.contents)) setContentOptions(data.contents); });
    
    // Fetch categories by selected courseType
    const categoryType = form.courseType === "online" ? "online" : form.courseType === "live online" ? "live online" : "onsite";
    fetch(`/api/categories?type=${categoryType}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      })
      .catch((err) => console.error("Failed to load categories:", err));
  }, [form.courseType, teacherMode]);

  useEffect(() => {
    if (!contentId) return;
    fetch(`/api/admin/content/${contentId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.content && data.content.lessons && Array.isArray(data.content.lessons)) {
          const contentLessons = data.content.lessons.map((l: any) => ({
            id: Math.random().toString(36).substr(2, 9),
            name: l.name || "",
            videoLink: l.videoLink || "",
            duration: l.duration || "",
          }));
          setLessons(contentLessons);
        }
      })
      .catch((err) => console.error("Failed to load content:", err));
  }, [contentId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description?.trim()) {
      const msg = "กรุณาระบุคำอธิบายคอร์ส";
      setError(msg);
      setToast({ message: msg, type: "error" });
      return;
    }
    if (form.gradeLevels.length === 0) {
      const msg = "กรุณาเลือกระดับชั้นอย่างน้อย 1 ระดับ";
      setError(msg);
      setToast({ message: msg, type: "error" });
      return;
    }
    if (form.courseType === "live online" && sessions.some((s) => !s.date)) {
      const msg = "กรุณากรอกวันที่ทุกรอบ";
      setError(msg);
      setToast({ message: msg, type: "error" });
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { courseType, ...formData } = form;

      // Auto-calculate course duration from lessons if not manually set
      let courseDuration = formData.duration;
      if (lessons.length > 0) {
        const lessonsDuration = lessons.reduce((sum, lesson) => {
          const duration = lesson.duration ? parseInt(lesson.duration) : 0;
          return sum + duration;
        }, 0);
        if (lessonsDuration > 0) {
          courseDuration = lessonsDuration;
        }
      }

      const payload: any = {
        ...formData,
        type: courseType,
        duration: courseDuration,
        contentId: contentId || null,
        whatYouWillLearn,
        courseDetails,
        lessons,
      };
      if (courseType === "live online") {
        payload.sessions = sessions;
      }
      const url = mode === "create" ? "/api/admin/courses" : `/api/admin/courses/${course?._id}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error ?? "เกิดข้อผิดพลาด";
        setError(msg);
        setToast({ message: msg, type: "error" });
      } else {
        setError("");
        setToast({ message: mode === "create" ? "สร้างคอร์สสำเร็จ!" : "บันทึกสำเร็จ!", type: "success" });
        setTimeout(() => router.push(redirectUrl), 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      <form onSubmit={handleSubmit} className="space-y-8">
      {/* Cover image + Course type badge */}
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-3">รูปปกคอร์ส</label>
          <div className="relative w-full h-[28rem] rounded-xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 group">
          {form.coverImage ? (
            <>
              <Image src={form.coverImage} alt="cover" fill className="object-cover" />
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <button
                type="button"
                onClick={() => setForm({ ...form, coverImage: "" })}
                className="absolute bottom-3 right-3 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex flex-col items-center gap-2 px-6 py-4"
              >
                <Upload className="w-8 h-8 text-indigo-400" />
                <span className="text-sm text-indigo-600 font-medium">
                  {uploading ? "กำลังอัปโหลด..." : "อัปโหลดรูปปก"}
                </span>
              </button>
              <p className="text-xs text-gray-400 mt-2">JPG, PNG, WebP ขนาดไม่เกิน 10MB</p>
            </div>
          )}
          </div>
        </div>

        {/* Course type badge */}
        <div className="flex-shrink-0 mt-3">
          {mode === "edit" && (
            <span className="text-xs font-semibold text-indigo-700 px-2 py-1 bg-indigo-100 rounded-lg whitespace-nowrap">
              {form.courseType === "online" ? "🌐 Online" : form.courseType === "live online" ? "🎬 Live" : "🏢 Onsite"}
            </span>
          )}
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
          <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
            <option value="">-- เลือกหมวดหมู่ --</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Discount Calculator */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ส่วนลด</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ราคาเต็ม (บาท)</label>
                <input
                  type="number"
                  min={0}
                  value={form.originalPrice === 0 ? "" : form.originalPrice}
                  onChange={(e) => setForm({ ...form, originalPrice: e.target.value === "" ? 0 : Number(e.target.value) })}
                  className={inputClass}
                  placeholder="ราคาปกติ"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ประเภทส่วนลด</label>
                <select
                  value={discountType}
                  onChange={(e) => {
                    setDiscountType(e.target.value as "percentage" | "fixed");
                    setDiscountValue(0);
                  }}
                  className={inputClass}
                >
                  <option value="percentage">% ส่วนลดแบบเปอร์เซ็นต์</option>
                  <option value="fixed">จำนวน ส่วนลดแบบเงินสด</option>
                </select>
              </div>
            </div>

            {/* Discount Input */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {discountType === "percentage" ? "ส่วนลด (%)" : "ส่วนลด (บาท)"}
                </label>
                <input
                  type="number"
                  min={0}
                  max={discountType === "percentage" ? 100 : form.originalPrice}
                  value={discountValue === 0 ? "" : discountValue}
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : Number(e.target.value);
                    setDiscountValue(val);
                    // Auto-calculate price
                    if (form.originalPrice > 0) {
                      const discountedPrice = discountType === "percentage"
                        ? form.originalPrice * (1 - val / 100)
                        : form.originalPrice - val;
                      setForm({ ...form, price: Math.max(0, Math.round(discountedPrice)) });
                    }
                  }}
                  className={inputClass}
                  placeholder={discountType === "percentage" ? "เช่น 10" : "เช่น 100"}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ราคาหลังหักส่วนลด (บาท)</label>
                <input
                  type="number"
                  min={0}
                  value={form.price === 0 ? "" : form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value === "" ? 0 : Number(e.target.value) })}
                  className={inputClass}
                  placeholder="ราคาขาย"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">เวลาในการเรียน (นาที)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.duration === 0 ? "" : form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value === "" ? 0 : Number(e.target.value) })}
            placeholder="เช่น 120 หรือ 29.36"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">ระดับความยาก</label>
          <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className={inputClass}>
            <option value="easy">ง่าย</option>
            <option value="medium">ปานกลาง</option>
            <option value="hard">ยาก</option>
          </select>
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

      {/* What you will learn */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">คอร์สนี้ได้เรียนอะไรบ้าง? *</label>
        <RichTextEditor key={`whatYouWillLearn-${course?._id || 'new'}`} value={whatYouWillLearn} onChange={setWhatYouWillLearn} />
      </div>

      {/* Course details */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">รายละเอียดคอร์สเรียน *</label>
        <RichTextEditor key={`courseDetails-${course?._id || 'new'}`} value={courseDetails} onChange={setCourseDetails} />
      </div>

      {/* Lessons */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700">รายละเอียดบทเรียน</label>
          <button
            type="button"
            onClick={() => setLessons([...lessons, { id: Date.now().toString(), name: "", videoLink: "", duration: "" }])}
            className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            เพิ่มบทเรียน
          </button>
        </div>
        <div className="space-y-2">
          {lessons.map((lesson, idx) => (
            <div key={lesson.id} className="space-y-1.5">
              <div className="flex items-end gap-2">
                <div style={{ flex: "1.5" }} className="min-w-0">
                  <input
                    type="text"
                    value={lesson.name}
                    onChange={(e) => setLessons(lessons.map((l, i) => i === idx ? { ...l, name: e.target.value } : l))}
                    placeholder="ชื่อบทเรียน"
                    className={inputClass}
                  />
                </div>
                <div style={{ flex: "1" }} className="min-w-0">
                  <input
                    type="url"
                    value={lesson.videoLink}
                    onChange={(e) => setLessons(lessons.map((l, i) => i === idx ? { ...l, videoLink: e.target.value } : l))}
                    placeholder="ลิงค์วิดีโอ"
                    className={inputClass}
                  />
                </div>
                <div className="w-20 shrink-0">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={lesson.duration}
                    onChange={(e) => setLessons(lessons.map((l, i) => i === idx ? { ...l, duration: e.target.value } : l))}
                    placeholder="เวลา"
                    className="w-full px-2 py-2.5 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setLessons(lessons.filter((_, i) => i !== idx))}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={(lesson as any).section || ""}
                onChange={(e) => setLessons(lessons.map((l, i) => i === idx ? { ...l, section: e.target.value } : l))}
                className={`${inputClass} text-sm`}
                placeholder="หมวดเนื้อหา (เช่น บทที่ 1, Introduction)"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Sessions - only for live online courses */}
      {form.courseType === "live online" && (
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
      )}

      {/* ── เนื้อหาการเรียน ── */}
      <div className="border border-green-200 bg-green-50 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-green-800">เนื้อหาการเรียน</h3>
            <p className="text-xs text-green-600 mt-0.5">เลือกชุดเนื้อหาที่จะใช้กับคอร์สนี้ (แสดงเฉพาะประเภท {form.courseType === "live online" ? "Live Online" : form.courseType === "online" ? "คอร์สออนไลน์" : "Onsite"})</p>
          </div>
          <Link
            href="/admin/content/new"
            target="_blank"
            className="flex items-center gap-1 text-xs text-green-700 hover:text-green-900 font-medium"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            จัดการชุดเนื้อหา
          </Link>
        </div>

        <div>
          {(() => {
            const filteredContents = contentOptions.filter((c) => !c.type || c.type === form.courseType);
            return (
              <>
                <select
                  value={contentId}
                  onChange={(e) => setContentId(e.target.value)}
                  className={`${inputClass} bg-white`}
                >
                  <option value="">— ไม่ใช้ชุดเนื้อหา —</option>
                  {filteredContents.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                      {c.description ? ` — ${c.description}` : ""}
                    </option>
                  ))}
                </select>
                {filteredContents.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1.5">
                    ยังไม่มีชุดเนื้อหา{" "}
                    <Link href="/admin/content/new" target="_blank" className="text-green-600 underline">
                      สร้างชุดเนื้อหาใหม่
                    </Link>
                  </p>
                )}
              </>
            );
          })()}
        </div>

        {contentId && (
          <div className="flex items-center gap-2 text-xs text-green-700 bg-green-100 rounded-xl px-3 py-2">
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>
              ใช้ชุดเนื้อหา: <strong>{contentOptions.find((c) => c._id === contentId)?.name}</strong>
            </span>
            <Link
              href={`/admin/content/${contentId}`}
              target="_blank"
              className="ml-auto flex items-center gap-1 hover:underline"
            >
              <Pencil className="w-3 h-3" />
              แก้ไข
            </Link>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-4 rounded-xl border-2 border-red-400 mb-6 font-semibold">
          ⚠️ {error}
        </div>
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
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
        >
          ยกเลิก
        </button>
      </div>
    </form>
    </>
  );
}

