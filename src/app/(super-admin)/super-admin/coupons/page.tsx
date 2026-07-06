"use client";
import { useState, useEffect, useCallback } from "react";
import { Tag, Gift, Box, Building2, Copy, Check, Plus, X, AlertCircle } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Item {
  _id: string;
  itemType: "coupon" | "promotion" | "package";
  code?: string;
  name?: string;
  title?: string;
  description?: string;
  type?: "percent" | "fixed";
  value?: number;
  price?: number;
  originalPrice?: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt?: string | null;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  institutionId?: { name: string; slug: string } | null;
  courseIds?: { title: string }[];
  features?: string[];
}

type ItemType = "coupon" | "promotion" | "package";

const TABS: { id: ItemType; label: string; icon: React.ReactNode }[] = [
  { id: "coupon", label: "คูปอง", icon: <Tag className="w-4 h-4" /> },
  { id: "promotion", label: "โปรโมชั่น", icon: <Gift className="w-4 h-4" /> },
  { id: "package", label: "แพ็จเกจ", icon: <Box className="w-4 h-4" /> },
];

export default function SuperAdminCouponsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [activeTab, setActiveTab] = useState<ItemType>("coupon");
  const [isMounted, setIsMounted] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState(false);
  const [createForm, setCreateForm] = useState<any>({
    // Coupon fields
    code: "",
    type: "percent" as "percent" | "fixed",
    value: 0,
    // Promotion fields
    title: "",
    description: "",
    startDate: "",
    // Package fields
    name: "",
    price: 0,
    originalPrice: null,
    // Common fields
    maxUses: null as number | null,
    expiresAt: "",
    endDate: "",
    isActive: true,
  });

  // Restore state from sessionStorage on mount
  useEffect(() => {
    const savedTab = sessionStorage.getItem("superadmin-coupons-tab");
    const savedFilter = sessionStorage.getItem("superadmin-coupons-filter");
    const savedSearch = sessionStorage.getItem("superadmin-coupons-search");

    if (savedTab && ["coupon", "promotion", "package"].includes(savedTab)) {
      setActiveTab(savedTab as ItemType);
    }
    if (savedFilter && ["all", "active", "inactive"].includes(savedFilter)) {
      setFilterActive(savedFilter as any);
    }
    if (savedSearch) {
      setSearch(savedSearch);
    }
    setIsMounted(true);
  }, []);

  // Save active tab
  useEffect(() => {
    if (isMounted) {
      sessionStorage.setItem("superadmin-coupons-tab", activeTab);
    }
  }, [activeTab, isMounted]);

  // Save filter
  useEffect(() => {
    if (isMounted) {
      sessionStorage.setItem("superadmin-coupons-filter", filterActive);
    }
  }, [filterActive, isMounted]);

  // Save search
  useEffect(() => {
    if (isMounted) {
      sessionStorage.setItem("superadmin-coupons-search", search);
    }
  }, [search, isMounted]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/super-admin/coupons?type=${activeTab}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, [activeTab]);

  useEffect(() => {
    if (isMounted) {
      load();
    }
  }, [load, isMounted]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");

    // Validation based on type
    if (activeTab === "coupon" && (!createForm.code || createForm.value <= 0)) {
      setCreateError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    if (activeTab === "promotion" && (!createForm.title || !createForm.startDate || createForm.value <= 0)) {
      setCreateError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    if (activeTab === "package" && (!createForm.name || createForm.price <= 0)) {
      setCreateError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setCreating(true);
    try {
      const payload: any = { itemType: activeTab, ...createForm };

      // Format dates
      if (createForm.expiresAt) payload.expiresAt = new Date(createForm.expiresAt).toISOString();
      if (createForm.endDate) payload.endDate = new Date(createForm.endDate).toISOString();
      if (createForm.startDate) payload.startDate = new Date(createForm.startDate).toISOString();

      const res = await fetch("/api/super-admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setCreateSuccess(true);
        // Reset form based on type
        if (activeTab === "coupon") {
          setCreateForm({ code: "", type: "percent", value: 0, maxUses: null, expiresAt: "", isActive: true });
        } else if (activeTab === "promotion") {
          setCreateForm({ title: "", description: "", type: "percent", value: 0, startDate: "", endDate: "", maxUses: null, isActive: true });
        } else {
          setCreateForm({ name: "", description: "", price: 0, originalPrice: null, maxUses: null, expiresAt: "", isActive: true });
        }
        setTimeout(() => { setShowCreate(false); setCreateSuccess(false); }, 1500);
        load();
      } else {
        const err = await res.json();
        setCreateError(err.error || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      setCreateError("เกิดข้อผิดพลาด");
    }
    setCreating(false);
  };

  const copy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = items.filter((c) => {
    const expired = (c.expiresAt && new Date(c.expiresAt) < new Date()) || (c.endDate && new Date(c.endDate) < new Date());
    const full = c.maxUses !== null && c.usedCount >= c.maxUses;
    const active = c.isActive && !expired && !full;

    if (filterActive === "active" && !active) return false;
    if (filterActive === "inactive" && active) return false;

    if (search) {
      const q = search.toLowerCase();
      return (
        (c.code?.toLowerCase().includes(q) || false) ||
        (c.name?.toLowerCase().includes(q) || false) ||
        (c.title?.toLowerCase().includes(q) || false) ||
        ((c.institutionId?.name ?? "").toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalUsed = items.reduce((s, c) => s + c.usedCount, 0);
  const activeCount = items.filter((c) => {
    const expired = (c.expiresAt && new Date(c.expiresAt) < new Date()) || (c.endDate && new Date(c.endDate) < new Date());
    const full = c.maxUses !== null && c.usedCount >= c.maxUses;
    return c.isActive && !expired && !full;
  }).length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">คูปอง/โปรโมชั่น/แพ็จเกจ</h1>
          <p className="text-gray-500 text-sm mt-1">จัดการคูปอง โปรโมชั่น และแพ็จเกจทั้งหมด</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-colors theme-button"
        >
          <Plus className="w-4 h-4" /> สร้าง{TABS.find(t => t.id === activeTab)?.label}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map((tab) => (
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

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-900">
                สร้าง{TABS.find(t => t.id === activeTab)?.label}ใหม่
              </h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="px-6 py-5 space-y-4">
                {/* Coupon Fields */}
                {activeTab === "coupon" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">รหัสคูปอง *</label>
                      <input
                        required
                        type="text"
                        value={createForm.code}
                        onChange={(e) => setCreateForm({ ...createForm, code: e.target.value.toUpperCase() })}
                        placeholder="เช่น SUMMER2024"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white font-mono"
                        style={{ '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.5)' } as any}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">ประเภท *</label>
                        <select
                          value={createForm.type}
                          onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                          style={{ '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.5)' } as any}
                        >
                          <option value="percent">เปอร์เซ็นต์ (%)</option>
                          <option value="fixed">จำนวนเงิน (฿)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">ค่าลด *</label>
                        <input
                          required
                          type="number"
                          step={createForm.type === "percent" ? "1" : "0.01"}
                          min="0"
                          value={createForm.value}
                          onChange={(e) => setCreateForm({ ...createForm, value: parseFloat(e.target.value) || 0 })}
                          placeholder="0"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                          style={{ '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.5)' } as any}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">จำนวนการใช้สูงสุด (ไม่บังคับ)</label>
                      <input
                        type="number"
                        min="1"
                        value={createForm.maxUses || ""}
                        onChange={(e) => setCreateForm({ ...createForm, maxUses: e.target.value ? parseInt(e.target.value) : null })}
                        placeholder="ไม่จำกัด"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                        style={{ '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.5)' } as any}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">วันหมดอายุ (ไม่บังคับ)</label>
                      <input
                        type="date"
                        value={createForm.expiresAt}
                        onChange={(e) => setCreateForm({ ...createForm, expiresAt: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                        style={{ '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.5)' } as any}
                      />
                    </div>
                  </>
                )}

                {/* Promotion Fields */}
                {activeTab === "promotion" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อโปรโมชั่น *</label>
                      <input
                        required
                        type="text"
                        value={createForm.title}
                        onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                        placeholder="เช่น ลดราคาปลายปี"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                        style={{ '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.5)' } as any}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">รายละเอียด</label>
                      <textarea
                        rows={3}
                        value={createForm.description}
                        onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                        placeholder="รายละเอียดโปรโมชั่น"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white resize-none"
                        style={{ '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.5)' } as any}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">ประเภท *</label>
                        <select
                          value={createForm.type}
                          onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                          style={{ '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.5)' } as any}
                        >
                          <option value="percent">เปอร์เซ็นต์ (%)</option>
                          <option value="fixed">จำนวนเงิน (฿)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">ค่าลด *</label>
                        <input
                          required
                          type="number"
                          step={createForm.type === "percent" ? "1" : "0.01"}
                          min="0"
                          value={createForm.value}
                          onChange={(e) => setCreateForm({ ...createForm, value: parseFloat(e.target.value) || 0 })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                          style={{ '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.5)' } as any}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">วันเริ่ม *</label>
                        <input
                          required
                          type="date"
                          value={createForm.startDate}
                          onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                          style={{ '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.5)' } as any}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">วันสิ้นสุด (ไม่บังคับ)</label>
                        <input
                          type="date"
                          value={createForm.endDate}
                          onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                          style={{ '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.5)' } as any}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">จำนวนการใช้สูงสุด (ไม่บังคับ)</label>
                      <input
                        type="number"
                        min="1"
                        value={createForm.maxUses || ""}
                        onChange={(e) => setCreateForm({ ...createForm, maxUses: e.target.value ? parseInt(e.target.value) : null })}
                        placeholder="ไม่จำกัด"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                        style={{ '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.5)' } as any}
                      />
                    </div>
                  </>
                )}

                {/* Package Fields */}
                {activeTab === "package" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อแพ็จเกจ *</label>
                      <input
                        required
                        type="text"
                        value={createForm.name}
                        onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                        placeholder="เช่น แพ็จเกจเรียนปกติ"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                        style={{ '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.5)' } as any}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">รายละเอียด</label>
                      <textarea
                        rows={3}
                        value={createForm.description}
                        onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                        placeholder="รายละเอียดแพ็จเกจ"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white resize-none"
                        style={{ '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.5)' } as any}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">ราคา *</label>
                        <input
                          required
                          type="number"
                          step="0.01"
                          min="0"
                          value={createForm.price}
                          onChange={(e) => setCreateForm({ ...createForm, price: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                          style={{ '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.5)' } as any}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">ราคาเดิม (ไม่บังคับ)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={createForm.originalPrice || ""}
                          onChange={(e) => setCreateForm({ ...createForm, originalPrice: e.target.value ? parseFloat(e.target.value) : null })}
                          placeholder="0.00"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                          style={{ '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.5)' } as any}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">จำนวนการใช้สูงสุด (ไม่บังคับ)</label>
                      <input
                        type="number"
                        min="1"
                        value={createForm.maxUses || ""}
                        onChange={(e) => setCreateForm({ ...createForm, maxUses: e.target.value ? parseInt(e.target.value) : null })}
                        placeholder="ไม่จำกัด"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                        style={{ '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.5)' } as any}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">วันหมดอายุ (ไม่บังคับ)</label>
                      <input
                        type="date"
                        value={createForm.expiresAt}
                        onChange={(e) => setCreateForm({ ...createForm, expiresAt: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                        style={{ '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.5)' } as any}
                      />
                    </div>
                  </>
                )}

                {/* Common Fields */}
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={createForm.isActive}
                    onChange={(e) => setCreateForm({ ...createForm, isActive: e.target.checked })}
                    className="w-4 h-4 border border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700 cursor-pointer">เปิดใช้งาน</label>
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
                    <span>สร้างสำเร็จ</span>
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
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: `${TABS.find(t => t.id === activeTab)?.label}ทั้งหมด`, value: items.length },
          { label: "ใช้งานได้", value: activeCount },
          { label: "ใช้งานแล้ว (ครั้ง)", value: totalUsed },
        ].map((k, i) => (
          <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-2xl font-bold" style={{ color: i === 0 ? 'var(--color-primary)' : i === 1 ? '#16a34a' : '#2563eb' }}>{k.value.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(["all", "active", "inactive"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilterActive(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              filterActive === f ? "text-white theme-button" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {f === "all" ? "ทั้งหมด" : f === "active" ? "ใช้งานได้" : "ปิดใช้งาน"}
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหา..."
          className="ml-auto w-56 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 bg-white"
          style={{ '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.5)' } as any}
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Tag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">{search ? "ไม่พบรายการ" : `ยังไม่มี${TABS.find(t => t.id === activeTab)?.label}`}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => {
            const expired = (item.expiresAt && new Date(item.expiresAt) < new Date()) || (item.endDate && new Date(item.endDate) < new Date());
            const full = item.maxUses !== null && item.usedCount >= item.maxUses;
            const inactive = !item.isActive || expired || full;

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border p-4"
                style={{
                  borderColor: inactive ? '#f3f4f6' : 'rgba(var(--color-primary-rgb), 0.3)',
                  opacity: inactive ? 0.6 : 1,
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: inactive ? '#f3f4f6' : 'rgba(var(--color-primary-rgb), 0.1)' }}
                  >
                    {item.itemType === "coupon" ? (
                      <Tag className="w-5 h-5" style={{ color: inactive ? '#9ca3af' : 'var(--color-primary)' }} />
                    ) : item.itemType === "promotion" ? (
                      <Gift className="w-5 h-5" style={{ color: inactive ? '#9ca3af' : 'var(--color-primary)' }} />
                    ) : (
                      <Box className="w-5 h-5" style={{ color: inactive ? '#9ca3af' : 'var(--color-primary)' }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.itemType === "coupon" && (
                        <>
                          <span className="font-bold text-gray-900 tracking-widest text-sm font-mono">{item.code}</span>
                          <button
                            onClick={() => copy(item.code!)}
                            className="text-gray-400 transition-colors"
                            style={{ color: 'rgb(156, 163, 175)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgb(156, 163, 175)'; }}
                          >
                            {copied === item.code ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </>
                      )}
                      {item.itemType === "promotion" && <span className="font-bold text-gray-900">{item.title}</span>}
                      {item.itemType === "package" && <span className="font-bold text-gray-900">{item.name}</span>}

                      {item.itemType === "coupon" && item.type && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-indigo-100 text-indigo-700">
                          {item.type === "percent" ? `ลด ${item.value}%` : `ลด ฿${item.value.toLocaleString()}`}
                        </span>
                      )}
                      {item.itemType === "promotion" && item.type && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-purple-100 text-purple-700">
                          {item.type === "percent" ? `ลด ${item.value}%` : `ลด ฿${item.value.toLocaleString()}`}
                        </span>
                      )}
                      {item.itemType === "package" && item.price && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-teal-100 text-teal-700">
                          ฿{item.price.toLocaleString()}
                        </span>
                      )}

                      {!item.isActive && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">ปิด</span>}
                      {expired && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">หมดอายุ</span>}
                      {full && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">ใช้ครบ</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                      {item.institutionId && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" style={{ color: 'var(--color-primary)' }} />
                          {item.institutionId.name}
                        </span>
                      )}
                      {item.itemType !== "package" && <span>ใช้แล้ว {item.usedCount}{item.maxUses ? `/${item.maxUses}` : ""} ครั้ง</span>}
                      {item.itemType === "package" && <span>ขายแล้ว {item.usedCount}{item.maxUses ? `/${item.maxUses}` : ""} ชุด</span>}
                      {item.expiresAt && (
                        <span>หมดอายุ {new Date(item.expiresAt).toLocaleDateString("th-TH")}</span>
                      )}
                      {item.endDate && (
                        <span>สิ้นสุด {new Date(item.endDate).toLocaleDateString("th-TH")}</span>
                      )}
                      <span className="ml-auto">{new Date(item.createdAt).toLocaleDateString("th-TH")}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-3">แสดง {filtered.length} / {items.length} รายการ</p>
    </div>
  );
}
