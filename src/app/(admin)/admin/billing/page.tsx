"use client";
import { useState, useEffect } from "react";
import { Save, CreditCard, Receipt, Printer, CheckCircle2, Search } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface ReceiptRow {
  _id: string; receiptNumber: string; amount: number; issuedAt: string; note: string;
  studentId?: { name: string; email: string };
  courseId?:  { title: string; price: number };
  issuedBy?:  { name: string };
}
interface Booking {
  _id: string; status: string; createdAt: string;
  userId:   { _id: string; name: string; email: string };
  courseId: { _id: string; title: string; price: number };
}

export default function BillingPage() {
  const [tab, setTab] = useState<"settings" | "receipts" | "issue">("receipts");
  const [settings, setSettings] = useState({ promptpayNumber: "", bankName: "", bankAccountNumber: "", bankAccountName: "" });
  const [savingSettings, setSavingSettings] = useState(false);
  const [receipts, setReceipts] = useState<ReceiptRow[]>([]);
  const [confirmedBookings, setConfirmedBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [issuing, setIssuing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/payment-settings").then((r) => r.json()),
      fetch("/api/receipts").then((r) => r.json()),
      fetch("/api/admin/bookings/confirmed").then((r) => r.json()).catch(() => []),
    ]).then(([s, r, b]) => {
      setSettings({ promptpayNumber: s.promptpayNumber ?? "", bankName: s.bankName ?? "", bankAccountNumber: s.bankAccountNumber ?? "", bankAccountName: s.bankAccountName ?? "" });
      setReceipts(Array.isArray(r) ? r : []);
      setConfirmedBookings(Array.isArray(b) ? b : b?.bookings ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const saveSettings = async () => {
    setSavingSettings(true);
    await fetch("/api/admin/payment-settings", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSavingSettings(false);
    alert("บันทึกแล้ว");
  };

  const issueReceipt = async (bookingId: string) => {
    setIssuing(bookingId);
    const res = await fetch("/api/receipts", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });
    if (res.ok) {
      const r = await res.json();
      setReceipts((prev) => [r, ...prev.filter((x) => x._id !== r._id)]);
      alert(`ออกใบเสร็จ ${r.receiptNumber} สำเร็จ`);
    }
    setIssuing(null);
  };

  const printReceipt = (r: ReceiptRow) => {
    const date = new Date(r.issuedAt).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html lang="th"><head>
      <meta charset="UTF-8"/><title>ใบเสร็จ ${r.receiptNumber}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:"Sarabun","Noto Sans Thai",sans-serif; padding:40px; color:#1a1a1a; }
        .header { text-align:center; border-bottom:2px solid #6366f1; padding-bottom:16px; margin-bottom:20px; }
        .header h1 { font-size:22px; color:#4f46e5; }
        .header p { font-size:13px; color:#6b7280; margin-top:4px; }
        .receipt-no { text-align:right; font-size:13px; color:#6b7280; margin-bottom:16px; }
        table { width:100%; border-collapse:collapse; margin-bottom:16px; }
        td { padding:8px 4px; font-size:14px; }
        td:first-child { color:#6b7280; width:40%; }
        td:last-child { font-weight:600; }
        .total { border-top:2px solid #e5e7eb; margin-top:8px; padding-top:8px; }
        .total td { font-size:18px; font-weight:700; color:#4f46e5; }
        .footer { text-align:center; margin-top:32px; font-size:12px; color:#9ca3af; }
        @media print { body { padding:20px; } }
      </style>
    </head><body>
      <div class="header"><h1>ใบเสร็จรับเงิน</h1><p>RECEIPT</p></div>
      <div class="receipt-no">เลขที่: ${r.receiptNumber}</div>
      <table>
        <tr><td>วันที่</td><td>${date}</td></tr>
        <tr><td>ชื่อผู้ชำระ</td><td>${r.studentId?.name ?? "—"}</td></tr>
        <tr><td>อีเมล</td><td>${r.studentId?.email ?? "—"}</td></tr>
        <tr><td>คอร์ส</td><td>${r.courseId?.title ?? "—"}</td></tr>
        <tr><td>ผู้ออกใบเสร็จ</td><td>${r.issuedBy?.name ?? "—"}</td></tr>
        ${r.note ? `<tr><td>หมายเหตุ</td><td>${r.note}</td></tr>` : ""}
      </table>
      <table class="total"><tr><td>ยอดชำระ</td><td>฿${r.amount.toLocaleString()}</td></tr></table>
      <div class="footer">ขอบคุณที่ใช้บริการ</div>
      <script>window.onload=()=>window.print();</script>
    </body></html>`);
    win.document.close();
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white";
  const filtered = confirmedBookings.filter((b) =>
    !search || b.userId.name.includes(search) || b.courseId.title.includes(search)
  );
  const issuedIds = new Set(receipts.map((r) => (r as unknown as { bookingId?: string }).bookingId));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><CreditCard className="w-5 h-5 text-indigo-500" />ชำระเงิน & ใบเสร็จ</h1>
        <p className="text-gray-500 text-sm mt-1">ตั้งค่าช่องทางชำระเงินและออกใบเสร็จ</p>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {(["receipts", "issue", "settings"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === t ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {t === "receipts" ? `ใบเสร็จ (${receipts.length})` : t === "issue" ? "ออกใบเสร็จ" : "ตั้งค่าการชำระ"}
          </button>
        ))}
      </div>

      {/* Receipts list */}
      {tab === "receipts" && (
        loading ? <LoadingSpinner />
        : receipts.length === 0 ? (
          <div className="text-center py-20 text-gray-300"><Receipt className="w-12 h-12 mx-auto mb-3 opacity-40" /><p className="text-sm">ยังไม่มีใบเสร็จ</p></div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 text-xs text-gray-400">
                <th className="px-5 py-3 text-left">เลขที่</th>
                <th className="px-5 py-3 text-left">นักเรียน</th>
                <th className="px-5 py-3 text-left">คอร์ส</th>
                <th className="px-5 py-3 text-right">ยอด</th>
                <th className="px-5 py-3 text-right">วันที่</th>
                <th className="px-5 py-3 text-center">พิมพ์</th>
              </tr></thead>
              <tbody>
                {receipts.map((r) => (
                  <tr key={r._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{r.receiptNumber}</td>
                    <td className="px-5 py-3.5"><p className="font-medium text-gray-900">{r.studentId?.name}</p><p className="text-xs text-gray-400">{r.studentId?.email}</p></td>
                    <td className="px-5 py-3.5 text-gray-700">{r.courseId?.title}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-indigo-600">฿{r.amount.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right text-xs text-gray-400">{new Date(r.issuedAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td className="px-5 py-3.5 text-center">
                      <button onClick={() => printReceipt(r)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Issue receipts */}
      {tab === "issue" && (
        <div>
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full max-w-sm pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" placeholder="ค้นหาชื่อนักเรียน / คอร์ส..." />
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-300 text-sm">ไม่พบการจองที่ยืนยันแล้ว</div>
          ) : (
            <div className="space-y-2.5">
              {filtered.map((b) => {
                const hasReceipt = issuedIds.has(b._id);
                return (
                  <div key={b._id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{b.userId.name}</p>
                      <p className="text-xs text-gray-400">{b.courseId.title} · ฿{b.courseId.price.toLocaleString()}</p>
                    </div>
                    {hasReceipt ? (
                      <span className="flex items-center gap-1 text-xs text-green-500 font-semibold shrink-0"><CheckCircle2 className="w-4 h-4" />ออกแล้ว</span>
                    ) : (
                      <button onClick={() => issueReceipt(b._id)} disabled={issuing === b._id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition-colors shrink-0 disabled:opacity-50">
                        <Receipt className="w-3.5 h-3.5" />{issuing === b._id ? "กำลังออก..." : "ออกใบเสร็จ"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Payment settings */}
      {tab === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">PromptPay</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">เบอร์โทร / เลข ID PromptPay</label>
              <input value={settings.promptpayNumber} onChange={(e) => setSettings({ ...settings, promptpayNumber: e.target.value })} className={inputCls} placeholder="0812345678" />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">บัญชีธนาคาร</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อธนาคาร</label>
              <input value={settings.bankName} onChange={(e) => setSettings({ ...settings, bankName: e.target.value })} className={inputCls} placeholder="กสิกรไทย / SCB / กรุงไทย..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">เลขบัญชี</label>
              <input value={settings.bankAccountNumber} onChange={(e) => setSettings({ ...settings, bankAccountNumber: e.target.value })} className={inputCls} placeholder="xxx-x-xxxxx-x" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อบัญชี</label>
              <input value={settings.bankAccountName} onChange={(e) => setSettings({ ...settings, bankAccountName: e.target.value })} className={inputCls} placeholder="ชื่อ-นามสกุล" />
            </div>
          </div>
          <div className="lg:col-span-2">
            <button onClick={saveSettings} disabled={savingSettings}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 text-sm">
              <Save className="w-4 h-4" />{savingSettings ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
