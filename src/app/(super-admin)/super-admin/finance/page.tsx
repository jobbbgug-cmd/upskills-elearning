"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";

interface FinanceData {
  _id: string;
  category: string;
  amount: number;
  date: string;
  type: "income" | "expense";
  description: string;
}

export default function FinancePage() {
  const [finances, setFinances] = useState<FinanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  useEffect(() => {
    const fetchFinances = async () => {
      try {
        const res = await fetch("/api/super-admin/finance");
        if (res.ok) {
          const data = await res.json();
          setFinances(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch finance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFinances();
  }, []);

  const filtered = finances.filter((item) => filter === "all" || item.type === filter);

  const income = finances
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const expense = finances
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = income - expense;

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">การเงิน</h1>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">การเงิน</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">รายได้</p>
              <p className="text-2xl font-bold text-green-600">
                ฿{income.toLocaleString("th-TH", { maximumFractionDigits: 0 })}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">ค่าใช้จ่าย</p>
              <p className="text-2xl font-bold text-red-600">
                ฿{expense.toLocaleString("th-TH", { maximumFractionDigits: 0 })}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">ยอดคงเหลือ</p>
              <p
                className={`text-2xl font-bold ${balance >= 0 ? "text-blue-600" : "text-red-600"}`}
              >
                ฿{Math.abs(balance).toLocaleString("th-TH", { maximumFractionDigits: 0 })}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">จำนวนรายการ</p>
              <p className="text-2xl font-bold text-purple-600">{finances.length}</p>
            </div>
            <PieChart className="w-8 h-8 text-purple-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "all"
              ? "bg-purple-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          ทั้งหมด
        </button>
        <button
          onClick={() => setFilter("income")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "income"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          รายได้
        </button>
        <button
          onClick={() => setFilter("expense")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "expense"
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          ค่าใช้จ่าย
        </button>
      </div>

      {/* Finance Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">วันที่</th>
                <th className="text-left py-3 px-4 font-semibold">หมวดหมู่</th>
                <th className="text-left py-3 px-4 font-semibold">รายละเอียด</th>
                <th className="text-left py-3 px-4 font-semibold">ประเภท</th>
                <th className="text-right py-3 px-4 font-semibold">จำนวนเงิน</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(item.date).toLocaleDateString("th-TH")}
                  </td>
                  <td className="py-3 px-4 font-medium">{item.category}</td>
                  <td className="py-3 px-4">{item.description}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.type === "income"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.type === "income" ? "รายได้" : "ค่าใช้จ่าย"}
                    </span>
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-semibold ${
                      item.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {item.type === "income" ? "+" : "-"}฿
                    {item.amount.toLocaleString("th-TH", { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-500">ไม่พบข้อมูลการเงิน</p>
        </div>
      )}
    </div>
  );
}
