"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Users, FileText, BookOpen, Award, Layers } from "lucide-react";

export default function TeacherDashboard() {
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    revenue: 0,
    invoices: 0,
    learningPaths: 0,
    certificates: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [coursesRes, pathsRes, certsRes] = await Promise.all([
        fetch("/api/admin/courses"),
        fetch("/api/learning-paths"),
        fetch("/api/certificates"),
      ]);

      const coursesData = await coursesRes.json();
      const pathsData = await pathsRes.json();
      const certsData = await certsRes.json();

      setStats({
        courses: coursesData.courses?.length || 0,
        students: 0,
        revenue: 0,
        invoices: 0,
        learningPaths: pathsData.paths?.length || 0,
        certificates: Array.isArray(certsData) ? certsData.length : certsData.length || 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ภาพรวม</h1>
        <p className="text-gray-500 text-sm mt-1">ยินดีต้อนรับสู่แผงควบคุมครูออนไลน์</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm font-medium">คอร์สของฉัน</p>
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{loading ? "-" : stats.courses}</p>
          <p className="text-xs text-gray-400 mt-2">รายการ</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm font-medium">นักเรียนทั้งหมด</p>
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{loading ? "-" : stats.students}</p>
          <p className="text-xs text-gray-400 mt-2">คน</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm font-medium">รายได้รวม</p>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">฿{loading ? "-" : stats.revenue}</p>
          <p className="text-xs text-gray-400 mt-2">บาท</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm font-medium">ใบกำกับภาษี</p>
            <FileText className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{loading ? "-" : stats.invoices}</p>
          <p className="text-xs text-gray-400 mt-2">รายการ</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm font-medium">เส้นทางการเรียน</p>
            <Layers className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{loading ? "-" : stats.learningPaths}</p>
          <p className="text-xs text-gray-400 mt-2">รายการ</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm font-medium">ใบรับรอง</p>
            <Award className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{loading ? "-" : stats.certificates}</p>
          <p className="text-xs text-gray-400 mt-2">รายการ</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">เริ่มต้นอย่างไร?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/manage-courses"
            className="bg-white/20 hover:bg-white/30 rounded-lg p-4 transition-colors"
          >
            <h3 className="font-bold mb-1">สร้างคอร์สแรกของคุณ</h3>
            <p className="text-sm opacity-90">เริ่มสอนนักเรียนของคุณวันนี้</p>
          </a>
          <a
            href="/manage-content"
            className="bg-white/20 hover:bg-white/30 rounded-lg p-4 transition-colors"
          >
            <h3 className="font-bold mb-1">เพิ่มเนื้อหาการเรียน</h3>
            <p className="text-sm opacity-90">อัปโหลดวิดีโอและเอกสารประกอบการสอน</p>
          </a>
        </div>
      </div>
    </div>
  );
}
