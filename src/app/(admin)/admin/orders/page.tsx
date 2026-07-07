"use client";
import { useState, useEffect, useCallback } from "react";
import { Package, ShoppingCart, Search, Trash2, Eye } from "lucide-react";
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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sales");
      if (!res.ok) {
        setOrders([]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
    if (!confirm("ลบรายการนี้?")) return;
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

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch =
      o.userId.name.toLowerCase().includes(q) ||
      o.userId.email.toLowerCase().includes(q) ||
      o.courseId?.title.toLowerCase().includes(q) ||
      o.productId?.name.toLowerCase().includes(q);

    const matchType = filterType === "all" || o.type === filterType;
    const matchStatus = filterStatus === "all" || o.status === filterStatus;

    return matchSearch && matchType && matchStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    completed: orders.filter((o) => o.status === "completed").length,
    totalRevenue: orders.reduce((sum, o) => sum + o.amount, 0),
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" style={{ color: "var(--color-primary)" }} />
            รายการขาย
          </h1>
          <p className="text-gray-500 text-sm mt-1">ดูรายการสินค้าและคอร์สที่ลูกค้าซื้อ</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: "รายการทั้งหมด", value: stats.total },
          { label: "รอตรวจสอบ", value: stats.pending },
          { label: "ยืนยันแล้ว", value: stats.confirmed },
          { label: "สำเร็จ", value: stats.completed },
          { label: "รายได้รวม", value: `฿${stats.totalRevenue.toLocaleString()}`, isRevenue: true },
        ].map((stat, i) => (
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
          placeholder="ค้นหาชื่อลูกค้า อีเมล หรือชื่อสินค้า..."
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
          <p className="text-gray-400 text-sm">{search ? "ไม่พบรายการ" : "ยังไม่มีการขายเลย"}</p>
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
                      <span className="font-semibold">฿{order.amount.toLocaleString()}</span>
                      {order.type === "product" && order.quantity && (
                        <span>จำนวน: {order.quantity}</span>
                      )}
                      <span>{new Date(order.createdAt).toLocaleDateString("th-TH")} {new Date(order.createdAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}</span>
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

      <p className="text-xs text-gray-400 mt-3">แสดง {filtered.length} / {orders.length} รายการ</p>
    </div>
  );
}
