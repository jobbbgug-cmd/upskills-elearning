"use client";
import { useState, useEffect } from "react";
import { Tag, Plus, Edit3, Trash2, Search, RefreshCw, Power, ChevronUp, ChevronDown } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Category {
  _id: string;
  name: string;
  description?: string;
  type: "online" | "onsite";
  isActive: boolean;
  order: number;
  createdAt: string;
}

export default function SuperAdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [creatingType, setCreatingType] = useState<"online" | "onsite">("online");
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [editing, setEditing] = useState<Category | null>(null);
  const [editData, setEditData] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/categories", {
        credentials: "include",
      });
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
        body: JSON.stringify({
          name: newCategory.name,
          description: newCategory.description,
          type: creatingType,
        }),
      });

      if (res.ok) {
        const cat = await res.json();
        setCategories([...categories, cat]);
        setCreating(false);
        setNewCategory({ name: "", description: "" });
      } else {
        const data = await res.json();
        setError(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    }

    setSaving(false);
  };

  const updateCategory = async () => {
    if (!editing) return;
    if (!editData.name.trim()) {
      setError("ชื่อหมวดหมู่ไม่ว่าง");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/super-admin/categories/${editing._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: editData.name,
          description: editData.description,
        }),
      });

      if (res.ok) {
        const cat = await res.json();
        setCategories(
          categories.map((c) => (c._id === editing._id ? cat : c))
        );
        setEditing(null);
      } else {
        const data = await res.json();
        setError(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    }

    setSaving(false);
  };

  const toggleActive = async (catId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/super-admin/categories/${catId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      if (res.ok) {
        const cat = await res.json();
        setCategories(
          categories.map((c) => (c._id === catId ? cat : c))
        );
        setSuccessMsg(!currentStatus ? "เปิดสำเร็จ" : "ปิดสำเร็จ");
        setTimeout(() => setSuccessMsg(""), 2000);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const moveCategory = async (catId: string, direction: "up" | "down", type: "online" | "onsite") => {
    const sameType = categories.filter((c) => c.type === type).sort((a, b) => a.order - b.order);
    const currentIndex = sameType.findIndex((c) => c._id === catId);

    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === sameType.length - 1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const currentCat = sameType[currentIndex];
    const targetCat = sameType[newIndex];

    try {
      const res1 = await fetch(`/api/super-admin/categories/${currentCat._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ order: targetCat.order }),
      });

      const res2 = await fetch(`/api/super-admin/categories/${targetCat._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ order: currentCat.order }),
      });

      if (res1.ok && res2.ok) {
        await load();
      }
    } catch (err: any) {
      console.error("Move category error:", err);
    }
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                <span className="text-red-600">หมวดหมู่ online</span>
              </h2>
              <button
                onClick={() => {
                  setCreatingType("online");
                  setCreating(true);
                  setError("");
                  setNewCategory({ name: "", description: "" });
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-white text-sm font-medium rounded-lg transition-colors theme-button"
              >
                <Plus className="w-4 h-4" /> เพิ่ม
              </button>
            </div>
            {filteredCategories.filter((c) => c.type === "online").length === 0 ? (
              <div className="text-center py-8">
                <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">ไม่พบหมวดหมู่ Online</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCategories
                  .filter((c) => c.type === "online")
                  .sort((a, b) => a.order - b.order)
                  .map((cat, idx, arr) => (
                    <div key={cat._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                        {cat.description && (
                          <p className="text-xs text-gray-600 mt-1">{cat.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-4">
                        <button
                          onClick={() => moveCategory(cat._id, "up", "online")}
                          disabled={idx === 0}
                          className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 disabled:opacity-30 rounded-lg transition-colors"
                          title="ขึ้น"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveCategory(cat._id, "down", "online")}
                          disabled={idx === arr.length - 1}
                          className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 disabled:opacity-30 rounded-lg transition-colors"
                          title="ลง"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleActive(cat._id, cat.isActive)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            cat.isActive
                              ? "text-violet-600 bg-violet-50 hover:text-violet-700"
                              : "text-gray-400 hover:text-violet-600 hover:bg-violet-50"
                          }`}
                          title={cat.isActive ? "ปิด" : "เปิด"}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditing(cat);
                            setEditData({ name: cat.name, description: cat.description || "" });
                            setError("");
                          }}
                          className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                          title="แก้ไข"
                        >
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                <span className="text-red-600">หมวดหมู่ onsite</span>
              </h2>
              <button
                onClick={() => {
                  setCreatingType("onsite");
                  setCreating(true);
                  setError("");
                  setNewCategory({ name: "", description: "" });
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-white text-sm font-medium rounded-lg transition-colors theme-button"
              >
                <Plus className="w-4 h-4" /> เพิ่ม
              </button>
            </div>
            {filteredCategories.filter((c) => c.type === "onsite").length === 0 ? (
              <div className="text-center py-8">
                <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">ไม่พบหมวดหมู่ Onsite</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCategories
                  .filter((c) => c.type === "onsite")
                  .sort((a, b) => a.order - b.order)
                  .map((cat, idx, arr) => (
                    <div key={cat._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                        {cat.description && (
                          <p className="text-xs text-gray-600 mt-1">{cat.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-4">
                        <button
                          onClick={() => moveCategory(cat._id, "up", "onsite")}
                          disabled={idx === 0}
                          className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 disabled:opacity-30 rounded-lg transition-colors"
                          title="ขึ้น"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveCategory(cat._id, "down", "onsite")}
                          disabled={idx === arr.length - 1}
                          className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 disabled:opacity-30 rounded-lg transition-colors"
                          title="ลง"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleActive(cat._id, cat.isActive)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            cat.isActive
                              ? "text-violet-600 bg-violet-50 hover:text-violet-700"
                              : "text-gray-400 hover:text-violet-600 hover:bg-violet-50"
                          }`}
                          title={cat.isActive ? "ปิด" : "เปิด"}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditing(cat);
                            setEditData({ name: cat.name, description: cat.description || "" });
                            setError("");
                          }}
                          className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                          title="แก้ไข"
                        >
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
      {/* Create modal */}
      {creating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                เพิ่มหมวดหมู่ {creatingType === "online" ? "Online" : "Onsite"}
              </h2>
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

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">แก้ไขหมวดหมู่</h2>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">ชื่อหมวดหมู่ *</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  placeholder="เช่น โปรแกรมมิ่ง"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-violet-300"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">คำอธิบาย</label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  placeholder="คำอธิบายหมวดหมู่"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-violet-300"
                  rows={3}
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={updateCategory}
                  disabled={saving}
                  className="flex-1 text-white text-sm font-medium py-2 rounded-lg transition-colors theme-button disabled:opacity-50"
                >
                  {saving ? "กำลังบันทึก..." : "บันทึก"}
                </button>
                <button
                  onClick={() => setEditing(null)}
                  className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success popup */}
      {successMsg && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={`px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 ${
            successMsg === "ปิดสำเร็จ"
              ? "bg-red-50 border border-red-200"
              : "bg-green-50 border border-green-200"
          }`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
              successMsg === "ปิดสำเร็จ"
                ? "bg-red-500"
                : "bg-green-500"
            }`}>
              <span className="text-white text-sm font-bold">✓</span>
            </div>
            <p className={`font-medium text-sm ${
              successMsg === "ปิดสำเร็จ"
                ? "text-red-700"
                : "text-green-700"
            }`}>{successMsg}</p>
          </div>
        </div>
      )}
    </div>
  );
}
