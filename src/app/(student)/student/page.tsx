"use client";
import { useState, useEffect } from "react";
import { BookOpen, ClipboardCheck, PenLine, Video } from "lucide-react";
import Link from "next/link";

export default function StudentDashboard() {
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

  if (!user || (user.role !== "student" && user.role !== "parent")) {
    return <div className="text-center py-20 text-red-500">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>;
  }

  const features = [
    {
      title: "การบ้าน",
      description: user.role === "parent" ? "ดูการบ้านของลูก" : "ดูและส่งการบ้าน",
      href: "/student/homework",
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "เช็คชื่อ",
      description: user.role === "parent" ? "ดูการเข้าเรียนของลูก" : "ดูสถิติการเข้าเรียน",
      href: "/student/attendance",
      icon: ClipboardCheck,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "ข้อสอบ",
      description: user.role === "parent" ? "ดูคะแนนสอบของลูก" : "ทำและดูคะแนนสอบ",
      href: "/student/quiz",
      icon: PenLine,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Live Class",
      description: user.role === "parent" ? "ดูห้องเรียนของลูก" : "เข้าร่วมห้องเรียนออนไลน์",
      href: "/student/live-class",
      icon: Video,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-6 md:py-12">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900">ศูนย์การเรียน</h1>
          <p className="text-sm md:text-base text-gray-600 mt-2">
            {user.role === "parent"
              ? `สวัสดี ${user.name} - ศูนย์การเรียนของบุตรหลาน`
              : `สวัสดี ${user.name} - ศูนย์การเรียนของคุณ`}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.title} href={feature.href}>
                <div className={`${feature.bg} rounded-xl md:rounded-2xl p-4 md:p-6 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-gray-200 h-full`}>
                  <Icon className={`w-8 md:w-10 h-8 md:h-10 ${feature.color} mb-3 md:mb-4`} />
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">{feature.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
