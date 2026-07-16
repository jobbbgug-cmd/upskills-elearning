"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { CheckCircle, XCircle, Clock3, Search, Building2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import LoadingSpinner from "@/components/LoadingSpinner";

interface BookingRow {
  _id: string;
  seatNumber: number;
  status: string;
  slipImage: string;
  createdAt: string;
  sessionId: string;
  institutionId?: string;
  userId: { _id: string; name: string; email: string; gradeLevel?: string };
  courseId: { _id: string; title: string; sessions: { _id: string; date: string; startTime: string; endTime: string }[] };
}

interface Institution {
  _id: string;
  name: string;
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending_payment: { label: "รอตรวจสอบ",  cls: "bg-amber-100 text-amber-700" },
  confirmed:       { label: "อนุมัติแล้ว", cls: "bg-green-100 text-green-700" },
  rejected:        { label: "ปฏิเสธแล้ว",  cls: "bg-red-100 text-red-700" },
  cancelled:       { label: "ยกเลิก",       cls: "bg-gray-100 text-gray-500" },
};

export default function AdminBookingsPage() {
  const [bookings, setBookings]           = useState<BookingRow[]>([]);
  const [institutions, setInstitutions]   = useState<Institution[]>([]);
  const [loading, setLoading]             = useState(true);
  const [tab, setTab]                     = useState<"pending" | "all">("pending");
  const [search, setSearch]               = useState("");
  const [filterInstitution, setFilterInstitution] = useState("all");
  const [previewSlip, setPreviewSlip]     = useState<string | null>(null);
  const [acting, setActing]               = useState<string | null>(null);
  const [confirmBooking, setConfirmBooking] = useState<{ open: boolean; id: string; action: "approve" | "reject" }>({ open: false, id: "", action: "approve" });

  const load = async (institutionId?: string) => {
    setLoading(true);
    const qs = institutionId && institutionId !== "all" ? `?institutionId=${institutionId}` : "";
    const [bookingsRes, instRes] = await Promise.all([
      fetch(`/api/admin/bookings${qs}`),
      fetch("/api/admin/institutions"),
    ]);
    if (bookingsRes.ok) {
      const data = await bookingsRes.json();
      setBookings(data.bookings ?? []);
    }
    if (instRes.ok) {
      setInstitutions(await instRes.json());
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleInstitutionChange = (val: string) => {
    setFilterInstitution(val);
    load(val);
  };

  const act = async (id: string, action: "approve" | "reject") => {
    setActing(id);
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      setBookings((prev) => prev.map((b) =>
        b._id === id ? { ...b, status: action === "approve" ? "confirmed" : "rejected" } : b
      ));
    }
    setActing(null);
  };

  const institutionNames: Record<string, string> = {};
  institutions.forEach((i) => { institutionNames[i._id] = i.name; });

  const filtered = bookings.filter((b) => {
    const matchTab = tab === "all" || b.status === "pending_payment";
    const q = search.toLowerCase();
    const matchSearch = !q ||
      b.userId?.name?.toLowerCase().includes(q) ||
      b.userId?.email?.toLowerCase().includes(q) ||
      b.courseId?.title?.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const pendingCount = bookings.filter((b) => b.status === "pending_payment").length;

  return (
    <div>
      <ConfirmDialog
        open={confirmBooking.open}
        title={confirmBooking.action === "approve" ? "อนุมัติการชำระเงิน?" : "ปฏิเสธการชำระเงิน?"}
        message={confirmBooking.action === "approve" ? "ยืนยันว่าสลิปถูกต้องและอนุมัติการจองนี้" : "การจองนี้จะถูกปฏิเสธ นักเรียนจะไม่ได้เข้าเรียน"}
        confirmLabel={confirmBooking.action === "approve" ? "อนุมัติ" : "ปฏิเสธ"}
        type={confirmBooking.action === "approve" ? "success" : "danger"}
        onConfirm={() => act(confirmBooking.id, confirmBooking.action)}
        onCancel={() => setConfirmBooking((d) => ({ ...d, open: false }))}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ตรวจสอบการชำระเงิน</h1>
        <p className="text-gray-500 text-sm mt-1">ตรวจสอบสลิปและอนุมัติการจองคอร์ส (ทุกสถาบัน)</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-5 items-center">
        {/* Status tabs */}
        <button onClick={() => setTab("pending")}
          className={cn("px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2",
            tab === "pending" ? "bg-amber-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          )}>
          <Clock3 className="w-4 h-4" />
          รอตรวจสอบ
          {pendingCount > 0 && (
            <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full",
              tab === "pending" ? "bg-white text-amber-600" : "bg-amber-500 text-white"
            )}>{pendingCount}</span>
          )}
        </button>
        <button onClick={() => setTab("all")}
          className={cn("px-4 py-2 rounded-xl text-sm font-semibold transition-colors",
            tab === "all" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          )}>
          ทั้งหมด ({bookings.length})
        </button>

        {/* Institution filter */}
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={filterInstitution}
            onChange={(e) => handleInstitutionChange(e.target.value)}
            className="pl-9 pr-8 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
          >
            <option value="all">ทุกสถาบัน</option>
            {institutions.map((i) => (
              <option key={i._id} value={i._id}>{i.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>

        {/* Search */}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อ, อีเมล, คอร์ส..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56" />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          {tab === "pending" ? "✅ ไม่มีรายการรอตรวจสอบ" : "ไม่พบรายการ"}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => {
            const session    = booking.courseId?.sessions?.find((s) => s._id === booking.sessionId);
            const statusInfo = STATUS_LABEL[booking.status] ?? STATUS_LABEL.pending_payment;
            const isPending  = booking.status === "pending_payment";
            const instName   = booking.institutionId ? (institutionNames[booking.institutionId] ?? "สถาบัน") : null;

            return (
              <div key={booking._id}
                className={cn("bg-white rounded-2xl border p-5 flex flex-col md:flex-row gap-4",
                  isPending ? "border-amber-200 shadow-sm shadow-amber-50" : "border-gray-100"
                )}>
                {/* Info */}
                <div className="flex-1 space-y-2 min-w-0">
                  {/* Institution badge */}
                  {instName && (
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                      <span className="text-xs font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">{instName}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-900">{booking.userId?.name}</span>
                    <span className="text-xs text-gray-400">{booking.userId?.email}</span>
                    {booking.userId?.gradeLevel && (
                      <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{booking.userId.gradeLevel}</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">{booking.courseId?.title}</p>
                  {session && (
                    <p className="text-xs text-gray-500">
                      {new Date(session.date).toLocaleDateString("th-TH", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                      {" · "}{session.startTime}–{session.endTime} น.
                    </p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg">ที่นั่ง {booking.seatNumber}</span>
                    <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-lg", statusInfo.cls)}>{statusInfo.label}</span>
                  </div>
                  <p className="text-xs text-gray-400">จองเมื่อ {new Date(booking.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>

                {/* Slip */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <p className="text-xs text-gray-400 mb-1">สลิปโอนเงิน</p>
                  {booking.slipImage ? (
                    <button onClick={() => setPreviewSlip(booking.slipImage)}
                      className="group relative w-24 h-28 rounded-xl overflow-hidden border border-gray-200 hover:border-indigo-300 transition-colors">
                      <Image src={booking.slipImage} alt="slip" fill className="object-cover group-hover:opacity-80 transition-opacity" />
                      <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 text-white text-xs font-medium">ดูสลิป</span>
                    </button>
                  ) : (
                    <div className="w-24 h-28 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xs text-center p-2">
                      ยังไม่ส่ง
                    </div>
                  )}
                </div>

                {/* Actions */}
                {isPending && (
                  <div className="flex md:flex-col gap-2 justify-end shrink-0">
                    <button onClick={() => setConfirmBooking({ open: true, id: booking._id, action: "approve" })} disabled={acting === booking._id}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap">
                      <CheckCircle className="w-4 h-4" /> อนุมัติ
                    </button>
                    <button onClick={() => setConfirmBooking({ open: true, id: booking._id, action: "reject" })} disabled={acting === booking._id}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-600 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap">
                      <XCircle className="w-4 h-4" /> ปฏิเสธ
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Slip fullscreen preview */}
      {previewSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPreviewSlip(null)}>
          <div className="bg-white rounded-2xl p-3 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <img src={previewSlip} alt="slip" className="w-full rounded-xl max-h-[70vh] object-contain" />
            <button onClick={() => setPreviewSlip(null)} className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium">ปิด</button>
          </div>
        </div>
      )}
    </div>
  );
}
