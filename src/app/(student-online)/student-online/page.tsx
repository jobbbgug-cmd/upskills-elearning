"use client";
import { useState, useEffect } from "react";
import { BookOpen, ShoppingCart, FileText, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function StudentOnlineDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setUser(d.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20">กำลังโหลด...</div>;

  if (!user || user.role !== "online") {
    return <div className="text-center py-20 text-red-500">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>;
  }

  const features = [
    {
      title: "คอร์สของฉัน",
      description: "ดูคอร์สที่คุณลงทะเบียนแล้ว",
      href: "/student-online/my-courses",
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "ตะกร้าสินค้า",
      description: "ตรวจสอบและจ่ายเงินสำหรับคอร์ส",
      href: "/student-online/cart",
      icon: ShoppingCart,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "ใบกำกับภาษี",
      description: "ดูและดาวน์โหลดใบกำกับภาษี",
      href: "/student-online/invoices",
      icon: FileText,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">ยินดีต้อนรับ {user.name}</h1>
        <p className="text-violet-100">ระบบการเรียนออนไลน์ UPSkills</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link
              key={feature.title}
              href={feature.href}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className={`${feature.bg} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </Link>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">คอร์สที่กำลังเรียน</p>
          <p className="text-3xl font-bold text-gray-900">0</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">ทั้งหมดในตะกร้า</p>
          <p className="text-3xl font-bold text-gray-900">0</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">ใบกำกับภาษี</p>
          <p className="text-3xl font-bold text-gray-900">0</p>
        </div>
      </div>
    </div>
  );
}
