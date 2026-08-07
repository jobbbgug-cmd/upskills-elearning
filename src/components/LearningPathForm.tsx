"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import Toast from "@/components/ui/Toast";

interface Course {
  _id: string;
  title: string;
  instructor: string;
  price: number;
}

interface LearningPath {
  _id?: string;
  title: string;
  description: string;
  difficulty: string;
  courses: any[];
  estimatedHours?: number;
  price?: number;
}

interface LearningPathFormProps {
  path?: LearningPath;
  mode: "create" | "edit";
}

export default function LearningPathForm({ path, mode }: LearningPathFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(path?.title || "");
  const [description, setDescription] = useState(path?.description || "");
  const [difficulty, setDifficulty] = useState(path?.difficulty || "beginner");
  const [estimatedHours, setEstimatedHours] = useState(path?.estimatedHours || 0);
  const [price, setPrice] = useState(path?.price || 0);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>(
    path?.courses?.map((c: any) => c._id || c) || []
  );
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!showCourseModal) return;

    const fetchCourses = async () => {
      try {
        const res = await fetch(`/api/courses?search=${search}`);
        const data = await res.json();
        setCourses(data.courses || []);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      }
    };

    const timer = setTimeout(fetchCourses, 300);
    return () => clearTimeout(timer);
  }, [search, showCourseModal]);

  const addCourse = (courseId: string) => {
    if (!selectedCourses.includes(courseId)) {
      setSelectedCourses([...selectedCourses, courseId]);
    }
  };

  const removeCourse = (courseId: string) => {
    setSelectedCourses(selectedCourses.filter(id => id !== courseId));
  };

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
          difficulty,
          estimatedHours,
          price,
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">ระดับความยาก *</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={inputClass}>
              <option value="beginner">ระดับเบื้องต้น</option>
              <option value="intermediate">ระดับกลาง</option>
              <option value="advanced">ระดับสูง</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">เวลาโดยประมาณ (ชั่วโมง)</label>
            <input
              type="number"
              min={0}
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(Number(e.target.value))}
              className={inputClass}
            />
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
