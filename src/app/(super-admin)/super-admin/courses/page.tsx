"use client";
import { useState, useEffect } from "react";
import { Building2, ChevronDown, Search, BookOpen, RefreshCw, CheckCircle2, XCircle } from "lucide-react";

interface Course {
  _id: string;
  title: string;
  instructor: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  institutionId?: string;
  contentId?: string;
  sessions?: { _id: string; date: string }[];
}

interface Institution {
  _id: string;
  name: string;
}

export default function SuperAdminCoursesPage() {
  const [courses, setCourses]         = useState<Course[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [filterInstitution, setFilterInstitution] = useState("all");

  const load = async (institutionId?: string) => {
    setLoading(true);
    const qs = institutionId && institutionId !== "all" ? `?institutionId=${institutionId}` : "";
    const [coursesRes, instRes] = await Promise.all([
      fetch(`/api/admin/courses${qs}`),
      fetch("/api/admin/institutions"),
    ]);
    if (coursesRes.ok) {
      const data = await coursesRes.json();
      setCourses(data.courses ?? []);
    }
    if (instRes.ok) setInstitutions(await instRes.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleInstitutionChange = (val: string) => {
    setFilterInstitution(val);
    load(val);
  };

  const institutionNames: Record<string, string> = {};
  institutions.forEach((i) => { institutionNames[i._id] = i.name; });

  const filtered = courses.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.title.toLowerCase().includes(q) || c.instructor?.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการคอร์ส</h1>
          <p className="text-gray-500 text-sm mt-1">คอร์สทั้งหมดจากทุกสถาบัน</p>
        </div>
        <button onClick={() => load(filterInstitution)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          <RefreshCw className="w-4 h-4" />
          รีเฟรช
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาชื่อคอร์ส หรือชื่อครู..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white" />
        </div>

        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={filterInstitution}
            onChange={(e) => handleInstitutionChange(e.target.value)}
            className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none cursor-pointer"
          >
            <option value="all">ทุกสถาบัน</option>
            {institutions.map((i) => (
              <option key={i._id} value={i._id}>{i.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="text-2xl font-bold text-gray-900">{courses.length}</div>
          <div className="text-sm text-gray-500 mt-0.5">คอร์สทั้งหมด</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="text-2xl font-bold text-green-600">{courses.filter((c) => c.isActive).length}</div>
          <div className="text-sm text-gray-500 mt-0.5">เปิดสอน</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="text-2xl font-bold text-gray-400">{courses.filter((c) => !c.isActive).length}</div>
          <div className="text-sm text-gray-500 mt-0.5">ปิด</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400">กำลังโหลด...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            ไม่พบคอร์ส
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">คอร์ส</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">สถาบัน</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">ครู</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">ราคา</th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">รอบ</th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">เนื้อหาการเรียน</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">สถานะ</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">สร้างเมื่อ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-gray-900">{c.title}</p>
                  </td>
                  <td className="px-5 py-4">
                    {c.institutionId ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
                        <Building2 className="w-3 h-3" />{institutionNames[c.institutionId] ?? "สถาบัน"}
                      </span>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">{c.instructor || "—"}</td>
                  <td className="px-5 py-4 text-sm text-right font-medium text-gray-800">
                    {c.price > 0 ? `฿${c.price.toLocaleString()}` : "ฟรี"}
                  </td>
                  <td className="px-5 py-4 text-center text-sm text-gray-500">{c.sessions?.length ?? 0}</td>
                  <td className="px-5 py-4 text-center">
                    {c.contentId ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />มีเนื้อหา
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                        <XCircle className="w-3.5 h-3.5" />ยังไม่มี
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium ${c.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {c.isActive ? "เปิดสอน" : "ปิด"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-3 text-right">แสดง {filtered.length} จาก {courses.length} คอร์ส</p>
    </div>
  );
}
