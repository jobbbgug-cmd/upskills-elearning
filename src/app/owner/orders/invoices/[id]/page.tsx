"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Invoice {
  _id: string;
  courseName: string;
  sellerName: string;
  sellerAddress: string;
  sellerTaxId: string;
  sellerPhone: string;
  buyerName: string;
  buyerAddress: string;
  buyerTaxId: string;
  buyerPhone: string;
  buyerEmail: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  invoiceDate: string;
  invoiceNumber?: string;
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/invoices/${id}`);
        const data = await res.json();
        setInvoice(data.invoice);
      } catch (error) {
        console.error("Failed to fetch invoice:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchInvoice();
  }, [id]);

  const handleGeneratePDF = async () => {
    if (!invoice) return;
    setGenerating(true);
    try {
      // TODO: Implement PDF generation
      console.log("Generating PDF for invoice:", invoice._id);
      alert("ระบบกำลังสร้างไฟล์ PDF...");
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-6 text-center py-12">
        <p className="text-gray-500">กำลังโหลด...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6 text-center py-12">
        <p className="text-gray-500">ไม่พบใบกำกับภาษี</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ใบกำกับภาษี</h1>
        <div className="flex gap-2">
          <Link
            href="/owner/orders/invoices"
            className="flex items-center gap-2 bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
            กลับ
          </Link>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700"
          >
            <Printer className="w-5 h-5" />
            พิมพ์
          </button>
          <button
            onClick={handleGeneratePDF}
            disabled={generating}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            {generating ? "กำลังสร้าง..." : "ดาวน์โหลด PDF"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 print:shadow-none">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-8 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">ใบกำกับภาษี / ใบเสร็จรับเงิน</h2>
            <p className="text-gray-600 mt-1">Invoice / Receipt</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">เลขที่ใบกำกับภาษี</p>
            <p className="text-2xl font-bold text-gray-900">{invoice.invoiceNumber || "-"}</p>
          </div>
        </div>

        {/* Dates and Invoice Number */}
        <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b">
          <div>
            <p className="text-sm text-gray-600">วันที่</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(invoice.invoiceDate).toLocaleDateString("th-TH")}
            </p>
          </div>
        </div>

        {/* Seller and Buyer Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-gray-900 mb-4">ข้อมูลผู้ขาย</h3>
            <p className="text-gray-900 font-semibold">{invoice.sellerName}</p>
            <p className="text-sm text-gray-600">{invoice.sellerAddress}</p>
            <p className="text-sm text-gray-600 mt-2">
              เลขประจำตัวผู้เสียภาษี: {invoice.sellerTaxId}
            </p>
            <p className="text-sm text-gray-600">โทรศัพท์: {invoice.sellerPhone}</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-4">ข้อมูลผู้ซื้อ</h3>
            <p className="text-gray-900 font-semibold">{invoice.buyerName}</p>
            <p className="text-sm text-gray-600">{invoice.buyerAddress}</p>
            <p className="text-sm text-gray-600 mt-2">
              เลขประจำตัวผู้เสียภาษี: {invoice.buyerTaxId}
            </p>
            <p className="text-sm text-gray-600">โทรศัพท์: {invoice.buyerPhone}</p>
            <p className="text-sm text-gray-600">อีเมล: {invoice.buyerEmail}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-8">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">
                ลำดับ
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">
                รายการ
              </th>
              <th className="px-4 py-2 text-right text-sm font-semibold text-gray-900">
                จำนวน
              </th>
              <th className="px-4 py-2 text-right text-sm font-semibold text-gray-900">
                ราคา
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-4 py-3 text-sm text-gray-900">1</td>
              <td className="px-4 py-3 text-sm text-gray-900">{invoice.courseName}</td>
              <td className="px-4 py-3 text-sm text-right text-gray-900">1</td>
              <td className="px-4 py-3 text-sm text-right text-gray-900">
                ฿{invoice.amount.toLocaleString("th-TH")}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between mb-3 pb-3 border-b">
              <span className="text-gray-900 font-semibold">รวมชำระระดับสินค้า</span>
              <span className="text-gray-900 font-semibold">
                ฿{invoice.amount.toLocaleString("th-TH")}
              </span>
            </div>
            <div className="flex justify-between mb-3 pb-3 border-b">
              <span className="text-gray-900 font-semibold">ภาษีมูลค่าเพิ่ม (VAT)</span>
              <span className="text-gray-900 font-semibold">
                ฿{invoice.taxAmount.toLocaleString("th-TH")}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span className="text-gray-900">ยอดรวม</span>
              <span className="text-gray-900">
                ฿{invoice.totalAmount.toLocaleString("th-TH")}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pt-8 border-t">
          <p>ขอบคุณที่ใช้บริการของเรา</p>
          <p>Thank you for using our service</p>
        </div>
      </div>
    </div>
  );
}
