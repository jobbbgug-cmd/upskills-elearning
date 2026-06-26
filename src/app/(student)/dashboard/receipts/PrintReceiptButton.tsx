"use client";
import { Printer } from "lucide-react";

interface ReceiptDoc {
  _id: string;
  receiptNumber: string;
  amount: number;
  issuedAt: string;
  note?: string;
  courseId?: { title?: string } | null;
  issuedBy?: { name?: string } | null;
}

export default function PrintReceiptButton({ receipt: r }: { receipt: ReceiptDoc }) {
  const handlePrint = () => {
    const date = new Date(r.issuedAt).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
    const win = window.open("", "_blank", "width=700,height=500");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>ใบเสร็จ ${r.receiptNumber}</title>
<style>
  body { font-family: 'Sarabun', sans-serif; margin: 0; padding: 40px; color: #1a1a2e; }
  .box { max-width: 600px; margin: auto; border: 2px solid #4f46e5; border-radius: 12px; padding: 40px; }
  h1 { color: #4f46e5; margin: 0 0 4px; font-size: 22px; }
  .sub { color: #888; font-size: 13px; margin-bottom: 24px; }
  .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
  .total { font-size: 18px; font-weight: 700; color: #4f46e5; margin-top: 16px; text-align: right; }
  @media print { body { padding: 0; } }
</style></head><body>
<div class="box">
  <h1>ใบเสร็จรับเงิน</h1>
  <div class="sub">เลขที่: ${r.receiptNumber}</div>
  <div class="row"><span>วันที่ออก</span><span>${date}</span></div>
  ${r.courseId?.title ? `<div class="row"><span>คอร์ส</span><span>${r.courseId.title}</span></div>` : ""}
  ${r.issuedBy?.name ? `<div class="row"><span>ออกโดย</span><span>${r.issuedBy.name}</span></div>` : ""}
  ${r.note ? `<div class="row"><span>หมายเหตุ</span><span>${r.note}</span></div>` : ""}
  <div class="total">ยอดชำระ: ฿${r.amount.toLocaleString()}</div>
</div>
<script>window.onload=()=>{window.print();window.close();}<\/script>
</body></html>`);
    win.document.close();
  };

  return (
    <button onClick={handlePrint}
      className="flex items-center gap-1.5 text-xs px-3 py-2 bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 rounded-xl transition-colors shrink-0">
      <Printer className="w-3.5 h-3.5" /> พิมพ์
    </button>
  );
}
