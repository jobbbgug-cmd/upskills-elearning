"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Upload, Trash2 } from "lucide-react";
import Image from "next/image";
import Toast from "@/components/ui/Toast";
import RichTextEditor from "@/components/RichTextEditor";

interface Course {
  _id: string;
  title: string;
  instructor: string;
  price: number;
  duration?: number;
}

interface LearningPath {
  _id?: string;
  title: string;
  description: string;
  coverImage?: string;
  difficulty: string;
  courses: any[];
  estimatedHours?: number;
  price?: number;
  discount?: number;
  discountType?: "percentage" | "fixed";
  whoIsItSuitableFor?: string;
  whatYouWillLearn?: string;
}

interface LearningPathFormProps {
  path?: LearningPath;
  mode: "create" | "edit";
}

const calculateFinalPrice = (price: number, discount: number, discountType: string) => {
  if (discountType === "percentage") {
    return Math.max(0, price - (price * discount / 100));
  } else {
    return Math.max(0, price - discount);
  }
};

const formatDuration = (hours: number): string => {
  if (hours === 0) return "0 น.";
  
  const totalMinutes = Math.round(hours * 60);
  
  if (totalMinutes < 60) {
    return `${totalMinutes} น.`;
  } else {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}.${m.toString().padStart(2, '0')} ชม.`;
  }
};

export default function LearningPathForm({ path, mode }: LearningPathFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(path?.title || "");
  const [description, setDescription] = useState(path?.description || "");
  const [difficulty, setDifficulty] = useState(path?.difficulty || "medium");
  const [estimatedHours, setEstimatedHours] = useState(path?.estimatedHours || 0);
  const [price, setPrice] = useState(path?.price || 0);
  const [discount, setDiscount] = useState(path?.discount || 0);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(path?.discountType || "percentage");
  const [whoIsItSuitableFor, setWhoIsItSuitableFor] = useState(path?.whoIsItSuitableFor || "");
  const [whatYouWillLearn, setWhatYouWillLearn] = useState(path?.whatYouWillLearn || "");
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>(
    path?.courses?.map((c: any) => c._id || c) || []
  );
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [coverImage, setCoverImage] = useState(path?.coverImage || "");
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!showCourseModal) return;

    const fetchCourses = async () => {
      try {
        const res = await fetch(`/api/courses?type=online&search=${search}`);
        const data = await res.json();
        setCourses(data.courses || []);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      }
    };

    const timer = setTimeout(fetchCourses, 300);
    return () => clearTimeout(timer);
  }, [search, showCourseModal]);

  // Calculate total duration from selected courses
  useEffect(() => {
    const totalMinutes = selectedCourses.reduce((sum, courseId) => {
      const course = courses.find(c => c._id === courseId) || path?.courses?.find((c: any) => c._id === courseId);
      // Duration is in minutes
      const durationInMinutes = typeof course === 'object' ? (course?.duration || 0) : 0;
      return sum + durationInMinutes;
    }, 0);

    // Auto-update estimated hours when courses change
    if (totalMinutes > 0) {
      setEstimatedHours(totalMinutes / 60);
    }
  }, [selectedCourses, courses, path?.courses]);

  const addCourse = (courseId: string) => {
    if (!selectedCourses.includes(courseId)) {
      setSelectedCourses([...selectedCourses, courseId]);
    }
  };

  const removeCourse = (courseId: string) => {
    setSelectedCourses(selectedCourses.filter(id => id !== courseId));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      setCoverImage(data.url);
      setToast({ message: "อัพโหลดรูปสำเร็จ", type: "success" });
    } catch (error) {
      console.error("Image upload failed:", error);
      setToast({ message: "อัพโหลดรูปล้มเหลว", type: "error" });
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Sync form state when path prop changes
  useEffect(() => {
    if (path && mode === "edit") {
      setTitle(path.title || "");
      setDescription(path.description || "");
      setDifficulty(path.difficulty || "medium");
      setEstimatedHours(path.estimatedHours || 0);
      setPrice(path.price || 0);
      setDiscount(path.discount || 0);
      setDiscountType((path.discountType as "percentage" | "fixed") || "percentage");
      setWhoIsItSuitableFor(path.whoIsItSuitableFor || "");
      setWhatYouWillLearn(path.whatYouWillLearn || "");
      setCoverImage(path.coverImage || "");
      setSelectedCourses(path.courses?.map((c: any) => c._id || c) || []);
    }
  }, [path, mode]);

  const handleSave = async () => {
    if (!title.trim() || !description.trim() || selectedCourses.length === 0) {
      setToast({ message: "กรุณากรอกข้อมูลให้ครบถ้วนและเลือกคอร์สอย่างน้อย 1 คอร์ส", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const url = mode === "create" ? "/api/learning-paths" : `/api/learning-paths/${path?._id}`;
      const method = mode === "create" ? "POST" : "PUT";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          coverImage,
          difficulty,
          estimatedHours,
          price,
          discount,
          discountType,
          whoIsItSuitableFor,
          whatYouWillLearn,
          courseIds: selectedCourses,
        }),
      });

      if (res.ok) {
        setToast({ message: mode === "create" ? "สร้างเส้นทางสำเร็จ!" : "บันทึกสำเร็จ!", type: "success" });
        setTimeout(() => router.push("/admin/learning-paths"), 1500);
      } else {
        const data = await res.json();
        setToast({ message: data.error || "เกิดข้อผิดพลาด", type: "error" });
      }
    } catch (error) {
      console.error("Save error:", error);
      setToast({ message: "เกิดข้อผิดพลาด", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const selectedCourseDetails = courses.filter(c => selectedCourses.includes(c._id));

  const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">รูปปก</label>
          <div className="space-y-3">
            {coverImage ? (
              <div className="relative inline-block">
                <Image
                  src={coverImage}
                  alt="Learning path cover"
                  width={600}
                  height={400}
                  className="rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                  disabled={imageUploading}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto mb-2 text-gray-400" size={24} />
                <p className="text-sm text-gray-600">คลิกเพื่ออัพโหลดรูปปก</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={imageUploading}
              className="hidden"
            />
            {coverImage && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={imageUploading}
                className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
              >
                {imageUploading ? "กำลังอัพโหลด..." : "เปลี่ยนรูป"}
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">ชื่อเส้นทาง *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="เช่น Python Fundamentals"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">คำอธิบาย *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="อธิบายเส้นทางการเรียนนี้"
            rows={4}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">เส้นทางการเรียนนี้เหมาะกับใคร?</label>
          <RichTextEditor
            key={`whoIsItSuitableFor-${path?._id || 'new'}`}
            value={whoIsItSuitableFor}
            onChange={setWhoIsItSuitableFor}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">สิ่งที่ได้เรียนรู้</label>
          <RichTextEditor
            key={`whatYouWillLearn-${path?._id || 'new'}`}
            value={whatYouWillLearn}
            onChange={setWhatYouWillLearn}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">ระดับความยาก *</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={inputClass}>
              <option value="easy">ง่าย</option>
              <option value="medium">ปานกลาง</option>
              <option value="hard">ยาก</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">เวลาโดยประมาณ</label>
            <div className={`${inputClass} bg-gray-50 flex items-center text-lg font-semibold text-indigo-600`}>
              {formatDuration(estimatedHours)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">ราคา (บาท)</label>
            <input
              type="number"
              min={0}
              value={price === 0 ? "" : price}
              onChange={(e) => setPrice(e.target.value === "" ? 0 : Number(e.target.value))}
              placeholder="0"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">ประเภทส่วนลด</label>
            <select value={discountType} onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")} className={inputClass}>
              <option value="percentage">เปอร์เซนต์ (%)</option>
              <option value="fixed">จำนวนเต็ม (บาท)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">ส่วนลด {discountType === "percentage" ? "(%)" : "(บาท)"}</label>
            <input
              type="number"
              min={discountType === "percentage" ? 1 : 0}
              max={discountType === "percentage" ? 99 : undefined}
              value={discount === 0 ? "" : discount}
              onChange={(e) => {
                const val = e.target.value === "" ? 0 : Number(e.target.value);
                if (discountType === "percentage") {
                  if (val >= 1 && val <= 99) {
                    setDiscount(val);
                  } else if (val > 99) {
                    setDiscount(99);
                  } else if (val < 1 && val !== 0) {
                    setDiscount(1);
                  } else {
                    setDiscount(0);
                  }
                } else {
                  setDiscount(val);
                }
              }}
              placeholder={discountType === "percentage" ? "1-99" : "0"}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">ราคาสุดท้าย (บาท)</label>
            <div className={`${inputClass} bg-gray-50 flex items-center`}>
              <span className="text-lg font-bold text-indigo-600">
                {calculateFinalPrice(price, discount, discountType).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-gray-700">เลือกคอร์ส *</label>
            <button
              type="button"
              onClick={() => setShowCourseModal(true)}
              className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              เพิ่มคอร์ส
            </button>
          </div>

          {selectedCourses.length > 0 && (
            <div className="space-y-2 mb-4">
              {selectedCourses.map((courseId) => {
                const course = courses.find(c => c._id === courseId) || path?.courses?.find((c: any) => c._id === courseId || c === courseId);
                return (
                  <div key={courseId} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="text-sm text-gray-700">{typeof course === 'string' ? course : course?.title || courseId}</span>
                    <button
                      type="button"
                      onClick={() => removeCourse(courseId)}
                      className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Course Modal */}
        {showCourseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-96 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">เลือกคอร์ส</h3>
                <button onClick={() => setShowCourseModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <input
                type="text"
                placeholder="ค้นหาคอร์ส..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`mb-4 ${inputClass}`}
              />

              <div className="flex-1 overflow-y-auto space-y-2">
                {courses.map((course) => (
                  <div key={course._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">{course.title}</p>
                      <p className="text-xs text-gray-600">{course.instructor}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        addCourse(course._id);
                        setSearch("");
                      }}
                      disabled={selectedCourses.includes(course._id)}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {selectedCourses.includes(course._id) ? "เลือกแล้ว" : "เลือก"}
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowCourseModal(false)}
                className="mt-4 w-full py-2.5 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                ปิด
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-6">
          <button
            onClick={() => router.back()}
            className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "กำลังบันทึก..." : mode === "create" ? "สร้างเส้นทาง" : "บันทึก"}
          </button>
        </div>
      </div>
    </>
  );
}
