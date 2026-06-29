"use client";
import { useEffect, useState } from "react";
import { useRef } from "react";
import {
  TrendingUp, CheckCircle2, Clock3, Building2,
  Plus, Check, X, ChevronDown, Receipt, Upload, ImageIcon,
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface CommissionRow {
  _id: string;
  name: string;
  slug: string;
  commissionRate: number;
  grossRevenue: number;
  totalCommission: number;
  netPayout: number;
  paidNetPayout: number;
  outstanding: number;
  bookingCount: number;
  pendingNetPayout: number;
}

interface PayoutRecord {
  _id: string;
  institutionId: { _id: string; name: string; slug: string } | string;
  periodLabel: string;
  grossRevenue: number;
  commissionRate: number;
  commissionAmount: number;
  netPayout: number;
  confirmedBookings: number;
  status: "pending" | "paid";
  paidAt: string | null;
  note: string;
  slipUrl: string;
  createdAt: string;
}

const fmt = (n: number) => {
  const r = Math.round(n * 100) / 100;
  const parts = r.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};

export default function PayoutsPage() {
  const [commissions, setCommissions] = useState<{ institutions: CommissionRow[]; platformTotalCommission: number; platformTotalGross: number; platformOutstanding: number } | null>(null);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ institutionId: "", periodLabel: periodNow(), slipUrl: "" });
  const createSlipRef = useRef<HTMLInputElement>(null);
  const [uploadingCreateSlip, setUploadingCreateSlip] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"summary" | "history">("summary");
  const [payingId, setPayingId] = useState<string | null>(null);
  const [slipUrl, setSlipUrl] = useState("");
  const [payNote, setPayNote] = useState("");
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const slipRef = useRef<HTMLInputElement>(null);

  function periodNow() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  const load = async () => {
    const [cRes, pRes] = await Promise.all([
      fetch("/api/super-admin/commission"),
      fetch("/api/super-admin/payouts"),
    ]);
    if (cRes.ok) setCommissions(await cRes.json());
    if (pRes.ok) setPayouts(await pRes.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!creating) return;
    fetch("/api/super-admin/commission")
      .then((r) => r.json())
      .then((data) => { if (data.institutions) setCommissions(data); });
  }, [creating]);

  const uploadCreateSlip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCreateSlip(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok && data.url) setCreateForm((f) => ({ ...f, slipUrl: data.url }));
    setUploadingCreateSlip(false);
    e.target.value = "";
  };

  const createPayout = async () => {
    if (!createForm.institutionId || !createForm.periodLabel) return;
    if (!createForm.slipUrl) { setError("กรุณาแนบหลักฐานการโอนก่อนสร้าง Payout"); return; }
    setSaving(true);
    setError("");
    const res = await fetch("/api/super-admin/payouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm),
    });
    setSaving(false);
    if (res.ok) { setCreating(false); load(); }
    else { const d = await res.json(); setError(d.error ?? "เกิดข้อผิดพลาด"); }
  };

  const uploadSlip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSlip(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok && data.url) setSlipUrl(data.url);
    setUploadingSlip(false);
    e.target.value = "";
  };

  const openCreateFor = (institutionId: string) => {
    setCreateForm({ institutionId, periodLabel: periodNow(), slipUrl: "" });
    setError("");
    setCreating(true);
  };

  const openPayModal = (id: string) => {
    setPayingId(id);
    setSlipUrl("");
    setPayNote("");
  };

  const confirmPaid = async () => {
    if (!payingId || !slipUrl) return;
    setSaving(true);
    await fetch(`/api/super-admin/payouts/${payingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid", note: payNote, slipUrl }),
    });
    setSaving(false);
    setPayingId(null);
    load();
  };

  const markPaid = async (id: string, note?: string) => {
    await fetch(`/api/super-admin/payouts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid", note: note ?? "" }),
    });
    load();
  };

  const deletePayout = async (id: string) => {
    if (!confirm("ลบรายการนี้?")) return;
    await fetch(`/api/super-admin/payouts/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return <LoadingSpinner />;

  const pendingPayouts = payouts.filter((p) => p.status === "pending");
  const paidPayouts = payouts.filter((p) => p.status === "paid");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commission & Payout</h1>
          <p className="text-gray-500 text-sm mt-1">จัดการค่าคอมมิชชันและการจ่ายเงินให้สถาบัน</p>
        </div>
        <button
          onClick={() => { setCreating(true); setError(""); }}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> สร้าง Payout
        </button>
      </div>

      {/* Platform totals */}
      {commissions && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-l-4 border-gray-100 border-l-violet-500 p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-violet-600" />
              <span className="text-gray-700 text-sm font-medium">รายได้รวมทั้งหมด</span>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">฿{fmt(commissions.platformTotalGross)}</div>
            <div className="text-gray-500 text-xs mt-1">จากทุกสถาบัน</div>
          </div>
          <div className="bg-white rounded-2xl border border-l-4 border-gray-100 border-l-green-500 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Receipt className="w-5 h-5 text-green-600" />
              <span className="text-gray-700 text-sm font-medium">Commission ที่ได้รับ</span>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">฿{fmt(commissions.platformTotalCommission)}</div>
            <div className="text-gray-500 text-xs mt-1">รายได้สุทธิของแพลตฟอร์ม</div>
          </div>
          <div className="bg-white rounded-2xl border border-l-4 border-gray-100 border-l-red-500 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock3 className="w-5 h-5 text-red-600" />
              <span className="text-gray-700 text-sm font-medium">ค้างจ่ายสถาบัน</span>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">฿{fmt(commissions.platformOutstanding)}</div>
            <div className="text-gray-500 text-xs mt-1">ยอดรวมที่ยังไม่ได้โอน</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(["summary", "history"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm rounded-lg transition-colors font-medium ${
              activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>
            {tab === "summary" ? "ยอดรวมต่อสถาบัน" : "ประวัติ Payout"}
          </button>
        ))}
      </div>

      {activeTab === "summary" && commissions && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">Commission รวมต่อสถาบัน</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {commissions.institutions.map((row) => (
              <div key={row._id} className="p-4">
                {/* Institution name + badge */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-violet-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{row.name}</p>
                      <p className="text-xs text-gray-400">Commission {row.commissionRate}% · {row.bookingCount} bookings</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openCreateFor(row._id)}
                    className="shrink-0 flex items-center gap-1 text-xs px-3 py-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> สร้าง Payout
                  </button>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div className="bg-gray-50 rounded-xl px-3 py-2">
                    <p className="text-[10px] text-gray-400 mb-0.5">รายได้รวม</p>
                    <p className="text-sm font-bold text-gray-900">฿{fmt(row.grossRevenue)}</p>
                  </div>
                  <div className="bg-violet-50 rounded-xl px-3 py-2">
                    <p className="text-[10px] text-violet-400 mb-0.5">Commission</p>
                    <p className="text-sm font-bold text-violet-600">฿{fmt(row.totalCommission)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl px-3 py-2">
                    <p className="text-[10px] text-gray-400 mb-0.5">ต้องจ่ายสถาบัน</p>
                    <p className="text-sm font-bold text-gray-700">฿{fmt(row.netPayout)}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl px-3 py-2">
                    <p className="text-[10px] text-green-400 mb-0.5">จ่ายแล้ว</p>
                    <p className="text-sm font-bold text-green-600">฿{fmt(row.paidNetPayout)}</p>
                  </div>
                  <div className={`rounded-xl px-3 py-2 col-span-2 sm:col-span-1 ${row.outstanding > 0 ? "bg-red-50" : "bg-gray-50"}`}>
                    <p className={`text-[10px] mb-0.5 ${row.outstanding > 0 ? "text-red-400" : "text-gray-400"}`}>ค้างจ่าย</p>
                    <p className={`text-sm font-bold ${row.outstanding > 0 ? "text-red-500" : "text-gray-400"}`}>฿{fmt(row.outstanding)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-3">
          {payouts.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">ยังไม่มีรายการ Payout</div>
          )}
          {payouts.map((p) => {
            const instName = typeof p.institutionId === "object" ? p.institutionId.name : p.institutionId;
            return (
              <div key={p._id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{instName}</span>
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{p.periodLabel}</span>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                      <span>รายได้ ฿{fmt(p.grossRevenue)}</span>
                      <span className="text-violet-600">Commission ฿{fmt(p.commissionAmount)} ({p.commissionRate}%)</span>
                      <span className="text-green-600 font-semibold">จ่ายสถาบัน ฿{fmt(p.netPayout)}</span>
                    </div>
                    {p.note && <p className="text-xs text-gray-400 mt-1">{p.note}</p>}
                    {p.paidAt && (
                      <p className="text-xs text-gray-400 mt-1">โอนแล้วเมื่อ {new Date(p.paidAt).toLocaleDateString("th-TH")}</p>
                    )}
                    {p.slipUrl && (
                      <a href={p.slipUrl} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1">
                        <ImageIcon className="w-3 h-3" /> ดูสลิปหลักฐาน
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {p.status === "pending" && (
                      <button
                        onClick={() => openPayModal(p._id)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" /> โอนแล้ว
                      </button>
                    )}
                    <button
                      onClick={() => deletePayout(p._id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create payout modal */}
      {creating && commissions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900">สร้าง Payout</h3>
              <button onClick={() => setCreating(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">สถาบัน</label>
                <div className="relative">
                  <select
                    value={createForm.institutionId}
                    onChange={(e) => setCreateForm({ ...createForm, institutionId: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-violet-300"
                  >
                    <option value="">-- เลือกสถาบัน --</option>
                    {commissions.institutions.map((i) => (
                      <option key={i._id} value={i._id}>{i.name} (Commission {i.commissionRate}%)</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">รอบ (YYYY-MM)</label>
                <input
                  type="month"
                  value={createForm.periodLabel}
                  onChange={(e) => setCreateForm({ ...createForm, periodLabel: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                />
              </div>
              {/* Preview summary */}
              {(() => {
                const sel = commissions.institutions.find((i) => i._id === createForm.institutionId);
                if (!sel) return (
                  <div className="bg-gray-50 rounded-xl p-4 text-center text-xs text-gray-400 border border-dashed border-gray-200">
                    ← เลือกสถาบันเพื่อดูยอดที่ต้องจ่าย
                  </div>
                );
                return (
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      ยอดสรุป
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">รายได้รวม</span>
                        <span className="text-sm font-bold text-gray-900">฿{fmt(sel.grossRevenue)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Commission ({sel.commissionRate}%)</span>
                        <span className="text-sm font-bold text-violet-600">− ฿{fmt(sel.totalCommission)}</span>
                      </div>
                      <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">ต้องจ่ายสถาบัน</span>
                        <span className="text-lg font-extrabold text-green-600">฿{fmt(sel.netPayout)}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
              {/* Slip upload */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  หลักฐานการโอน <span className="text-red-500">*</span>
                </label>
                <input ref={createSlipRef} type="file" accept="image/*" className="hidden" onChange={uploadCreateSlip} />
                {createForm.slipUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200">
                    <img src={createForm.slipUrl} alt="slip" className="w-full h-auto max-h-48 object-contain bg-gray-50" />
                    <button
                      onClick={() => setCreateForm((f) => ({ ...f, slipUrl: "" }))}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                    >x</button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => createSlipRef.current?.click()}
                    disabled={uploadingCreateSlip}
                    className="w-full h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-violet-400 hover:text-violet-500 transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-5 h-5" />
                    <span className="text-xs">{uploadingCreateSlip ? "กำลังอัปโหลด..." : "อัปโหลดสลิป / หลักฐานการโอน"}</span>
                  </button>
                )}
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={createPayout}
                  disabled={saving || !createForm.institutionId || !createForm.periodLabel || !createForm.slipUrl}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? "กำลังสร้าง..." : "สร้าง Payout"}
                </button>
                <button onClick={() => setCreating(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Slip upload modal */}
      {payingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900">แนบหลักฐานการโอน</h3>
              <button onClick={() => setPayingId(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input ref={slipRef} type="file" accept="image/*" className="hidden" onChange={uploadSlip} />
              {slipUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200">
                  <img src={slipUrl} alt="slip" className="w-full h-auto max-h-60 object-contain bg-gray-50" />
                  <button
                    onClick={() => setSlipUrl("")}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                  >x</button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => slipRef.current?.click()}
                  disabled={uploadingSlip}
                  className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-violet-400 hover:text-violet-500 transition-colors disabled:opacity-50"
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-sm">{uploadingSlip ? "กำลังอัปโหลด..." : "อัปโหลดสลิป / หลักฐานการโอน"}</span>
                </button>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">หมายเหตุ (ถ้ามี)</label>
                <input
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="เช่น โอนผ่าน SCB วันที่..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={confirmPaid}
                  disabled={!slipUrl || saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4" />
                  {saving ? "กำลังบันทึก..." : "ยืนยันการโอน"}
                </button>
                <button onClick={() => setPayingId(null)} className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                  ยกเลิก
                </button>
              </div>
              {!slipUrl && (
                <p className="text-xs text-amber-600 text-center">* ต้องแนบหลักฐานการโอนก่อนยืนยัน</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: "pending" | "paid" }) {
  return status === "paid" ? (
    <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
      <CheckCircle2 className="w-3 h-3" /> โอนแล้ว
    </span>
  ) : (
    <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
      <Clock3 className="w-3 h-3" /> รอโอน
    </span>
  );
}
