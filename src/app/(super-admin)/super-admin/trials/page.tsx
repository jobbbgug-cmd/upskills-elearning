"use client";
import { useEffect, useState } from "react";
import { Clock, CheckCircle2, PhoneCall, XCircle, RefreshCw } from "lucide-react";

interface TrialItem {
  _id: string;
  institutionName: string;
  fullName: string;
  phone: string;
  institutionType: string;
  contactChannel: string;
  contactValue: string;
  status: "pending" | "contacted" | "approved" | "rejected";
  createdAt: string;
}

const STATUS_CONFIG = {
  pending:   { label: "รอดำเนินการ", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  contacted: { label: "ติดต่อแล้ว",  color: "bg-blue-100 text-blue-700 border-blue-200",   icon: PhoneCall },
  approved:  { label: "อนุมัติแล้ว", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  rejected:  { label: "ปฏิเสธ",      color: "bg-red-100 text-red-700 border-red-200",       icon: XCircle },
};

const NEXT_STATUS: Record<string, string[]> = {
  pending:   ["contacted", "approved", "rejected"],
  contacted: ["approved", "rejected"],
  approved:  [],
  rejected:  [],
};

export default function TrialsPage() {
  const [items, setItems] = useState<TrialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/super-admin/trial-requests");
    const data = await res.json();
    setItems(data.items ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/super-admin/trial-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setItems((prev) => prev.map((it) => it._id === id ? { ...it, status: status as TrialItem["status"] } : it));
  };

  const filtered = filter === "all" ? items : items.filter((i) => i.status === filter);

  const counts = {
    all: items.length,
    pending: items.filter((i) => i.status === "pending").length,
    contacted: items.filter((i) => i.status === "contacted").length,
    approved: items.filter((i) => i.status === "approved").length,
    rejected: items.filter((i) => i.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">คำขอทดลองใช้งาน</h1>
          <p className="text-gray-500 text-sm mt-1">รายการคำขอจากหน้าเว็บไซต์</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600 border border-gray-200 hover:border-teal-300 px-3 py-1.5 rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4" />
          รีเฟรช
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all", label: "ทั้งหมด" },
          { key: "pending", label: "รอดำเนินการ" },
          { key: "contacted", label: "ติดต่อแล้ว" },
          { key: "approved", label: "อนุมัติแล้ว" },
          { key: "rejected", label: "ปฏิเสธ" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === key
                ? "bg-teal-500 text-white border-teal-500"
                : "bg-white text-gray-600 border-gray-200 hover:border-teal-300"
            }`}
          >
            {label} ({counts[key as keyof typeof counts]})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">กำลังโหลด...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">ไม่มีรายการ</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const cfg = STATUS_CONFIG[item.status];
            const Icon = cfg.icon;
            const nextStatuses = NEXT_STATUS[item.status];
            return (
              <div key={item._id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h3 className="font-semibold text-gray-900">{item.institutionName}</h3>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-sm">
                      <div><span className="text-gray-400">ชื่อ:</span> <span className="text-gray-700">{item.fullName}</span></div>
                      <div><span className="text-gray-400">โทร:</span> <span className="text-gray-700">{item.phone}</span></div>
                      <div><span className="text-gray-400">ประเภท:</span> <span className="text-gray-700">{item.institutionType}</span></div>
                      <div>
                        <span className="text-gray-400">ช่องทาง:</span>{" "}
                        <span className="text-gray-700">
                          {item.contactChannel === "line" ? "LINE" : item.contactChannel === "email" ? "อีเมล" : "โทร"}
                          {" — "}{item.contactValue}
                        </span>
                      </div>
                      <div className="text-gray-400 text-xs mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                  {nextStatuses.length > 0 && (
                    <div className="flex flex-col gap-1.5 shrink-0">
                      {nextStatuses.map((s) => {
                        const nc = STATUS_CONFIG[s as keyof typeof STATUS_CONFIG];
                        return (
                          <button
                            key={s}
                            onClick={() => updateStatus(item._id, s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${nc.color} hover:opacity-80`}
                          >
                            {nc.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
