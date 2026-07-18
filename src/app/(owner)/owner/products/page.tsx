"use client";
import { useState, useEffect, useCallback } from "react";
import { Package, BookOpen, Search, Plus, Trash2, Edit2, X, AlertCircle, Check } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  sku: string;
  image: string;
  isActive: boolean;
  createdAt: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  image?: string;
  isActive: boolean;
  createdAt: string;
}

type ItemType = "product" | "course";

export default function AdminProductsPage() {
  const [activeTab, setActiveTab] = useState<ItemType>("product");
  const [products, setProducts] = useState<Product[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | Course | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [acting, setActing] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    title: "",
    description: "",
    price: 0,
    stock: 0,
    category: "",
    sku: "",
    image: "",
    isActive: true,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);

      if (activeTab === "product") {
        const res = await fetch(`/api/owner/products?${params.toString()}`);
        if (!res.ok) {
          setProducts([]);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } else {
        const res = await fetch(`/api/owner/courses?${params.toString()}`);
        if (!res.ok) {
          setCourses([]);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
      if (activeTab === "product") setProducts([]);
      else setCourses([]);
    }
    setLoading(false);
  }, [search, activeTab]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setForm({
      name: "",
      title: "",
      description: "",
      price: 0,
      stock: 0,
      category: "",
      sku: "",
      image: "",
      isActive: true,
    });
    setEditing(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (activeTab === "product") {
      if (!form.name || form.price < 0 || form.stock < 0 || !form.sku) {
        setError("กรุณากรอกข้อมูลให้ถูกต้อง");
        return;
      }
    } else {
      if (!form.title || form.price < 0) {
        setError("กรุณากรอกข้อมูลให้ถูกต้อง");
        return;
      }
    }

    setSubmitting(true);
    try {
      const endpoint = activeTab === "product" ? "products" : "courses";
      const method = editing ? "PATCH" : "POST";
      const url = editing
        ? `/api/owner/${endpoint}/${editing._id}`
        : `/api/owner/${endpoint}`;

      const payload = activeTab === "product"
        ? { name: form.name, description: form.description, price: form.price, stock: form.stock, category: form.category, sku: form.sku, image: form.image, isActive: form.isActive }
        : { title: form.title, description: form.description, price: form.price, image: form.image, isActive: form.isActive };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess(true);
        resetForm();
        setTimeout(() => {
          setShowForm(false);
          setSuccess(false);
          load();
        }, 1500);
      } else {
        try {
          const err = await res.json();
          setError(err.error || "เกิดข้อผิดพลาด");
        } catch {
          setError("เกิดข้อผิดพลาดบนเซิร์ฟเวอร์");
        }
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาด");
    }
    setSubmitting(false);
  };

  const handleEdit = (item: Product | Course) => {
    setEditing(item);
    if (activeTab === "product") {
      const p = item as Product;
      setForm({
        name: p.name,
        title: "",
        description: p.description,
        price: p.price,
        stock: p.stock,
        category: p.category,
        sku: p.sku,
        image: p.image,
        isActive: p.isActive,
      });
    } else {
      const c = item as Course;
      setForm({
        name: "",
        title: c.title,
        description: c.description,
        price: c.price,
        stock: 0,
        category: "",
        sku: "",
        image: c.image || "",
        isActive: c.isActive,
      });
    }
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ลบรายการนี้?")) return;
    setActing(id);
    try {
      const endpoint = activeTab === "product" ? "products" : "courses";
      const res = await fetch(`/api/owner/${endpoint}/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (activeTab === "product") {
          setProducts((prev) => prev.filter((p) => p._id !== id));
        } else {
          setCourses((prev) => prev.filter((c) => c._id !== id));
        }
      }
    } catch (err) {
      console.error(err);
    }
    setActing(null);
  };

  const items = activeTab === "product" ? products : courses;
  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    if (activeTab === "product") {
      const p = item as Product;
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    } else {
      const c = item as Course;
      return c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
    }
  });

  const stats = {
    total: items.length,
    active: items.filter((item) => item.isActive).length,
    outOfStock: activeTab === "product" ? (items as Product[]).filter((p) => p.stock === 0).length : 0,
    totalValue: items.reduce((sum, item) => sum + (item.price * (activeTab === "product" ? (item as Product).stock : 1)), 0),
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6" style={{ color: "var(--color-primary)" }} />
            จัดการสินค้าและคอร์ส
          </h1>
          <p className="text-gray-500 text-sm mt-1">เพิ่ม แก้ไข และจัดการสินค้าและคอร์สที่จะขาย</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-colors theme-button"
        >
          <Plus className="w-4 h-4" /> เพิ่ม{activeTab === "product" ? "สินค้า" : "คอร์ส"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: "product" as ItemType, label: "สินค้า", icon: <Package className="w-4 h-4" /> },
          { id: "course" as ItemType, label: "คอร์ส", icon: <BookOpen className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === tab.id
                ? "text-white theme-button"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className={`grid ${activeTab === "product" ? "grid-cols-4" : "grid-cols-3"} gap-4 mb-6`}>
        {[
          { label: activeTab === "product" ? "สินค้าทั้งหมด" : "คอร์สทั้งหมด", value: stats.total },
          { label: "เปิดใช้งาน", value: stats.active },
          ...(activeTab === "product" ? [{ label: "หมด", value: stats.outOfStock }] : []),
          { label: "มูลค่ารวม", value: `฿${stats.totalValue.toLocaleString()}`, isValue: true },
        ].map((stat, i) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-900">
                {editing ? "แก้ไข" : "เพิ่ม"}{activeTab === "product" ? "สินค้า" : "คอร์ส"}ใหม่
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {activeTab === "product" ? "ชื่อสินค้า" : "ชื่อคอร์ส"} *
                  </label>
                  <input
                    required
                    type="text"
                    value={activeTab === "product" ? form.name : form.title}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [activeTab === "product" ? "name" : "title"]: e.target.value,
                      })
                    }
                    placeholder={activeTab === "product" ? "เช่น หนังสือคณิตศาสตร์" : "เช่น JavaScript Basics"}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                    style={{ "--tw-ring-color": "rgba(var(--color-primary-rgb), 0.5)" } as any}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    รายละเอียด
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white resize-none"
                    style={{ "--tw-ring-color": "rgba(var(--color-primary-rgb), 0.5)" } as any}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      ราคา (฿) *
                    </label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                      style={{ "--tw-ring-color": "rgba(var(--color-primary-rgb), 0.5)" } as any}
                    />
                  </div>
                  {activeTab === "product" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        จำนวนคงคลัง *
                      </label>
                      <input
                        required
                        type="number"
                        min="0"
                        value={form.stock}
                        onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                        style={{ "--tw-ring-color": "rgba(var(--color-primary-rgb), 0.5)" } as any}
                      />
                    </div>
                  )}
                </div>

                {activeTab === "product" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        หมวดหมู่
                      </label>
                      <input
                        type="text"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        placeholder="เช่น หนังสือ"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                        style={{ "--tw-ring-color": "rgba(var(--color-primary-rgb), 0.5)" } as any}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        รหัสสินค้า (SKU) *
                      </label>
                      <input
                        required
                        type="text"
                        value={form.sku}
                        onChange={(e) => setForm({ ...form, sku: e.target.value })}
                        placeholder="เช่น SKU123"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                        style={{ "--tw-ring-color": "rgba(var(--color-primary-rgb), 0.5)" } as any}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    URL รูปภาพ
                  </label>
                  <input
                    type="url"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                    style={{ "--tw-ring-color": "rgba(var(--color-primary-rgb), 0.5)" } as any}
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 border border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700 cursor-pointer">
                    เปิดใช้งาน
                  </label>
                </div>

                {error && (
                  <div className="flex items-start gap-2 text-sm p-3 rounded-xl bg-red-50 text-red-700">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="flex items-start gap-2 text-sm p-3 rounded-xl bg-green-50 text-green-700">
                    <Check className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{editing ? "แก้ไขสำเร็จ" : "เพิ่มสำเร็จ"}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 px-6 py-5 border-t border-gray-100 sticky bottom-0 bg-white">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 text-white font-semibold rounded-xl disabled:opacity-50 transition-colors text-sm theme-button"
                >
                  {submitting ? "กำลังบันทึก..." : editing ? "แก้ไข" : "เพิ่ม"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-5 flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={activeTab === "product" ? "ค้นหาชื่อสินค้า..." : "ค้นหาชื่อคอร์ส..."}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 bg-white"
          style={{ "--tw-ring-color": "rgba(var(--color-primary-rgb), 0.5)" } as any}
        />
      </div>

      {/* List */}
      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">{search ? "ไม่พบรายการ" : `ยังไม่มี${activeTab === "product" ? "สินค้า" : "คอร์ส"}`}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: "rgba(var(--color-primary-rgb), 0.1)" }}
                    >
                      {activeTab === "product" ? (
                        <Package className="w-6 h-6" style={{ color: "var(--color-primary)" }} />
                      ) : (
                        <BookOpen className="w-6 h-6" style={{ color: "var(--color-primary)" }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">
                          {activeTab === "product" ? (item as Product).name : (item as Course).title}
                        </h3>
                        {!item.isActive && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            ปิด
                          </span>
                        )}
                        {activeTab === "product" && (item as Product).stock === 0 && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                            หมด
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                    </div>
                  </div>

                  <div className={`grid ${activeTab === "product" ? "grid-cols-4" : "grid-cols-2"} gap-3 mt-3 text-xs`}>
                    <div>
                      <span className="text-gray-500">ราคา</span>
                      <p className="font-semibold text-gray-900">฿{item.price.toLocaleString()}</p>
                    </div>
                    {activeTab === "product" && (
                      <>
                        <div>
                          <span className="text-gray-500">คงคลัง</span>
                          <p className="font-semibold text-gray-900">{(item as Product).stock}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">หมวดหมู่</span>
                          <p className="font-semibold text-gray-900">{(item as Product).category || "-"}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">SKU</span>
                          <p className="font-semibold text-gray-900">{(item as Product).sku || "-"}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    disabled={acting === item._id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-3">
        แสดง {filtered.length} / {items.length} รายการ
      </p>
    </div>
  );
}
