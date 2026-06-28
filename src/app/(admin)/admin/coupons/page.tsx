"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag, Copy, Check } from "lucide-react";
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
  courseIds: { _id: string; title: string }[];
  createdAt: string;
}

const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [copied,  setCopied]  = useState<string | null>(null);
  const [form, setForm] = useState({ code: "", type: "percent", value: "", maxUses: "", expiresAt: "" });

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/admin/coupons");
    const d = await r.json();
    setCoupons(Array.isArray(d) ? d : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const r = await fetch("/api/admin/coupons", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, value: Number(form.value), maxUses: form.maxUses ? Number(form.maxUses) : null }),
    });
    if (r.ok) { await load(); setShowForm(false); setForm({ code: "", type: "percent", value: "", maxUses: "", expiresAt: "" }); }
    else { const e2 = await r.json(); alert(e2.error ?? "เกิดข้อผิดพลาด"); }
    setSaving(false);
  };

  const toggle = async (id: string, isActive: boolean) => {
    await fetch(`/api/admin/coupons/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !isActive }) });
    setCoupons((prev) => prev.map((c) => c._id === id ? { ...c, isActive: !isActive } : c));
  };

  const remove = async (id: string) => {
    if (!confirm("ลบคูปองนี้?")) return;
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    setCoupons((prev) => prev.filter((c) => c._id !== id));
  };

  const copy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code); setTimeout(() => setCopied(null), 2000);
  };

  const genCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    setForm((f) => ({ ...f, code: Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("") }));
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">คูปองส่วนลด</h1>
          <p className="text-gray-500 text-sm mt-1">สร้างและจัดการโค้ดส่วนลดสำหรับผู้เรียน</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" /> สร้างคูปอง
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-5">สร้างคูปองใหม่</h2>
            <form onSubmit={create} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">โค้ด</label>
                <div className="flex gap-2">
                  <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    required className={inputCls} placeholder="SUMMER20" />
                  <button type="button" onClick={genCode}
                    className="px-3 py-2 text-xs bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 whitespace-nowrap font-medium">สุ่ม</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ประเภท</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputCls}>
                    <option value="percent">% ส่วนลด</option>
                    <option value="fixed">ลดคงที่ (฿)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {form.type === "percent" ? "ส่วนลด (%)" : "ลด (฿)"}
                  </label>
                  <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })}
                    required min={1} max={form.type === "percent" ? 100 : undefined} className={inputCls} placeholder={form.type === "percent" ? "20" : "500"} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ใช้ได้สูงสุด (ครั้ง)</label>
                  <input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                    min={1} className={inputCls} placeholder="ไม่จำกัด" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">วันหมดอายุ</label>
                  <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className={inputCls} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">ยกเลิก</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
                  {saving ? "กำลังสร้าง..." : "สร้างคูปอง"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Tag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">ยังไม่มีคูปอง</p>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((c) => {
            const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
            const full = c.maxUses !== null && c.usedCount >= c.maxUses;
            const inactive = !c.isActive || expired || full;
            return (
              <div key={c._id} className={`bg-white rounded-2xl border p-5 ${inactive ? "border-gray-100 opacity-60" : "border-indigo-100"}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${inactive ? "bg-gray-100" : "bg-indigo-50"}`}>
                    <Tag className={`w-5 h-5 ${inactive ? "text-gray-400" : "text-indigo-500"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 tracking-widest text-sm">{c.code}</span>
                      <button onClick={() => copy(c.code)} className="text-gray-400 hover:text-indigo-500 transition-colors">
                        {copied === c.code ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${c.type === "percent" ? "bg-violet-100 text-violet-700" : "bg-teal-100 text-teal-700"}`}>
                        {c.type === "percent" ? `${c.value}%` : `฿${c.value.toLocaleString()}`}
                      </span>
                      {expired && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">หมดอายุ</span>}
                      {full   && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">ใช้ครบแล้ว</span>}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                      <span>ใช้แล้ว {c.usedCount}{c.maxUses !== null ? `/${c.maxUses}` : ""} ครั้ง</span>
                      {c.expiresAt && <span>หมดอายุ {new Date(c.expiresAt).toLocaleDateString("th-TH")}</span>}
                      {c.courseIds.length > 0 && <span>{c.courseIds.map((co) => co.title).join(", ")}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => toggle(c._id, c.isActive)}
                      className={`transition-colors ${c.isActive ? "text-indigo-500" : "text-gray-300"}`}>
                      {c.isActive ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                    </button>
                    <button onClick={() => remove(c._id)} className="p-1.5 text-gray-300 hover:text-red-500 rounded-xl transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
