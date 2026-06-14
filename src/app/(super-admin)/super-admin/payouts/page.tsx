"use client";
import { useEffect, useState } from "react";
import {
  TrendingUp, CheckCircle2, Clock3, Building2,
  Plus, Check, X, ChevronDown, Receipt,
} from "lucide-react";

interface CommissionRow {
  _id: string;
  name: string;
  slug: string;
  commissionRate: number;
  grossRevenue: number;
  totalCommission: number;
  netPayout: number;
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
  createdAt: string;
}

export default function PayoutsPage() {
  const [commissions, setCommissions] = useState<{ institutions: CommissionRow[]; platformTotalCommission: number; platformTotalGross: number } | null>(null);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ institutionId: "", periodLabel: periodNow() });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"summary" | "history">("summary");

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

  const createPayout = async () => {
    if (!createForm.institutionId || !createForm.periodLabel) return;
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

  if (loading) return <div className="text-gray-400 text-sm p-8">กำลังโหลด...</div>;

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
          <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-violet-200" />
              <span className="text-violet-100 text-sm">รายได้รวมทั้งหมด</span>
            </div>
            <div className="text-3xl font-extrabold">฿{commissions.platformTotalGross.toLocaleString()}</div>
            <div className="text-violet-100 text-xs mt-1">จากทุกสถาบัน</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Receipt className="w-5 h-5 text-green-200" />
              <span className="text-green-100 text-sm">Commission ที่ได้รับ</span>
            </div>
            <div className="text-3xl font-extrabold">฿{commissions.platformTotalCommission.toLocaleString()}</div>
            <div className="text-green-100 text-xs mt-1">รายได้สุทธิของแพลตฟอร์ม</div>
          </div>
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Clock3 className="w-5 h-5 text-amber-200" />
              <span className="text-amber-100 text-sm">รอ Payout</span>
            </div>
            <div className="text-3xl font-extrabold">{pendingPayouts.length}</div>
            <div className="text-amber-100 text-xs mt-1">รายการรอโอนเงิน</div>
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
              <div key={row._id} className="px-5 py-4 flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-violet-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{row.name}</p>
                  <p className="text-xs text-gray-400">Commission {row.commissionRate}% · {row.bookingCount} bookings</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-gray-500">รายได้รวม</p>
                  <p className="text-sm font-semibold text-gray-900">฿{row.grossRevenue.toLocaleString()}</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-gray-500">Commission</p>
                  <p className="text-sm font-semibold text-violet-600">฿{row.totalCommission.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">ต้องจ่ายสถาบัน</p>
                  <p className="text-sm font-bold text-green-600">฿{row.netPayout.toLocaleString()}</p>
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
                      <span>รายได้ ฿{p.grossRevenue.toLocaleString()}</span>
                      <span className="text-violet-600">Commission ฿{p.commissionAmount.toLocaleString()} ({p.commissionRate}%)</span>
                      <span className="text-green-600 font-semibold">จ่ายสถาบัน ฿{p.netPayout.toLocaleString()}</span>
                    </div>
                    {p.note && <p className="text-xs text-gray-400 mt-1">{p.note}</p>}
                    {p.paidAt && (
                      <p className="text-xs text-gray-400 mt-1">โอนแล้วเมื่อ {new Date(p.paidAt).toLocaleDateString("th-TH")}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {p.status === "pending" && (
                      <button
                        onClick={() => markPaid(p._id)}
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
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={createPayout}
                  disabled={saving || !createForm.institutionId || !createForm.periodLabel}
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
