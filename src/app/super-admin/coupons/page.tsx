"use client";

import { useEffect, useState } from "react";

interface Coupon {
  _id: string;
  code: string;
  discount: number;
  discountType: "percentage" | "fixed";
  maxUses: number;
  usedCount: number;
  expiryDate: string;
  itemType: "coupon" | "promotion" | "package";
  institutionId?: { name: string };
  courseIds?: Array<{ title: string }>;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await fetch(`/api/super-admin/coupons?type=${typeFilter}`);
        const result = await res.json();
        setCoupons(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Failed to fetch coupons:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, [typeFilter]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">คูปอง/โปรโมชั่น</h1>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">คูปอง/โปรโมชั่น</h1>
        <span className="text-sm text-gray-600">รวม {coupons.length} รายการ</span>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label className="text-sm text-gray-600 block mb-2">ประเภท</label>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-600"
        >
          <option value="all">ทั้งหมด</option>
          <option value="coupon">คูปอง</option>
          <option value="promotion">โปรโมชั่น</option>
          <option value="package">แพ็คเกจ</option>
        </select>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">รหัส</th>
                <th className="text-left py-3 px-4 font-semibold">ประเภท</th>
                <th className="text-left py-3 px-4 font-semibold">ส่วนลด</th>
                <th className="text-left py-3 px-4 font-semibold">ใช้ได้</th>
                <th className="text-left py-3 px-4 font-semibold">ใช้ไป</th>
                <th className="text-left py-3 px-4 font-semibold">หมดอายุ</th>
                <th className="text-left py-3 px-4 font-semibold">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => {
                const isExpired = new Date(coupon.expiryDate) < new Date();
                const isUsedUp = coupon.usedCount >= coupon.maxUses;

                return (
                  <tr key={coupon._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{coupon.code}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        {coupon.itemType === "coupon" ? "คูปอง" :
                         coupon.itemType === "promotion" ? "โปรโมชั่น" : "แพ็คเกจ"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {coupon.discountType === "percentage"
                        ? `${coupon.discount}%`
                        : `฿${coupon.discount}`}
                    </td>
                    <td className="py-3 px-4">{coupon.maxUses}</td>
                    <td className="py-3 px-4 text-gray-600">{coupon.usedCount}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(coupon.expiryDate).toLocaleDateString("th-TH")}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isExpired ? "bg-red-100 text-red-700" :
                        isUsedUp ? "bg-yellow-100 text-yellow-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {isExpired ? "หมดอายุ" :
                         isUsedUp ? "ใช้หมด" : "ใช้ได้"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {coupons.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-500">ไม่พบข้อมูลคูปอง/โปรโมชั่น</p>
        </div>
      )}
    </div>
  );
}
