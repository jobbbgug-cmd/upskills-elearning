"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Eye, Search, X } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface TaxInvoice {
  _id: string;
  invoiceNumber: string;
  fullName: string;
  email: string;
  taxId?: string;
  address?: string;
  houseNumber?: string;
  subDistrict?: string;
  amphoe?: string;
  province?: string;
  postalCode?: string;
  courseName: string;
  coursePrice: number;
  purchaseDate: string;
  invoiceDate: string;
  status: "pending" | "issued";
}

export default function TaxInvoicePage() {
  const [invoices, setInvoices] = useState<TaxInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<TaxInvoice | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/online/tax-invoices");
      if (res.ok) {
        const data = await res.json();
        setInvoices(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.courseName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ใบกำกับภาษี</h1>
        <p className="text-gray-500 text-sm mt-1">ใบกำกับภาษีที่ขอเมื่อสั่งซื้อคอร์ส</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="ค้นหาเลขใบกำกับภาษีหรือชื่อคอร์ส..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {invoices.length === 0
              ? "คุณยังไม่มีใบกำกับภาษี"
              : "ไม่พบใบกำกับภาษีที่ตรงกับการค้นหา"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    เลขที่ใบกำกับภาษี
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    คอร์ส
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    วันที่
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    สถานะ
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                    การดำเนิน
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{invoice.courseName}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(invoice.invoiceDate).toLocaleDateString("th-TH")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          invoice.status === "issued"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {invoice.status === "issued" ? "ออกแล้ว" : "รอการออก"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        ดู
                      </button>
                      {invoice.status === "issued" && (
                        <button className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                          <Download className="w-3 h-3" />
                          ดาวน์โหลด
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Preview Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-900">ใบกำกับภาษี</h2>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">ใบกำกับภาษี / ใบเสร็จรับเงิน</h3>
                <p className="text-sm text-gray-500">UPSkills</p>
              </div>

              {/* Invoice Number and Date */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">เลขที่ใบกำกับภาษี</p>
                  <p className="font-mono font-bold text-gray-900">
                    {selectedInvoice.invoiceNumber}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">วันที่</p>
                  <p className="font-bold text-gray-900">
                    {new Date(selectedInvoice.invoiceDate).toLocaleDateString(
                      "th-TH"
                    )}
                  </p>
                </div>
              </div>

              <hr />

              {/* Seller Info */}
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="font-bold text-gray-900 mb-2">ผู้ขาย</p>
                  <p className="text-gray-600">UPSkills</p>
                </div>
                <div>
                  <p className="font-bold text-gray-900 mb-2">ผู้ซื้อ</p>
                  <p className="text-gray-600">{selectedInvoice.fullName}</p>
                  {selectedInvoice.taxId && (
                    <p className="text-gray-500">เลขประจำตัวผู้เสียภาษี: {selectedInvoice.taxId}</p>
                  )}
                  {selectedInvoice.address && (
                    <p className="text-gray-500">
                      {selectedInvoice.houseNumber} {selectedInvoice.address}
                    </p>
                  )}
                  {selectedInvoice.subDistrict && (
                    <p className="text-gray-500">
                      {selectedInvoice.subDistrict} {selectedInvoice.amphoe}{" "}
                      {selectedInvoice.province} {selectedInvoice.postalCode}
                    </p>
                  )}
                </div>
              </div>

              <hr />

              {/* Course Details */}
              <div className="text-sm">
                <p className="font-bold text-gray-900 mb-3">รายการ</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{selectedInvoice.courseName}</span>
                    <span className="font-mono text-gray-900">
                      ฿{selectedInvoice.coursePrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <hr />

              {/* Total */}
              <div className="flex justify-between text-lg">
                <span className="font-bold text-gray-900">รวมทั้งสิ้น</span>
                <span className="font-bold text-purple-600">
                  ฿{selectedInvoice.coursePrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
