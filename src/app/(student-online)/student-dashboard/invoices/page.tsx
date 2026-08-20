"use client";
import { useState, useEffect } from "react";
import { FileText, Download, Eye, Calendar } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  courses: string[];
  pdfUrl?: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "pending" | "overdue">("all");

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const res = await fetch("/api/student-online/invoices");
        if (res.ok) {
          setInvoices(await res.json());
        }
      } catch (error) {
        console.error("Error loading invoices:", error);
      }
      setLoading(false);
    };
    loadInvoices();
  }, []);

  const filtered = invoices.filter((inv) => filterStatus === "all" || inv.status === filterStatus);

  const statusBadges = {
    paid: { label: "ชำระแล้ว", cls: "bg-green-100 text-green-700" },
    pending: { label: "รอชำระ", cls: "bg-yellow-100 text-yellow-700" },
    overdue: { label: "เกินกำหนด", cls: "bg-red-100 text-red-700" },
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ใบกำกับภาษี</h1>
        <p className="text-sm text-gray-600 mt-1">ดูและดาวน์โหลดใบกำกับภาษีของคุณ</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filterStatus === "all"
              ? "bg-violet-600 text-white"
              : "border border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          ทั้งหมด
        </button>
        <button
          onClick={() => setFilterStatus("paid")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filterStatus === "paid"
              ? "bg-violet-600 text-white"
              : "border border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          ชำระแล้ว
        </button>
        <button
          onClick={() => setFilterStatus("pending")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filterStatus === "pending"
              ? "bg-violet-600 text-white"
              : "border border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          รอชำระ
        </button>
        <button
          onClick={() => setFilterStatus("overdue")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filterStatus === "overdue"
              ? "bg-violet-600 text-white"
              : "border border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          เกินกำหนด
        </button>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">เลขที่ใบกำกับภาษี</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">วันที่</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">จำนวนเงิน</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">สถานะ</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((invoice) => (
                <tr key={invoice._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{invoice.invoiceNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(invoice.date).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">฿{invoice.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadges[invoice.status].cls}`}>
                      {statusBadges[invoice.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        title="ดู"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {invoice.pdfUrl && (
                        <a
                          href={invoice.pdfUrl}
                          download
                          title="ดาวน์โหลด"
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">ไม่มีใบกำกับภาษี</p>
          </div>
        )}
      </div>
    </div>
  );
}
