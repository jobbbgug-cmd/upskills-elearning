"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, GripVertical } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  order: number;
  type: "online" | "onsite";
}

export default function CategoriesContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories?type=online");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingId) {
        const res = await fetch(`/api/categories/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Failed to update");
      } else {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, type: "online" }),
        });
        if (!res.ok) throw new Error("Failed to create");
      }

      setFormData({ name: "", description: "" });
      setEditingId(null);
      setShowForm(false);
      fetchCategories();
    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาด");
    }
  };

  const handleEdit = (cat: Category) => {
    setFormData({ name: cat.name, description: cat.description || "" });
    setEditingId(cat._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ยืนยันการลบ?")) return;
    try {
      await fetch(`/api/categories/${id}`, { method: "DELETE" });
      fetchCategories();
    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาด");
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", description: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    const draggedIndex = categories.findIndex((c) => c._id === draggedId);
    const targetIndex = categories.findIndex((c) => c._id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newCategories = [...categories];
    const [draggedItem] = newCategories.splice(draggedIndex, 1);
    newCategories.splice(targetIndex, 0, draggedItem);

    const updatedCategories = newCategories.map((cat, idx) => ({
      ...cat,
      order: idx,
    }));

    setCategories(updatedCategories);
    setDraggedId(null);

    try {
      await Promise.all(
        updatedCategories.map((cat) =>
          fetch(`/api/categories/${cat._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: cat.order }),
          })
        )
      );
    } catch (error) {
      console.error("Failed to save order:", error);
      fetchCategories();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">หมวดหมู่</h1>
          <p className="text-gray-500 text-sm mt-1">จัดการหมวดหมู่คอร์ส</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 theme-btn rounded-lg transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            เพิ่มหมวดหมู่
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              {editingId ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
            </h2>
            <button onClick={handleCancel}>
              <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">ชื่อหมวดหมู่ *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="เช่น AI & Automation"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">คำอธิบาย</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="รายละเอียดเพิ่มเติม"
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
              >
                {editingId ? "บันทึก" : "สร้าง"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">กำลังโหลด...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">ยังไม่มีหมวดหมู่</p>
            <button
              onClick={() => setShowForm(true)}
              className="theme-link"
            >
              สร้างหมวดหมู่แรก →
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 w-8"></th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">ชื่อ</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">คำอธิบาย</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">สถานะ</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr
                  key={cat._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, cat._id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, cat._id)}
                  className={`border-b border-gray-100 transition-colors cursor-move ${
                    draggedId === cat._id ? "bg-indigo-50 opacity-50" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-3 py-4">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">{cat.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 line-clamp-1">{cat.description || "-"}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      cat.isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {cat.isActive ? "ใช้งาน" : "ปิดใช้งาน"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
