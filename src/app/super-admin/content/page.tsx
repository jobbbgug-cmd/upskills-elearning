"use client";

import { useState, useEffect } from "react";
import { FileText, Plus, Pencil, Trash2 } from "lucide-react";

interface Content {
  _id: string;
  name: string;
  type: string;
  createdAt: string;
}

export default function ContentPage() {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch("/api/super-admin/content");
        if (res.ok) {
          const data = await res.json();
          setContent(Array.isArray(data) ? data : data.content || []);
        }
      } catch (error) {
        console.error("Failed to fetch content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const filtered = content.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">เนื้อหาการเรียน</h1>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">เนื้อหาการเรียน</h1>
          <p className="text-sm text-gray-600 mt-1">รวม {content.length} เนื้อหา</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
          <Plus className="w-4 h-4" />
          เพิ่มเนื้อหา
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <input
          type="text"
          placeholder="ค้นหาเนื้อหา..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
        />
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">ชื่อเนื้อหา</th>
                <th className="text-left py-3 px-4 font-semibold">ประเภท</th>
                <th className="text-left py-3 px-4 font-semibold">วันสร้าง</th>
                <th className="text-left py-3 px-4 font-semibold">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{item.name}</td>
                  <td className="py-3 px-4 text-gray-600">{item.type}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(item.createdAt).toLocaleDateString("th-TH")}
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-500">ไม่พบข้อมูลเนื้อหา</p>
        </div>
      )}
    </div>
  );
}
