"use client";
import { useState, useEffect, useCallback } from "react";
import { Tag, Building2, Copy, Check, Plus, X, AlertCircle } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Coupon {
  _id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  institutionId?: { name: string; slug: string } | null;
  courseIds?: { title: string }[];
}

export default function SuperAdminCouponsPage() {
  const [coupons,  setCoupons]  = useState<Coupon[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [copied,   setCopied]   = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState(false);
  const [createForm, setCreateForm] = useState({
    code: "",
    type: "percent" as "percent" | "fixed",
    value: 0,
    maxUses: null as number | null,
    expiresAt: "",
    isActive: true,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/coupons");
      const data = await res.json();
      setCoupons(Array.isArray(data) ? data : []);
    } catch {
      setCoupons([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    if (!createForm.code || createForm.value <= 0) {
      setCreateError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/super-admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...createForm,
          expiresAt: createForm.expiresAt ? new Date(createForm.expiresAt).toISOString() : null,
        }),
      });
      if (res.ok) {
        setCreateSuccess(true);
        setCreateForm({ code: "", type: "percent", value: 0, maxUses: null, expiresAt: "", isActive: true });
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
    setCopied(code); setTimeout(() => setCopied(null), 2000);
  };

  const filtered = coupons.filter((c) => {
    const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
    const full    = c.maxUses !== null && c.usedCount >= c.maxUses;
    const active  = c.isActive && !expired && !full;
    if (filterActive === "active"   && !active)  return false;
    if (filterActive === "inactive" && active)   return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.code.toLowerCase().includes(q) ||
        (c.institutionId?.name ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalUsed = coupons.reduce((s, c) => s + c.usedCount, 0);
  const activeCount = coupons.filter((c) => {
    const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
    const full    = c.maxUses !== null && c.usedCount >= c.maxUses;
    return c.isActive && !expired && !full;
  }).length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">คูปอง/โปรโมชั่น (Platform-wide)</h1>
          <p className="text-gray-500 text-sm mt-1">โปรโมชั่นและคูปองทุกสถาบันบนแพลตฟอร์ม</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-colors theme-button"
        >
          <Plus className="w-4 h-4" /> สร้างคูปอง
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">สร้างคูปอง/โปรโมชั่นใหม่</h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="px-6 py-5 space-y-4">
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
                      onChange={(e) => setCreateForm({ ...createForm, type: e.target.value as "percent" | "fixed" })}
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

                <div className="flex items-center gap-3">
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
                    <span>สร้างคูปองสำเร็จ</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3 px-6 py-5 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2.5 text-white font-semibold rounded-xl disabled:opacity-50 transition-colors text-sm theme-button"
                >
                  {creating ? "กำลังสร้าง..." : "สร้างคูปอง"}
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

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "คูปองทั้งหมด",  value: coupons.length },
          { label: "ใช้งานได้",      value: activeCount },
          { label: "ใช้งานแล้ว (ครั้ง)", value: totalUsed },
        ].map((k, i) => (
          <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-2xl font-bold" style={{ color: i === 0 ? 'var(--color-primary)' : i === 1 ? '#16a34a' : '#2563eb' }}>{k.value.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex gap-2">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button key={f} onClick={() => setFilterActive(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${filterActive === f ? "text-white theme-button" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}>
              {f === "all" ? "ทั้งหมด" : f === "active" ? "ใช้งานได้" : "ปิดใช้งาน"}
            </button>
          ))}
        </div>
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาโค้ด / สถาบัน..."
          className="ml-auto w-56 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 bg-white"
          style={{ '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.5)' } as any}
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Tag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">{search ? "ไม่พบคูปองที่ค้นหา" : "ยังไม่มีคูปอง"}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((c) => {
            const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
            const full    = c.maxUses !== null && c.usedCount >= c.maxUses;
            const inactive = !c.isActive || expired || full;
            const usePct  = c.maxUses ? Math.round((c.usedCount / c.maxUses) * 100) : null;
            return (
              <div key={c._id} className="bg-white rounded-2xl border p-4" style={{ borderColor: inactive ? '#f3f4f6' : 'rgba(var(--color-primary-rgb), 0.3)', opacity: inactive ? 0.6 : 1 }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: inactive ? '#f3f4f6' : 'rgba(var(--color-primary-rgb), 0.1)' }}>
                    <Tag className="w-5 h-5" style={{ color: inactive ? '#9ca3af' : 'var(--color-primary)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 tracking-widest text-sm font-mono">{c.code}</span>
                      <button onClick={() => copy(c.code)} className="text-gray-400 transition-colors" style={{ color: 'rgb(156, 163, 175)' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'rgb(156, 163, 175)'; }}>
                        {copied === c.code ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${c.type === "percent" ? "bg-indigo-100 text-indigo-700" : "bg-teal-100 text-teal-700"}`}>
                        {c.type === "percent" ? `ลด ${c.value}%` : `ลด ฿${c.value.toLocaleString()}`}
                      </span>
                      {!c.isActive && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">ปิด</span>}
                      {expired    && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">หมดอายุ</span>}
                      {full       && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">ใช้ครบ</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" style={{ color: 'var(--color-primary)' }} />
                        {c.institutionId?.name ?? "—"}
                      </span>
                      <span>ใช้แล้ว {c.usedCount}{c.maxUses ? `/${c.maxUses} (${usePct}%)` : ""} ครั้ง</span>
                      {c.expiresAt && (
                        <span>หมดอายุ {new Date(c.expiresAt).toLocaleDateString("th-TH")}</span>
                      )}
                      {c.courseIds && c.courseIds.length > 0 && (
                        <span>{c.courseIds.map((co) => co.title).join(", ")}</span>
                      )}
                      <span className="ml-auto">{new Date(c.createdAt).toLocaleDateString("th-TH")}</span>
                    </div>
                    {/* Usage bar */}
                    {usePct !== null && (
                      <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden w-48">
                        <div className={`h-full rounded-full transition-all ${usePct >= 100 ? "bg-red-400" : usePct >= 75 ? "bg-orange-400" : ""}`}
                          style={{ width: `${Math.min(usePct, 100)}%`, backgroundColor: usePct < 75 ? 'var(--color-primary)' : undefined }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
