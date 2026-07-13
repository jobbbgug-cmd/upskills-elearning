import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";

export default async function NewLearningPathPage() {
  const auth = await getAuthUser();
  if (!auth || (auth.role !== "admin" && auth.role !== "teacher")) redirect("/login");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">สร้างเส้นทางการเรียน</h1>
        <p className="text-gray-500 text-sm mt-1">รวมหลายคอร์สเข้าเป็นเส้นทางเรียนที่สมบูรณ์</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">ชื่อเส้นทาง *</label>
            <input
              type="text"
              placeholder="เช่น Python Fundamentals"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 theme-focus-ring"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">รายละเอียด *</label>
            <textarea
              placeholder="อธิบายเส้นทางการเรียนนี้"
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 theme-focus-ring"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">ระดับความยาก</label>
            <select className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 theme-focus-ring">
              <option value="beginner">ผู้เริ่มต้น</option>
              <option value="intermediate">ระดับกลาง</option>
              <option value="advanced">ขั้นสูง</option>
            </select>
          </div>

          {/* Courses */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">เลือกคอร์ส</label>
            <div className="border border-gray-300 rounded-xl p-4 min-h-48">
              <p className="text-sm text-gray-500 text-center py-12">ยังไม่มีคอร์ส</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button className="px-6 py-2.5 theme-btn rounded-lg transition-colors font-medium text-sm">
              บันทึก
            </button>
            <button className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
