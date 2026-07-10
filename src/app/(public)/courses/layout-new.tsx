"use client";
import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";

interface CoursesFilterLayoutProps {
  children: React.ReactNode;
}

export default function CoursesFilterLayout({ children }: CoursesFilterLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "path" | "course">("all");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const CATEGORIES = [
    { name: "AI & Automation", items: ["Machine Learning", "NLP", "Computer Vision"] },
    { name: "การติดตอออนไลน์", items: ["Email", "Chat", "Video Call"] },
    { name: "ธุรกิจ", items: ["Marketing", "Sales", "Management"] },
    { name: "การเงิน & สนุน", items: ["Accounting", "Investment", "Banking"] },
    { name: "การพัฒนาแอง", items: ["Web Dev", "Mobile", "Backend"] },
    { name: "Office Productivity", items: ["Excel", "PowerPoint", "Word"] },
    { name: "Data", items: ["Data Science", "Analytics", "SQL"] },
  ];

  const toggleCategory = (cat: string) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(cat)) {
      newSet.delete(cat);
    } else {
      newSet.add(cat);
    }
    setExpandedCategories(newSet);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">คอร์สทั้งหมด</h1>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหา"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">หมวดหมู่ ({CATEGORIES.length})</h3>

              <div className="space-y-2">
                {CATEGORIES.map((cat) => (
                  <div key={cat.name}>
                    <button
                      onClick={() => toggleCategory(cat.name)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded"
                          readOnly
                        />
                        <span className="text-sm text-gray-700">{cat.name}</span>
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          expandedCategories.has(cat.name) ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {expandedCategories.has(cat.name) && (
                      <div className="pl-6 space-y-2">
                        {cat.items.map((item) => (
                          <label key={item} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded" />
                            <span className="text-sm text-gray-600">{item}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Price Range */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">ระดับ</h4>
                {["ฟรี", "ปรึกษา", "บาท"].map((price) => (
                  <label key={price} className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded" />
                    <span className="text-sm text-gray-600">{price}</span>
                  </label>
                ))}
              </div>

              {/* Duration */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">ความยาวคอร์ส</h4>
                {["0 - 1 ชั่วโมง", "1 - 2 ชั่วโมง", "2 - 4 ชั่วโมง", "4 ชั่วโมงขึ้นไป"].map((duration) => (
                  <label key={duration} className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded" />
                    <span className="text-sm text-gray-600">{duration}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="mb-8 flex gap-6 border-b border-gray-200">
              {[
                { id: "all", label: "ทั้งหมด (797)" },
                { id: "path", label: "เส้นทางการเรียน (130)" },
                { id: "course", label: "คอร์สเรียน (667)" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-4 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
