"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Users } from "lucide-react";

interface LearningPath {
  _id: string;
  title: string;
  description: string;
  coverImage: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedHours: number;
  courses: string[];
}

const difficultyColors = {
  beginner: { bg: "bg-green-50", text: "text-green-700", label: "ผู้เริ่มต้น" },
  intermediate: { bg: "bg-blue-50", text: "text-blue-700", label: "ระดับกลาง" },
  advanced: { bg: "bg-red-50", text: "text-red-700", label: "ขั้นสูง" },
};

export default function LearningPathsPage() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const res = await fetch("/api/learning-paths");
        const data = await res.json();
        setPaths(data.paths || []);
      } catch (error) {
        console.error("Failed to fetch learning paths:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaths();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">เส้นทางการเรียน</h1>
          <p className="text-gray-600">เส้นทางการเรียนที่ออกแบบมาเพื่อให้คุณบรรลุเป้าหมายทักษะของคุณ</p>
        </div>

        {/* Learning Paths Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">กำลังโหลด...</p>
          </div>
        ) : paths.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">ยังไม่มีเส้นทางการเรียน</p>
            <Link href="/courses" className="text-indigo-600 hover:text-indigo-700 font-medium">
              ดูคอร์สทั้งหมด →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paths.map((path) => {
              const diff = difficultyColors[path.difficulty];
              return (
                <Link
                  key={path._id}
                  href={`/learning-paths/${path._id}`}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Cover Image */}
                  {path.coverImage && (
                    <img
                      src={path.coverImage}
                      alt={path.title}
                      className="w-full h-40 object-cover"
                    />
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{path.title}</h3>
                      <span className={`${diff.bg} ${diff.text} px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0`}>
                        {diff.label}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{path.description}</p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {path.estimatedHours} ชั่วโมง
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {path.courses.length} คอร์ส
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm">
                      เริ่มเรียน
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
