"use client";
import { useState, useEffect, useCallback } from "react";
import { Package, Search, Plus, Trash2, Edit2, X, AlertCircle, Check } from "lucide-react";
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
  institutionId?: { _id: string; name: string; slug: string } | null;
}

export default function SuperAdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [acting, setActing] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
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

      const res = await fetch(`/api/super-admin/products?${params.toString()}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setProducts([]);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setForm({
      name: "",
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

    if (!form.name || form.price < 0 || form.stock < 0) {
      setError("กรุณากรอกข้อมูลให้ถูกต้อง");
      return;
    }

    setSubmitting(true);
    try {
      const method = editing ? "PATCH" : "POST";
      const url = editing
        ? `/api/super-admin/products/${editing._id}`
        : "/api/super-admin/products";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
        const err = await res.json();
        setError(err.error || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาด");
    }
    setSubmitting(false);
  };

  const handleEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      sku: product.sku,
      image: product.image,
      isActive: product.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ลบสินค้านี้?")) return;
    setActing(id);
    try {
      const res = await fetch(`/api/super-admin/products/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
    setActing(null);
  };

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: products.length,
    active: products.filter((p) => p.isActive).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
    totalValue: products.reduce((sum, p) => sum + p.price * p.stock, 0),
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6" style={{ color: "var(--color-primary)" }} />
            จัดการสินค้า
          </h1>
          <p className="text-gray-500 text-sm mt-1">เพิ่ม แก้ไข และจัดการสินค้าทั้งหมด</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-colors theme-button"
        >
          <Plus className="w-4 h-4" /> เพิ่มสินค้า
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "สินค้าทั้งหมด", value: stats.total },
          { label: "เปิดใช้งาน", value: stats.active },
          { label: "หมด", value: stats.outOfStock },
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
                {editing ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
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
                    ชื่อสินค้า *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="เช่น หนังสือคณิตศาสตร์"
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
                    placeholder="รายละเอียดสินค้า"
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
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                      style={{ "--tw-ring-color": "rgba(var(--color-primary-rgb), 0.5)" } as any}
                    />
                  </div>
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
                      placeholder="0"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                      style={{ "--tw-ring-color": "rgba(var(--color-primary-rgb), 0.5)" } as any}
                    />
                  </div>
                </div>

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
                      SKU
                    </label>
                    <input
                      type="text"
                      value={form.sku}
                      onChange={(e) => setForm({ ...form, sku: e.target.value })}
                      placeholder="เช่น SKU123"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                      style={{ "--tw-ring-color": "rgba(var(--color-primary-rgb), 0.5)" } as any}
                    />
                  </div>
                </div>

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
                    <span>{editing ? "แก้ไขสำเร็จ" : "เพิ่มสินค้าสำเร็จ"}</span>
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
          placeholder="ค้นหาชื่อสินค้า หมวดหมู่ หรือ SKU..."
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 bg-white"
          style={{ "--tw-ring-color": "rgba(var(--color-primary-rgb), 0.5)" } as any}
        />
      </div>

      {/* Products List */}
      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">{search ? "ไม่พบสินค้า" : "ยังไม่มีสินค้า"}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: "rgba(var(--color-primary-rgb), 0.1)" }}
                    >
                      <Package className="w-6 h-6" style={{ color: "var(--color-primary)" }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        {!product.isActive && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            ปิด
                          </span>
                        )}
                        {product.stock === 0 && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                            หมด
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{product.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 mt-3 text-xs">
                    <div>
                      <span className="text-gray-500">ราคา</span>
                      <p className="font-semibold text-gray-900">฿{product.price.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">คงคลัง</span>
                      <p className="font-semibold text-gray-900">{product.stock}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">หมวดหมู่</span>
                      <p className="font-semibold text-gray-900">{product.category || "-"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">SKU</span>
                      <p className="font-semibold text-gray-900">{product.sku || "-"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    disabled={acting === product._id}
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
        แสดง {filtered.length} / {products.length} สินค้า
      </p>
    </div>
  );
}
