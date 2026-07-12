"use client";

import { Dispatch, SetStateAction } from "react";

interface CoursesTabsProps {
  courseCount: number;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function CourseTabs({ courseCount, activeTab, onTabChange }: CoursesTabsProps) {
  const tabs = [
    { id: "all", label: `ทั้งหมด (${courseCount})` },
    { id: "path", label: "เส้นทางการเรียน (0)" },
    { id: "course", label: `คอร์สเรียน (${courseCount})` },
  ];

  return (
    <div className="mb-8 flex gap-6 border-b border-gray-200 pb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`font-medium text-sm pb-2 transition-colors border-b-2 ${
            activeTab === tab.id
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
