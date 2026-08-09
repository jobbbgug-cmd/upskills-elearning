"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

interface LearningPath {
  _id: string;
  title: string;
  description: string;
  coverImage: string;
  price: number;
  difficulty: string;
  courses?: { title: string; slug: string }[];
}

export default function LearningPathsShowcase() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const res = await fetch("/api/learning-paths");
        const data = await res.json();
        setPaths(data.paths?.slice(0, 4) || []);
      } catch (error) {
        console.error("Failed to fetch learning paths:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaths();
  }, []);


  if (loading) {
    return (
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              เส้นทางการเรียนรู้
            </h2>
            <p className="text-gray-600">
              ชุดคอร์สที่ออกแบบมาเพื่อพัฒนาทักษะอย่างเป็นระบบ
            </p>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-48 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (paths.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            เส้นทางการเรียนรู้
          </h2>
          <p className="text-gray-600 mb-6">
            ชุดคอร์สที่ออกแบบมาเพื่อพัฒนาทักษะอย่างเป็นระบบ
          </p>
          <Link
            href="/learning-paths"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors cursor-pointer"
          >
            ดูเส้นทางการเรียนรู้ทั้งหมด
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Learning Paths Grid - Compact Vertical Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {paths.map((path) => (
              <Link
                key={path._id}
                href={`/learning-paths/${path._id}`}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group flex flex-col"
              >
                {/* Cover Image - Full Width Top */}
                <div className="relative h-40 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
                  {path.coverImage ? (
                    <Image
                      src={path.coverImage}
                      alt={path.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl">🎯</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Course Info - Compact */}
                  <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <span>📚</span>
                      <span className="font-medium">{path.courses?.length || 0} คอร์ส</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>⏱️</span>
                      <span className="font-medium">1.20 ชม.</span>
                    </div>
                  </div>

                  {/* Course List - Compact */}
                  <div className="text-xs mb-3">
                    <p className="text-gray-700 font-semibold mb-1">ประกอบด้วยคอร์สเรียน</p>
                    <div className="text-gray-600 space-y-0.5 mb-2">
                      {path.courses?.slice(0, 3).map((course, idx) => (
                        <p key={idx} className="truncate text-xs">
                          {idx + 1}. {course.title}
                        </p>
                      ))}
                    </div>
                    <button className="text-indigo-600 hover:text-indigo-700 font-semibold text-xs">
                      ดูเพิ่มเติม
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-gray-900 line-clamp-2 text-base group-hover:text-indigo-600 transition-colors mb-3">
                    {path.title}
                  </h3>

                  {/* Price Display */}
                  <div className="flex items-center gap-2 mb-3">
                    {path.price > 0 ? (
                      <>
                        <span className="text-3xl font-bold" style={{ color: '#DC2626' }}>
                          ฿{path.price.toLocaleString("th-TH")}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          ฿{(path.price * 1.35).toLocaleString("th-TH")}
                        </span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold text-green-600">ฟรี</span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => e.preventDefault()}
                      className="p-2 border-2 border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50 transition-colors flex-shrink-0"
                      title="ใส่ตะกร้า"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                        <circle cx="8" cy="21" r="1"></circle>
                        <circle cx="19" cy="21" r="1"></circle>
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                      </svg>
                    </button>
                    <button
                      onClick={(e) => e.preventDefault()}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded font-semibold text-sm hover:bg-indigo-700 transition-colors"
                    >
                      ซื้อเส้นทางนี้
                    </button>
                  </div>
                </div>
              </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
