import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Homework, HomeworkSubmission } from "@/models/Homework";
import Booking from "@/models/Booking";
import { BookOpen, Clock, CheckCircle2, ChevronRight } from "lucide-react";

export default async function StudentHomeworkPage() {
  const auth = await getAuthUser();
  if (!auth) redirect("/login");

  await connectDB();
  const bookings = await Booking.find({ userId: auth.userId, status: "confirmed" }).select("courseId").lean();
  const courseIds = bookings.map((b) => b.courseId);

  const [homeworks, submissions] = await Promise.all([
    Homework.find({ courseId: { $in: courseIds }, isActive: true })
      .populate("courseId", "title")
      .sort({ dueDate: 1 })
      .lean(),
    HomeworkSubmission.find({ studentId: auth.userId }).select("homeworkId status score").lean(),
  ]);

  const subMap = new Map(submissions.map((s) => [s.homeworkId.toString(), s]));

  const hw = JSON.parse(JSON.stringify(homeworks)) as Array<{
    _id: string; title: string; description: string; dueDate: string; maxScore: number;
    courseId: { title: string };
  }>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">การบ้าน</h1>
        <p className="text-gray-500 text-sm mt-1">การบ้านจากคอร์สที่คุณลงทะเบียน</p>
      </div>

      {hw.length === 0 ? (
        <div className="text-center py-20 text-gray-300">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">ยังไม่มีการบ้าน</p>
        </div>
      ) : (
        <div className="space-y-3">
          {hw.map((h) => {
            const sub  = subMap.get(h._id);
            const due  = new Date(h.dueDate);
            const past = due < new Date();
            return (
              <Link key={h._id} href={`/dashboard/homework/${h._id}`}
                className="block bg-white rounded-2xl border border-gray-100 p-5 hover:border-indigo-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${sub?.status === "graded" ? "bg-green-50" : sub ? "bg-yellow-50" : "bg-indigo-50"}`}>
                    {sub?.status === "graded"
                      ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                      : sub
                      ? <Clock className="w-5 h-5 text-yellow-500" />
                      : <BookOpen className="w-5 h-5 text-indigo-500" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{h.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {h.courseId?.title} · ส่งภายใน {due.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    {sub?.status === "graded" && sub.score !== undefined ? (
                      <span className="text-sm font-bold text-indigo-600">{sub.score}/{h.maxScore}</span>
                    ) : (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        sub ? "bg-yellow-100 text-yellow-700"
                        : past ? "bg-red-100 text-red-600"
                        : "bg-indigo-50 text-indigo-600"}`}>
                        {sub ? "รอตรวจ" : past ? "เลยกำหนด" : "รอส่ง"}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
