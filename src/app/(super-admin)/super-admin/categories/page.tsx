"use client";
import { useState, useEffect } from "react";
import { Tag, Plus, Edit3, Trash2, Search, RefreshCw } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
}

export default function SuperAdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      cat.slug.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">หมวดหมู่คอร์ส</h1>
          <p className="text-gray-500 text-sm mt-1">{categories.length} หมวดหมู่</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-xl transition-colors theme-button">
          <Plus className="w-4 h-4" /> เพิ่มหมวดหมู่
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
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

        <div className="mt-4">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">ไม่พบหมวดหมู่</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCategories.map((cat) => (
                <div key={cat._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                    <p className="text-xs text-gray-500 mt-1 font-mono">{cat.slug}</p>
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
  );
}
