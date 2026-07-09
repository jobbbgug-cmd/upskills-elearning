"use client";
import { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Notif {
  _id: string; title: string; body: string; link?: string;
  type: string; isRead: boolean; createdAt: string;
}

const TYPE_COLOR: Record<string, string> = {
  homework_graded: "bg-amber-400",
  quiz_available:  "bg-indigo-400",
  homework_due:    "bg-red-400",
  certificate:     "bg-yellow-400",
  announcement:    "bg-violet-400",
  general:         "bg-gray-400",
};

function timeSince(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "เมื่อสักครู่";
  if (m < 60) return `${m} นาทีที่แล้ว`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ชั่วโมงที่แล้ว`;
  return `${Math.floor(h / 24)} วันที่แล้ว`;
}

export default function NotificationBell() {
  const [open,        setOpen]        = useState(false);
  const [notifs,      setNotifs]      = useState<Notif[]>([]);
  const [unread,      setUnread]      = useState(0);
  const [marking,     setMarking]     = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetch_ = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const d = await res.json();
      setNotifs(d.notifications ?? []);
      setUnread(d.unreadCount ?? 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetch_();
    const interval = setInterval(fetch_, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    setMarking(true);
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
    setMarking(false);
  };

  const markOne = async (id: string) => {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: [id] }) });
    setNotifs((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    setUnread((u) => Math.max(0, u - 1));
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 flex flex-col max-h-[480px]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
            <h3 className="font-semibold text-gray-900 text-sm">การแจ้งเตือน</h3>
            {unread > 0 && (
              <button onClick={markAllRead} disabled={marking}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50">
                <CheckCheck className="w-3.5 h-3.5" /> อ่านทั้งหมด
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {notifs.length === 0 ? (
              <div className="py-12 text-center text-gray-300 text-sm">ไม่มีการแจ้งเตือน</div>
            ) : notifs.map((n) => (
              <div key={n._id}
                className={`flex gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer ${!n.isRead ? "bg-indigo-50/50" : ""}`}
                onClick={() => { if (!n.isRead) markOne(n._id); if (n.link) { setOpen(false); window.location.href = n.link; } }}>
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.isRead ? TYPE_COLOR[n.type] ?? "bg-indigo-400" : "bg-transparent"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-snug ${!n.isRead ? "font-semibold text-gray-900" : "text-gray-700"}`}>{n.title}</p>
                    {n.link && <ExternalLink className="w-3 h-3 text-gray-300 shrink-0 mt-0.5" />}
                  </div>
                  {n.body && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.body}</p>}
                  <p className="text-[11px] text-gray-300 mt-1">{timeSince(n.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
