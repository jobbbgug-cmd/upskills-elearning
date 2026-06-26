import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import { CheckCircle2, Calendar } from "lucide-react";

export default async function StudentAttendancePage() {
  const auth = await getAuthUser();
  if (!auth) redirect("/login");

  await connectDB();
  const records = await Attendance.find({ studentId: auth.userId })
    .populate("courseId", "title")
    .sort({ checkedInAt: -1 })
    .lean();

  const data = JSON.parse(JSON.stringify(records)) as Array<{
    _id: string; courseId: { title: string }; sessionId: string;
    method: string; checkedInAt: string;
  }>;

  const METHOD_LABEL: Record<string, string> = { qr: "QR Code", manual: "ครูเช็คชื่อ", online: "ออนไลน์" };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ประวัติการเข้าเรียน</h1>
        <p className="text-gray-500 text-sm mt-1">บันทึกการเช็คชื่อทั้งหมด</p>
      </div>
      <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-4 mb-6">
        <CheckCircle2 className="w-6 h-6 text-indigo-600 shrink-0" />
        <div>
          <div className="text-2xl font-bold text-indigo-700">{data.length}</div>
          <div className="text-xs text-indigo-400">ครั้งที่เข้าเรียน</div>
        </div>
      </div>
      {data.length === 0 ? (
        <div className="text-center py-20 text-gray-300">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">ยังไม่มีประวัติการเข้าเรียน</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((r) => (
            <div key={r._id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{r.courseId?.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(r.checkedInAt).toLocaleDateString("th-TH", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                  {" "}· {new Date(r.checkedInAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full shrink-0">
                {METHOD_LABEL[r.method] ?? r.method}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
