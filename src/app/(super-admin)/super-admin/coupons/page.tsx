"use client";
import { useState, useEffect } from "react";
import { Tag, Building2, Copy, Check } from "lucide-react";
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

  useEffect(() => {
    setLoading(true);
    fetch("/api/super-admin/coupons")
      .then((r) => r.json())
      .then((d) => setCoupons(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">คูปองส่วนลด (Platform-wide)</h1>
        <p className="text-gray-500 text-sm mt-1">คูปองทุกสถาบันบนแพลตฟอร์ม</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "คูปองทั้งหมด",  value: coupons.length,  color: "bg-violet-50 text-violet-700" },
          { label: "ใช้งานได้",      value: activeCount,     color: "bg-green-50  text-green-700"  },
          { label: "ใช้งานแล้ว (ครั้ง)", value: totalUsed,  color: "bg-blue-50   text-blue-700"   },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className={`text-2xl font-bold ${k.color.split(" ")[1]}`}>{k.value.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex gap-2">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button key={f} onClick={() => setFilterActive(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${filterActive === f ? "bg-violet-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-violet-300"}`}>
              {f === "all" ? "ทั้งหมด" : f === "active" ? "ใช้งานได้" : "ปิดใช้งาน"}
            </button>
          ))}
        </div>
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาโค้ด / สถาบัน..."
          className="ml-auto w-56 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
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
              <div key={c._id} className={`bg-white rounded-2xl border p-4 ${inactive ? "border-gray-100 opacity-60" : "border-violet-100"}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${inactive ? "bg-gray-100" : "bg-violet-50"}`}>
                    <Tag className={`w-5 h-5 ${inactive ? "text-gray-400" : "text-violet-500"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 tracking-widest text-sm font-mono">{c.code}</span>
                      <button onClick={() => copy(c.code)} className="text-gray-400 hover:text-violet-500 transition-colors">
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
                        <Building2 className="w-3 h-3 text-violet-400" />
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
                        <div className={`h-full rounded-full transition-all ${usePct >= 100 ? "bg-red-400" : usePct >= 75 ? "bg-orange-400" : "bg-violet-400"}`}
                          style={{ width: `${Math.min(usePct, 100)}%` }} />
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
