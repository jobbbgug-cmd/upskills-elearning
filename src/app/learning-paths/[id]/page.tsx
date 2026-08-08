"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Users, BookOpen, ShoppingCart } from "lucide-react";
import { useParams } from "next/navigation";

interface Category {
  _id: string;
  name: string;
}

interface Course {
  _id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  instructor?: string;
  coverImage?: string;
  description?: string;
  duration?: number;
  price?: number;
  enrollmentCount?: number;
  category?: string | Category;
}

interface LearningPath {
  _id: string;
  title: string;
  description: string;
  coverImage: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedHours: number;
  courses: Course[];
  instructor: string;
  whoIsItSuitableFor?: string;
  whatYouWillLearn?: string;
}

const difficultyColors = {
  beginner: { bg: "bg-green-50", text: "text-green-700", label: "ผู้เริ่มต้น" },
  intermediate: { bg: "bg-blue-50", text: "text-blue-700", label: "ระดับกลาง" },
  advanced: { bg: "bg-red-50", text: "text-red-700", label: "ขั้นสูง" },
};

const formatDuration = (hours: number): string => {
  if (hours === 0) return "0 นาที";

  const totalMinutes = Math.round(hours * 60);

  if (totalMinutes < 60) {
    return `${totalMinutes} นาที`;
  } else {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}.${m.toString().padStart(2, "0")} ชม.`;
  }
};

const extractBulletPoints = (html: string): string[] => {
  if (!html) return [];
  if (typeof document === 'undefined') return [];

  const div = document.createElement('div');
  div.innerHTML = html;

  const listItems = div.querySelectorAll('li');
  if (listItems.length > 0) {
    return Array.from(listItems)
      .map(item => item.textContent?.trim())
      .filter(text => text && text.length > 0) as string[];
  }

  const paragraphs = div.querySelectorAll('p');
  if (paragraphs.length > 0) {
    return Array.from(paragraphs)
      .map(item => item.textContent?.trim())
      .filter(text => text && text.length > 0) as string[];
  }

  const text = div.textContent?.trim();
  return text ? [text] : [];
};

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <span className="text-left font-medium text-gray-900">{question}</span>
        <span className={`text-2xl text-indigo-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ∨
        </span>
      </button>

      {isOpen && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <p className="text-gray-700 text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function LearningPathDetail() {
  const params = useParams();
  const id = params.id as string;

  const [path, setPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPath = async () => {
      try {
        const res = await fetch(`/api/learning-paths/${id}`);
        const data = await res.json();
        setPath(data.path);
      } catch (error) {
        console.error("Failed to fetch learning path:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPath();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">กำลังโหลด...</p>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">ไม่พบเส้นทางการเรียน</p>
          <Link href="/courses?tab=online" className="text-indigo-600 hover:text-indigo-700 font-medium">
            กลับไปหน้าเส้นทาง
          </Link>
        </div>
      </div>
    );
  }

  const diff = difficultyColors[path.difficulty];
  const suitableForItems = extractBulletPoints(path.whoIsItSuitableFor || '');
  const whatYouWillLearnItems = extractBulletPoints(path.whatYouWillLearn || '');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/courses?tab=online" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm">
            <ArrowLeft className="w-4 h-4" />
            กลับไป
          </Link>
        </div>
      </div>

      {/* Main Content - Cover Image + Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Cover Image, Info + Courses */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cover Image */}
            <div className="h-[450px] bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl overflow-hidden flex items-center justify-center">
              {path.coverImage ? (
                <img src={path.coverImage} alt={path.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-6xl">🗺️</span>
              )}
            </div>

            {/* Title & Description */}
            <div>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{path.title}</h1>
                  <p className="text-gray-600 text-lg">{path.description}</p>
                </div>
                <span className={`${diff.bg} ${diff.text} px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0`}>
                  {diff.label}
                </span>
              </div>
            </div>

            {/* Suitable For & What You Will Learn */}
            {(suitableForItems.length > 0 || whatYouWillLearnItems.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {suitableForItems.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-indigo-600 mb-4">เส้นทางการเรียนนี้เหมาะกับใคร?</h3>
                    <ul className="space-y-3">
                      {suitableForItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="text-indigo-600 font-bold text-lg leading-none mt-0.5">✓</span>
                          <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {whatYouWillLearnItems.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-indigo-600 mb-4">สิ่งที่ได้เรียนรู้</h3>
                    <ul className="space-y-3">
                      {whatYouWillLearnItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="text-indigo-600 font-bold text-lg leading-none mt-0.5">✓</span>
                          <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Courses Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">หลักสูตรในเส้นทาง</h2>

              {path.courses && path.courses.length > 0 ? (
                <div className="space-y-0">
                  {path.courses.map((course, index) => (
                    <div key={course._id} className="flex gap-6 items-center">
                      {/* Timeline Number with connecting line */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-14 h-14 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg">
                          {index + 1}
                        </div>
                        {index < path.courses.length - 1 && (
                          <div className="w-0.5 bg-gray-300" style={{ height: "500px", marginBottom: "-250px" }}></div>
                        )}
                      </div>

                      {/* Course Card - Floating */}
                      <div className="flex-1 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow mb-4 p-6 flex gap-6">
                        {/* Course Image */}
                        <Link href={`/courses/${course._id}`} className="flex-shrink-0 block">
                          <div className="w-80 h-48 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg overflow-hidden flex items-center justify-center hover:scale-105 transition-transform">
                            {course.coverImage ? (
                              <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-5xl">📚</span>
                            )}
                          </div>
                        </Link>

                        {/* Course Info */}
                        <div className="flex-1 flex flex-col justify-between">
                          {/* Header */}
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-2">{course.title}</h3>

                            {/* Tags/Categories */}
                            {course.category && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                                  {typeof course.category === "string" ? course.category : (course.category as Category)?.name || ""}
                                </span>
                              </div>
                            )}

                            {/* Description */}
                            <p className="text-sm text-gray-600 line-clamp-2">{course.title}</p>
                          </div>

                          {/* Stats and CTA */}
                          <div className="flex flex-col">
                            <div className="flex-1">
                              {/* Instructor */}
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">👤</div>
                                <span className="text-sm text-gray-700 font-medium">{course.instructor || "ผู้สอน"}</span>
                              </div>

                              {/* Stats */}
                              <div className="flex items-center gap-4 mb-4 text-sm">
                                {course.enrollmentCount !== undefined && (
                                  <div className="flex items-center gap-1">
                                    <span>👥</span>
                                    <span className="font-semibold text-gray-900">{course.enrollmentCount}</span>
                                  </div>
                                )}

                                {course.duration && (
                                  <div className="flex items-center gap-1">
                                    <span>⏱️</span>
                                    <span className="font-semibold text-gray-900">{course.duration}</span>
                                    <span className="text-gray-600">นาที</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* View Details Link */}
                            <div className="flex justify-end">
                              <Link href={`/courses/${course._id}`} className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                                ดูรายละเอียด →
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">ยังไม่มีคอร์สในเส้นทางนี้</p>
              )}
            </div>
          </div>

          {/* Right Column: Sidebar - Price & Courses */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-4 max-h-[calc(100vh-100px)] overflow-y-auto">
              {/* Price */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-red-600">฿2,590.00</span>
                  <span className="text-base text-gray-400 line-through">3,570.00</span>
                </div>
              </div>

              {/* Stats */}
              <div className="mb-6 pb-6 border-b border-gray-100 space-y-3">
                <div className="flex items-center justify-between text-gray-700">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">ชั่วโมงการเรียน</span>
                  </div>
                  <span className="font-semibold text-gray-900">{formatDuration(path.estimatedHours)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-700">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">จำนวนคอร์สเรียน</span>
                  </div>
                  <span className="font-semibold text-gray-900">{path.courses.length} คอร์ส</span>
                </div>
              </div>

              {/* Courses List */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">คอร์สในเส้นทางการเรียนนี้</h3>
                <div className="space-y-2">
                  {path.courses && path.courses.length > 0 ? (
                    path.courses.map((course) => (
                      <div key={course._id} className="flex items-start gap-2 text-sm">
                        <span className="text-indigo-600 mt-1">✓</span>
                        <span className="text-gray-700">{course.title}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">ไม่มีคอร์สในเส้นทาง</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
                  ซื้อเส้นทางการเรียนนี้
                </button>
                <button className="w-full px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-semibold flex items-center justify-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  เพิ่มลงในตะกร้า
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">คำถามที่พบบ่อย</h2>
          <div className="space-y-4">
            <FAQItem
              question="เส้นทางการเรียนคืออะไร?"
              answer="เส้นทางการเรียนของ UPSkill คือการจัดกลุ่มคอร์สเรียนตามเป้าหมายของการเรียน, ทักษะหรืออาชีพ เพื่อให้ผู้เรียนสามารถเรียนตามคอร์สเรียนที่อยู่ในเส้นทางการเรียนตามความสนใจหรือความต้องการของตนเองได้"
            />
            <FAQItem
              question="เข้าถึงเส้นทางการเรียนได้อย่างไร?"
              answer="ตอนนี้เส้นทางการเรียนจะสามารถเข้าถึงได้เฉพาะสมาชิก UPSkill ที่สมัครแพ็คเกจรายปีเท่านั้น แต่ในอนาคต ทีม UPSkill กำลังจะพัฒนาระบบการซื้อให้สามารถซื้อเส้นทางการเรียนที่ลูกค้าหรือสมาชิกสนใจได้ โดยไม่จำเป็นต้องเป็นสมาชิกรายปี"
            />
            <FAQItem
              question="แพ็คเกจรายปีเข้าถึงได้ทุกเส้นทางการเรียนและคอร์สเรียนใช่หรือไม่?"
              answer="เรียนได้ทุกเส้นทางการเรียนรู้ และทุกคอร์สเรียนบน UPSkill ยกเว้น *คอร์สเรียนจาก SuperClass, The Vision, MBAx และ Exclusive Partners"
            />
            <FAQItem
              question="เส้นทางการเรียนอัพเดทบ่อยแค่ไหน?"
              answer="UPSkill จะอัพเดทเส้นทางการเรียนตามคอร์สเรียนใหม่ที่ออกทุกเดือน"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white text-gray-700 py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12 pb-12 border-b border-gray-200">
            {/* Brand */}
            <div className="md:col-span-2 lg:col-span-1">
              <h2 className="text-gray-900 font-bold text-lg mb-2">UPSkills</h2>
              <p className="text-sm text-gray-600 mb-4">แพลตฟอร์มการเรียนรู้ออนไลน์สำหรับทักษะแห่งอนาคต</p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-600 hover:text-gray-900">f</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">📷</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">🎵</a>
              </div>
            </div>

            {/* Courses */}
            <div>
              <h3 className="text-gray-900 font-semibold text-sm mb-4">บริการรหัสสินค้า</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">คอร์สออนไลน์</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">หลักสูตร Onsite</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">หลักสูตร Class</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Skill Pass</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-gray-900 font-semibold text-sm mb-4">ร่วมงานกับเรา</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">สำหรับครู</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">เส้นทางการเรียน</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">วัตรสัดทักษะ</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">บทความ</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">คำถามที่พบบ่อย</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-gray-900 font-semibold text-sm mb-4">ความช่วยเหลือและสนับสนุน</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">ติดต่อเรา</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">ศูนย์ความช่วยเหลือ</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">สมัครเป็น Affiliate</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">สมัครเป็นผู้สอน</a></li>
              </ul>
            </div>

            {/* Download & Contact */}
            <div>
              <h3 className="text-gray-900 font-semibold text-sm mb-4">ดาวน์โหลดแอปพลิเคชัน</h3>
              <div className="space-y-2 mb-6">
                <button className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded text-sm text-gray-900 hover:bg-gray-200 flex items-center justify-center gap-2">
                  <span>🍎</span> App Store
                </button>
                <button className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded text-sm text-gray-900 hover:bg-gray-200 flex items-center justify-center gap-2">
                  <span>▶</span> Google Play
                </button>
              </div>
              <h3 className="text-gray-900 font-semibold text-sm mb-2">ปรึกษาการเรียน</h3>
              <button className="w-full px-4 py-2 bg-green-500 text-white rounded font-medium text-sm hover:bg-green-600">
                💬 เพิ่มเพื่อน
              </button>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
            <p>© Copyright 2019-2026 UKE ME X CO.,LTD All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-600 hover:text-gray-900">ข้อตกลงการใช้บริการ</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">นโยบายความเป็นส่วนตัว</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">นโยบายการลิขสิทธิ์</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
