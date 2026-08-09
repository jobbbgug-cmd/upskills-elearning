"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, FileText, Download, Eye } from "lucide-react";

interface Invoice {
  _id: string;
  courseName: string;
  buyerName: string;
  amount: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch("/api/invoices");
        const data = await res.json();
        setInvoices(data.invoices || []);
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "issued":
        return "bg-green-100 text-green-800";
      case "paid":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "issued":
        return "ออกแล้ว";
      case "paid":
        return "ชำระแล้ว";
      default:
        return "รอออก";
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ออกใบกำกับภาษี</h1>
          <p className="text-gray-600 mt-1">จัดการใบกำกับภาษีและใบเสร็จรับเงิน</p>
        </div>
        <Link
          href="/admin/orders/invoices/new"
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          สร้างใบกำกับภาษี
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">ยังไม่มีใบกำกับภาษี</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  คอร์ส
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  ผู้ซื้อ
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  จำนวนเงิน
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  วันที่
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  การกระทำ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices.map((invoice) => (
                <tr key={invoice._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {invoice.courseName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {invoice.buyerName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ฿{invoice.totalAmount.toLocaleString("th-TH")}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        invoice.status
                      )}`}
                    >
                      {getStatusLabel(invoice.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(invoice.createdAt).toLocaleDateString("th-TH")}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/orders/invoices/${invoice._id}`}
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                      >
                        <Eye className="w-4 h-4" />
                        ดู
                      </Link>
                      <button className="inline-flex items-center gap-1 text-green-600 hover:text-green-700">
                        <Download className="w-4 h-4" />
                        ดาวน์โหลด
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
