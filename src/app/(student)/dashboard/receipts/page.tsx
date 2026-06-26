import { cookies } from "next/headers";
import { Receipt, Printer } from "lucide-react";
import PrintReceiptButton from "./PrintReceiptButton";

interface ReceiptDoc {
  _id: string;
  receiptNumber: string;
  amount: number;
  issuedAt: string;
  note?: string;
  courseId?: { title?: string } | null;
  issuedBy?: { name?: string } | null;
}

async function getReceipts(): Promise<ReceiptDoc[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return [];
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/receipts`, {
    headers: { Cookie: `token=${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function StudentReceiptsPage() {
  const receipts = await getReceipts();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
          <Receipt className="w-5 h-5 text-indigo-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">ใบเสร็จรับเงิน</h1>
          <p className="text-sm text-gray-500">ประวัติการชำระเงินของคุณ</p>
        </div>
      </div>

      {receipts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Receipt className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">ยังไม่มีใบเสร็จ</p>
        </div>
      ) : (
        <div className="space-y-3">
          {receipts.map((r) => (
            <div key={r._id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <Receipt className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 text-sm">{r.receiptNumber}</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                    ฿{r.amount.toLocaleString()}
                  </span>
                </div>
                {r.courseId?.title && (
                  <p className="text-sm text-gray-600 mt-0.5 truncate">{r.courseId.title}</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(r.issuedAt).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
                  {r.issuedBy?.name && ` · ออกโดย ${r.issuedBy.name}`}
                </p>
                {r.note && <p className="text-xs text-gray-400 mt-0.5">{r.note}</p>}
              </div>
              <PrintReceiptButton receipt={r} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
