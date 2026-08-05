"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

interface Category {
  name: string;
  count: number;
}

export default function PublicNavigation() {
  const [onlineCategories, setOnlineCategories] = useState<Category[]>([]);
  const [liveOnlineCategories, setLiveOnlineCategories] = useState<Category[]>([]);
  const [onsiteCategories, setOnsiteCategories] = useState<Category[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories?type=online")
        .then((r) => r.json())
        .then((data) => setOnlineCategories(data.categories || []))
        .catch(() => setOnlineCategories([])),
      fetch("/api/categories?type=live online")
        .then((r) => r.json())
        .then((data) => setLiveOnlineCategories(data.categories || []))
        .catch(() => setLiveOnlineCategories([])),
      fetch("/api/categories?type=onsite")
        .then((r) => r.json())
        .then((data) => setOnsiteCategories(data.categories || []))
        .catch(() => setOnsiteCategories([])),
    ]);
  }, []);

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-12 gap-8">
          {/* Online Courses */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-indigo-600 py-3">
              คอร์สออนไลน์
              <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute left-0 top-full hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-72 z-50">
              {onlineCategories.length > 0 ? (
                onlineCategories.map((cat) => (
                  <Link
                    key={cat.name}
                    href={`/courses?category=${encodeURIComponent(cat.name)}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    {cat.name} ({cat.count})
                  </Link>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">กำลังโหลด...</div>
              )}
            </div>
          </div>

          {/* Live Online Courses */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-indigo-600 py-3">
              คอร์สเรียน Live
              <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute left-0 top-full hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-72 z-50">
              {liveOnlineCategories.length > 0 ? (
                liveOnlineCategories.map((cat) => (
                  <Link
                    key={`live-${cat.name}`}
                    href={`/courses?type=live online&category=${encodeURIComponent(cat.name)}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    {cat.name} ({cat.count})
                  </Link>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">กำลังโหลด...</div>
              )}
            </div>
          </div>

          {/* Onsite Courses */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-indigo-600 py-3">
              หลักสูตร Onsite
              <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute left-0 top-full hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-72 z-50">
              {onsiteCategories.length > 0 ? (
                onsiteCategories.map((cat) => (
                  <Link
                    key={`onsite-${cat.name}`}
                    href={`/courses?tab=onsite&category=${encodeURIComponent(cat.name)}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    {cat.name} ({cat.count})
                  </Link>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">กำลังโหลด...</div>
              )}
            </div>
          </div>

          {/* Skill Pass */}
          <Link href="/skill-pass" className="text-sm font-medium text-gray-700 hover:text-indigo-600 py-3">
            Skill Pass
          </Link>

          {/* Articles */}
          <Link href="/articles" className="text-sm font-medium text-gray-700 hover:text-indigo-600 py-3">
            บทความ
          </Link>

          {/* For Organizations */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-indigo-600 py-3">
              สำหรับองค์กร
              <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute left-0 top-full hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-64 z-50">
              <Link href="/corporate/training" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                การอบรมภายใน
              </Link>
              <Link href="/corporate/bulk" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                ซื้อเป็นชุด
              </Link>
              <Link href="/corporate/pricing" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                ราคา
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
