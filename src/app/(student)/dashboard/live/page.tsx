import { cookies } from "next/headers";
import { Video, Radio, Clock, ExternalLink, CalendarDays } from "lucide-react";

interface LiveSess {
  _id: string; title: string; description: string; meetLink: string;
  scheduledAt: string; duration: number; status: "upcoming" | "live" | "ended";
  replayLink: string; courseId?: { title: string } | null;
}

async function getLiveSessions(): Promise<LiveSess[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return [];
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/live`, {
    headers: { Cookie: `token=${token}` }, cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function StudentLivePage() {
  const sessions = await getLiveSessions();
  const live     = sessions.filter((s) => s.status === "live");
  const upcoming = sessions.filter((s) => s.status === "upcoming");
  const ended    = sessions.filter((s) => s.status === "ended");

  const Section = ({ title, items, icon }: { title: string; items: LiveSess[]; icon: React.ReactNode }) => (
    <div>
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">{icon}{title}</h2>
      <div className="space-y-3">
        {items.map((s) => {
          const dt = new Date(s.scheduledAt);
          const isLive = s.status === "live";
          return (
            <div key={s._id} className={`bg-white rounded-2xl border p-5 flex items-center gap-4 ${isLive ? "border-red-200 shadow-sm shadow-red-50" : "border-gray-100"}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isLive ? "bg-red-50" : s.status === "ended" ? "bg-gray-50" : "bg-blue-50"}`}>
                <Video className={`w-5 h-5 ${isLive ? "text-red-500" : s.status === "ended" ? "text-gray-300" : "text-blue-500"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {isLive && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">LIVE</span>}
                  <p className="font-semibold text-gray-900 truncate">{s.title}</p>
                </div>
                {s.courseId && <p className="text-xs text-indigo-500 mt-0.5">{s.courseId.title}</p>}
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />
                    {dt.toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                  </span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />
                    {dt.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                    {" "}({s.duration} นาที)
                  </span>
                </div>
                {s.description && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{s.description}</p>}
              </div>
              <div className="shrink-0 flex flex-col gap-1.5 items-end">
                {isLive && s.meetLink && (
                  <a href={s.meetLink} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors">
                    <Radio className="w-3.5 h-3.5" /> เข้าร่วม Live
                  </a>
                )}
                {isLive && !s.meetLink && (
                  <span className="text-xs text-red-400 font-medium">กำลัง Live อยู่</span>
                )}
                {s.status === "upcoming" && s.meetLink && (
                  <a href={s.meetLink} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors">
                    <ExternalLink className="w-3 h-3" /> เปิดลิงก์ล่วงหน้า
                  </a>
                )}
                {s.status === "ended" && s.replayLink && (
                  <a href={s.replayLink} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-600 text-xs font-semibold rounded-lg hover:bg-violet-100 transition-colors">
                    <Video className="w-3 h-3" /> ดู Replay
                  </a>
                )}
                {s.status === "ended" && !s.replayLink && (
                  <span className="text-xs text-gray-300">ไม่มี Replay</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Radio className="w-5 h-5 text-red-500" />Live Class</h1>
        <p className="text-gray-500 text-sm mt-1">ห้องเรียนสด</p>
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-20 text-gray-300">
          <Video className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">ยังไม่มีห้องเรียน Live</p>
        </div>
      )}
      {live.length > 0     && <Section title="กำลัง Live อยู่" items={live}     icon={<Radio className="w-3.5 h-3.5 text-red-500" />} />}
      {upcoming.length > 0 && <Section title="กำลังจะมา"       items={upcoming} icon={<CalendarDays className="w-3.5 h-3.5 text-blue-500" />} />}
      {ended.length > 0    && <Section title="จบแล้ว"           items={ended}    icon={<CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />} />}
    </div>
  );
}

function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}
