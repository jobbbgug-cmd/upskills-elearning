"use client";

import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, BookOpen, Building2 } from "lucide-react";
import DeleteContentButton from "./DeleteContentButton";
import { useState, useEffect } from "react";
import { ICourseContent } from "@/types";

type ContentType = "all" | "online" | "live online" | "onsite";

export default function ContentListPage() {
  const [contents, setContents] = useState<(ICourseContent & { type?: ContentType })[]>([]);
  const [filteredContents, setFilteredContents] = useState<(ICourseContent & { type?: ContentType })[]>([]);
  const [activeTab, setActiveTab] = useState<ContentType>("all");
  const [institutionName, setInstitutionName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/contents");
        if (res.ok) {
          const data = await res.json();
          setContents(data.contents || []);
          setInstitutionName(data.institutionName || "");
        }
      } catch (error) {
        console.error("Failed to load contents:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (activeTab === "all") {
      setFilteredContents(contents);
    } else {
      setFilteredContents(contents.filter((c) => c.type === activeTab));
    }
  }, [contents, activeTab]);

  const tabs: { id: ContentType; label: string }[] = [
    { id: "all", label: "ทั้งหมด" },
    { id: "online", label: "คอร์สออนไลน์" },
    { id: "live online", label: "Live Online" },
    { id: "onsite", label: "Onsite" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการเนื้อหาการเรียน</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-500 text-sm">สร้างชุดเนื้อหาและนำไปใช้กับคอร์สที่ต้องการ</p>
            {institutionName && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold theme-badge px-2.5 py-1 rounded-full">
                <Building2 className="w-3 h-3" />
                {institutionName}
              </span>
            )}
          </div>
        </div>
        <Link
          href={activeTab === "all" ? "/admin/content/create/online" : `/admin/content/create/${activeTab === "live online" ? "live-online" : activeTab}`}
          className="flex items-center gap-2 px-4 py-2.5 theme-button text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          สร้างชุดเนื้อหาใหม่
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex gap-4 border-b border-gray-200 pb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`font-medium text-sm pb-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      ) : filteredContents.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">ยังไม่มีชุดเนื้อหา</p>
          <p className="text-gray-400 text-sm mt-1">กด &quot;สร้างชุดเนื้อหาใหม่&quot; เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredContents.map((c) => {
            const total =
              (c.smartPpts?.length ?? 0) +
              (c.teachingClips?.length ?? 0) +
              (c.summaryClips?.length ?? 0) +
              (c.downloadFree?.length ?? 0) +
              (c.downloadTeacherCard?.length ?? 0) +
              (c.downloadAksorn?.length ?? 0);

            return (
              <div key={c._id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
                <div className="w-12 h-16 overflow-hidden shrink-0 bg-green-100 rounded flex items-center justify-center">
                  {c.ebookCoverUrl ? (
                    <Image src={c.ebookCoverUrl} alt={c.name} width={48} height={64} className="w-full h-full object-contain" />
                  ) : (
                    <BookOpen className="w-6 h-6 text-green-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 truncate">{c.name}</h3>
                  </div>
                  {c.description && (
                    <p className="text-sm text-gray-500 truncate mt-0.5">{c.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(c.smartPpts?.length ?? 0) > 0 && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        PPT {c.smartPpts!.length} ชุด
                      </span>
                    )}
                    {(c.teachingClips?.length ?? 0) > 0 && (
                      <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                        คลิปสอน {c.teachingClips!.length} คลิป
                      </span>
                    )}
                    {(c.summaryClips?.length ?? 0) > 0 && (
                      <span className="text-xs bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full">
                        คลิปสรุป {c.summaryClips!.length} คลิป
                      </span>
                    )}
                    {((c.downloadFree?.length ?? 0) + (c.downloadTeacherCard?.length ?? 0) + (c.downloadAksorn?.length ?? 0)) > 0 && (
                      <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                        ดาวน์โหลด {(c.downloadFree?.length ?? 0) + (c.downloadTeacherCard?.length ?? 0) + (c.downloadAksorn?.length ?? 0)} ไฟล์
                      </span>
                    )}
                    {total === 0 && (
                      <span className="text-xs text-gray-400 italic">ยังไม่มีเนื้อหา</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/content/${c._id}`}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm theme-link rounded-lg transition-colors font-medium hover:bg-gray-100"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    แก้ไข
                  </Link>
                  <DeleteContentButton id={c._id} name={c.name} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
