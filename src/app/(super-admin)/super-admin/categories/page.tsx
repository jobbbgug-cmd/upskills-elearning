"use client";
import { useState, useEffect } from "react";
import { Tag, Plus, Edit3, Trash2, Search, RefreshCw } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Category {
  _id: string;
  name: string;
  description?: string;
  type: "online" | "onsite";
  isActive: boolean;
  createdAt: string;
}

export default function SuperAdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "", type: "online" as const });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/categories");
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const createCategory = async () => {
    if (!newCategory.name.trim()) {
      setError("ชื่อหมวดหมู่ไม่ว่าง");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/super-admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });

      if (res.ok) {
        const cat = await res.json();
        setCategories([...categories, cat]);
        setCreating(false);
        setNewCategory({ name: "", description: "", type: "online" });
      } else {
        const data = await res.json();
        setError(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    }

    setSaving(false);
  };

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      cat.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">หมวดหมู่คอร์ส</h1>
          <p className="text-gray-500 text-sm mt-1">{categories.length} หมวดหมู่</p>
        </div>
        <button
          onClick={() => {
            setCreating(true);
            setError("");
          }}
          className="flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-xl transition-colors theme-button"
        >
          <Plus className="w-4 h-4" /> เพิ่มหมวดหมู่
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาหมวดหมู่..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <button onClick={load} title="รีเฟรช" className="p-1 text-gray-400 hover:text-gray-600">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Online Column */}
          <div className="bg-white rounded-xl border border-red-300 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <span className="text-red-600">หมวดหมู่ online</span>
            </h2>
            {filteredCategories.filter((c) => c.type === "online").length === 0 ? (
              <div className="text-center py-8">
                <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">ไม่พบหมวดหมู่ Online</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCategories
                  .filter((c) => c.type === "online")
                  .map((cat) => (
                    <div key={cat._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                        {cat.description && (
                          <p className="text-xs text-gray-600 mt-1">{cat.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-4">
                        <button className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors" title="แก้ไข">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="ลบ">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Onsite Column */}
          <div className="bg-white rounded-xl border border-red-300 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <span className="text-red-600">หมวดหมู่ onsite</span>
            </h2>
            {filteredCategories.filter((c) => c.type === "onsite").length === 0 ? (
              <div className="text-center py-8">
                <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">ไม่พบหมวดหมู่ Onsite</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCategories
                  .filter((c) => c.type === "onsite")
                  .map((cat) => (
                    <div key={cat._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                        {cat.description && (
                          <p className="text-xs text-gray-600 mt-1">{cat.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-4">
                        <button className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors" title="แก้ไข">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="ลบ">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create modal */}
      {creating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">เพิ่มหมวดหมู่ใหม่</h2>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">ชื่อหมวดหมู่ *</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="เช่น โปรแกรมมิ่ง"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-violet-300"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">คำอธิบาย</label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="คำอธิบายหมวดหมู่"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-violet-300"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">ประเภท *</label>
                <select
                  value={newCategory.type}
                  onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as "online" | "onsite" })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-violet-300"
                >
                  <option value="online">Online</option>
                  <option value="onsite">Onsite</option>
                </select>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={createCategory}
                  disabled={saving}
                  className="flex-1 text-white text-sm font-medium py-2 rounded-lg transition-colors theme-button disabled:opacity-50"
                >
                  {saving ? "กำลังสร้าง..." : "สร้าง"}
                </button>
                <button
                  onClick={() => setCreating(false)}
                  className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
