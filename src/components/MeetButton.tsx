"use client";
import { useState, useEffect } from "react";
import { ExternalLink, Clock } from "lucide-react";

interface MeetButtonProps {
  sessionDate: string;
  startTime: string;
  endTime: string;
  meetLink: string;
}

function toSessionDate(date: string, time: string): Date {
  const d = new Date(date);
  const [h, m] = time.split(":").map(Number);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m, 0);
}

export default function MeetButton({ sessionDate, startTime, endTime, meetLink }: MeetButtonProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const start = toSessionDate(sessionDate, startTime);
  const end   = toSessionDate(sessionDate, endTime);
  const open  = new Date(start.getTime() - 15 * 60 * 1000);

  const isActive = now >= open && now <= end;
  const isEnded  = now > end;
  const msLeft   = open.getTime() - now.getTime();

  if (isEnded) return null;

  if (isActive) {
    return (
      <a
        href={meetLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-blue-200 transition-all w-full"
      >
        {/* Jitsi watermelon icon */}
        <span className="text-lg leading-none">🍉</span>
        <span>เข้าเรียนผ่าน Jitsi Meet</span>
        <ExternalLink className="w-4 h-4 ml-auto" />
      </a>
    );
  }

  const totalMin = Math.max(0, Math.floor(msLeft / 60_000));
  const hours    = Math.floor(totalMin / 60);
  const mins     = totalMin % 60;
  const countdownText = hours > 0 ? `${hours} ชม. ${mins} นาที` : `${mins} นาที`;

  return (
    <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl">
      <Clock className="w-3.5 h-3.5 shrink-0" />
      <span>
        ห้องเรียนจะเปิดใน{" "}
        <strong className="text-gray-600">{countdownText}</strong>
        {" "}ก่อนเรียน
      </span>
    </div>
  );
}
