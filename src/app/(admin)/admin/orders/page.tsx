"use client";
import { useState, useEffect, useCallback } from "react";
import { Package, ShoppingCart, Search, Trash2, Plus, X, AlertCircle, Check } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Order {
  _id: string;
  type: "course" | "product";
  status: "pending" | "confirmed" | "cancelled" | "completed";
  amount: number;
  quantity?: number;
  createdAt: string;
  userId: { _id: string; name: string; email: string };
  courseId?: { _id: string; title: string };
  productId?: { _id: string; name: string };
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending: { label: "รอตรวจสอบ", color: "amber" },
  confirmed: { label: "ยืนยันแล้ว", color: "green" },
  completed: { label: "สำเร็จ", color: "blue" },
  cancelled: { label: "ยกเลิก", color: "red" },
};

const TYPE_LABEL: Record<string, string> = {
  course: "คอร์ส",
  product: "สินค้า",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "course" | "product">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "confirmed" | "completed" | "cancelled">("all");
  const [acting, setActing] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [createForm, setCreateForm] = useState({
    userId: "",
    type: "product" as "course" | "product",
    productId: "",
    quantity: 1,
    amount: 0,
    status: "pending" as "pending" | "confirmed" | "completed" | "cancelled",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== "all") params.set("type", filterType);
      if (filterStatus !== "all") params.set("status", filterStatus);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    }
    setLoading(false);
  }, [filterType, filterStatus]);

  useEffect(() => {
    load();
  }, [load]);

  // Load users and products for form
  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [usersRes, productsRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/super-admin/products"),
        ]);
        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsers(Array.isArray(data) ? data : []);
        }
        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (showCreate) {
      loadFormData();
    }
  }, [showCreate]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setActing(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === id ? { ...o, status: newStatus as any } : o
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
    setActing(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ลบรายการสั่งซื้อนี้?")) return;
    setActing(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
    setActing(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");

    if (!createForm.userId || (createForm.type === "product" && !createForm.productId) || createForm.amount <= 0) {
      setCreateError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });

      if (res.ok) {
        setCreateSuccess(true);
        setCreateForm({ userId: "", type: "product", productId: "", quantity: 1, amount: 0, status: "pending" });
        setTimeout(() => {
          setShowCreate(false);
          setCreateSuccess(false);
          load();
        }, 1500);
      } else {
        const err = await res.json();
        setCreateError(err.error || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      setCreateError("เกิดข้อผิดพลาด");
    }
    setCreating(false);
  };

  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p._id === productId);
    setCreateForm({
      ...createForm,
      productId,
      amount: product ? product.price * createForm.quantity : 0,
    });
  };

  const handleQuantityChange = (quantity: number) => {
    const product = products.find((p) => p._id === createForm.productId);
    setCreateForm({
      ...createForm,
      quantity,
      amount: product ? product.price * quantity : 0,
    });
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.userId.name.toLowerCase().includes(q) ||
      o.userId.email.toLowerCase().includes(q) ||
      o.courseId?.title.toLowerCase().includes(q) ||
      o.productId?.name.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    completed: orders.filter((o) => o.status === "completed").length,
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" style={{ color: "var(--color-primary)" }} />
            จัดการคำสั่งซื้อ
          </h1>
          <p className="text-gray-500 text-sm mt-1">จัดการคำสั่งซื้อสินค้าและคอร์ส</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-colors theme-button"
        >
          <Plus className="w-4 h-4" /> สร้างคำสั่งซื้อ
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-900">สร้างคำสั่งซื้อใหม่</h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ลูกค้า *</label>
                  <select
                    required
                    value={createForm.userId}
                    onChange={(e) => setCreateForm({ ...createForm, userId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                    style={{ "--tw-ring-color": "rgba(var(--color-primary-rgb), 0.5)" } as any}
                  >
                    <option value="">เลือกลูกค้า</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ประเภท *</label>
                  <select
                    value={createForm.type}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        type: e.target.value as "course" | "product",
                        productId: "",
                        amount: 0,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                    style={{ "--tw-ring-color": "rgba(var(--color-primary-rgb), 0.5)" } as any}
                  >
                    <option value="product">สินค้า</option>
                    <option value="course">คอร์ส</option>
                  </select>
                </div>

                {createForm.type === "product" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">สินค้า *</label>
                      <select
                        required
                        value={createForm.productId}
                        onChange={(e) => handleProductChange(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                        style={{ "--tw-ring-color": "rgba(var(--color-primary-rgb), 0.5)" } as any}
                      >
                        <option value="">เลือกสินค้า</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} (฿{p.price.toLocaleString()})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">จำนวน *</label>
                      <input
                        required
                        type="number"
                        min="1"
                        value={createForm.quantity}
                        onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                        style={{ "--tw-ring-color": "rgba(var(--color-primary-rgb), 0.5)" } as any}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ยอดเงิน (฿) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={createForm.amount}
                    onChange={(e) => setCreateForm({ ...createForm, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                    style={{ "--tw-ring-color": "rgba(var(--color-primary-rgb), 0.5)" } as any}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">สถานะ *</label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value as any })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                    style={{ "--tw-ring-color": "rgba(var(--color-primary-rgb), 0.5)" } as any}
                  >
                    <option value="pending">รอตรวจสอบ</option>
                    <option value="confirmed">ยืนยันแล้ว</option>
                    <option value="completed">สำเร็จ</option>
                    <option value="cancelled">ยกเลิก</option>
                  </select>
                </div>

                {createError && (
                  <div className="flex items-start gap-2 text-sm p-3 rounded-xl bg-red-50 text-red-700">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{createError}</span>
                  </div>
                )}
                {createSuccess && (
                  <div className="flex items-start gap-2 text-sm p-3 rounded-xl bg-green-50 text-green-700">
                    <Check className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>สร้างคำสั่งซื้อสำเร็จ</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 px-6 py-5 border-t border-gray-100 sticky bottom-0 bg-white">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2.5 text-white font-semibold rounded-xl disabled:opacity-50 transition-colors text-sm theme-button"
                >
                  {creating ? "กำลังสร้าง..." : "สร้าง"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "ทั้งหมด", value: stats.total },
          { label: "รอตรวจสอบ", value: stats.pending },
          { label: "ยืนยันแล้ว", value: stats.confirmed },
          { label: "สำเร็จ", value: stats.completed },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap items-center">
        <div className="flex gap-2">
          {(["all", "course", "product"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                filterType === t
                  ? "text-white theme-button"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {t === "all" ? "ทั้งหมด" : t === "course" ? "คอร์ส" : "สินค้า"}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {(["all", "pending", "confirmed", "completed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                filterStatus === s
                  ? "text-white theme-button"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {s === "all" ? "ทั้งหมด" : STATUS_LABEL[s]?.label || s}
            </button>
          ))}
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาชื่อ อีเมล หรือชื่อสินค้า..."
          className="ml-auto w-56 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 bg-white"
          style={{ "--tw-ring-color": "rgba(var(--color-primary-rgb), 0.5)" } as any}
        />
      </div>

      {/* Orders List */}
      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <ShoppingCart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">{search ? "ไม่พบรายการสั่งซื้อ" : "ยังไม่มีรายการสั่งซื้อ"}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((order) => {
            const label = STATUS_LABEL[order.status];
            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: "rgba(var(--color-primary-rgb), 0.1)" }}
                      >
                        {order.type === "course" ? (
                          <ShoppingCart className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
                        ) : (
                          <Package className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {order.courseId?.title || order.productId?.name || "ไม่ระบุ"}
                          </h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                            {TYPE_LABEL[order.type]}
                          </span>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{
                              backgroundColor: `rgba(var(--color-primary-rgb, 59, 130, 246), 0.1)`,
                              color: "var(--color-primary)",
                            }}
                          >
                            {label.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {order.userId.name} ({order.userId.email})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-600 flex-wrap">
                      <span>ยอดเงิน: ฿{order.amount.toLocaleString()}</span>
                      {order.type === "product" && order.quantity && (
                        <span>จำนวน: {order.quantity}</span>
                      )}
                      <span>{new Date(order.createdAt).toLocaleDateString("th-TH")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      disabled={acting === order._id}
                      className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 bg-white cursor-pointer disabled:opacity-50"
                      style={{ "--tw-ring-color": "rgba(var(--color-primary-rgb), 0.5)" } as any}
                    >
                      <option value="pending">รอตรวจสอบ</option>
                      <option value="confirmed">ยืนยันแล้ว</option>
                      <option value="completed">สำเร็จ</option>
                      <option value="cancelled">ยกเลิก</option>
                    </select>
                    <button
                      onClick={() => handleDelete(order._id)}
                      disabled={acting === order._id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-3">แสดง {filtered.length} / {orders.length} รายการสั่งซื้อ</p>
    </div>
  );
}
