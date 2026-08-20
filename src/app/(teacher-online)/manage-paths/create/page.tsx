"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Course {
  _id: string;
  title: string;
  instructor: string;
  price: number;
}

export default function CreatePathPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);

  useEffect(() => {
    if (!showCourseModal) return;

    const fetchCourses = async () => {
      try {
        const res = await fetch(`/api/admin/courses?search=${search}`);
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
      alert("กรุณากรอกข้อมูลให้ครบถ้วนและเลือกคอร์สอย่างน้อย 1 คอร์ส");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/learning-paths", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          difficulty,
          courseIds: selectedCourses,
        }),
      });

      if (res.ok) {
        router.push("/manage-paths");
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedCourseDetails = courses.filter(c => selectedCourses.includes(c._id));

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/manage-paths"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับ
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">สร้างเส้นทางการเรียน</h1>
        <p className="text-gray-500 text-sm mt-1">รวมหลายคอร์สเข้าเป็นเส้นทางเรียนที่สมบูรณ์</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">ชื่อเส้นทาง *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น Python Fundamentals"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">รายละเอียด *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="อธิบายเส้นทางการเรียนนี้"
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">ระดับความยาก</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="easy">ผู้เริ่มต้น</option>
              <option value="medium">ระดับกลาง</option>
              <option value="hard">ขั้นสูง</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">เลือกคอร์ส *</label>
              <button
                onClick={() => setShowCourseModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                เพิ่มคอร์ส
              </button>
            </div>

            <div className="border border-gray-300 rounded-xl p-4 min-h-48">
              {selectedCourseDetails.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-12">ยังไม่มีคอร์ส</p>
              ) : (
                <div className="space-y-3">
                  {selectedCourseDetails.map((course) => (
                    <div
                      key={course._id}
                      className="flex items-center justify-between bg-purple-50 p-3 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{course.title}</p>
                        <p className="text-xs text-gray-500">{course.instructor}</p>
                      </div>
                      <button
                        onClick={() => removeCourse(course._id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm disabled:opacity-50"
            >
              {loading ? "กำลังบันทึก..." : "บันทึก"}
            </button>
            <button
              onClick={() => router.back()}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>

      {/* Course Selection Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-96 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">เลือกคอร์ส</h2>
              <button
                onClick={() => setShowCourseModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-100">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาคอร์ส..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {courses.length === 0 ? (
                <p className="text-center text-gray-500 py-8">ไม่พบคอร์ส</p>
              ) : (
                courses.map((course) => (
                  <button
                    key={course._id}
                    onClick={() => addCourse(course._id)}
                    disabled={selectedCourses.includes(course._id)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors disabled:bg-purple-50 disabled:border-purple-300"
                  >
                    <p className="text-sm font-medium text-gray-900">{course.title}</p>
                    <p className="text-xs text-gray-500">{course.instructor}</p>
                  </button>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setShowCourseModal(false)}
                className="w-full px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm"
              >
                เสร็จสิ้น
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
