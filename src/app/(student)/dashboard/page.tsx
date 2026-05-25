import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { ICourse, ISession } from "@/types";
import { Calendar, Clock, BookOpen } from "lucide-react";
import Badge from "@/components/ui/Badge";
import MeetButton from "@/components/MeetButton";

interface PopulatedBooking {
  _id: string;
  sessionId: string;
  status: string;
  createdAt: string;
  courseId: ICourse;
}

async function getDashboardData(userId: string) {
  await connectDB();
  const [bookings, user] = await Promise.all([
    Booking.find({ userId, status: "confirmed" }).populate("courseId").sort({ createdAt: -1 }).lean(),
    User.findById(userId).select("-password").lean(),
  ]);
  return {
    bookings: JSON.parse(JSON.stringify(bookings)) as PopulatedBooking[],
    user: JSON.parse(JSON.stringify(user)),
  };
}

export default async function DashboardPage() {
  const auth = await getAuthUser();
  if (!auth) redirect("/login");

  const { bookings, user } = await getDashboardData(auth.userId);

  const todayStr = new Date().toISOString().slice(0, 10);

  const withSession = bookings
    .filter((b) => typeof b.courseId !== "string")
    .map((b) => {
      const course = b.courseId as ICourse;
      const session = course.sessions?.find((s: ISession) => s._id === b.sessionId);
      return { ...b, course, session: session ?? null };
    });

  const upcoming = withSession.filter(
    (b) => !b.session || b.session.date.slice(0, 10) >= todayStr
  );
  const past = withSession.filter(
    (b) => b.session && b.session.date.slice(0, 10) < todayStr
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">สวัสดี, {user?.name} • {user?.gradeLevel ? `ระดับ ${user.gradeLevel}` : "ยังไม่ระบุระดับชั้น"}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "คอร์สที่จอง", value: bookings.length, color: "text-indigo-600 bg-indigo-50" },
          { label: "รอเรียน", value: upcoming.length, color: "text-green-600 bg-green-50" },
          { label: "เรียนแล้ว", value: past.length, color: "text-gray-600 bg-gray-50" },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.color} rounded-2xl p-4 text-center`}>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm mt-0.5 opacity-80">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Upcoming bookings */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">คอร์สที่กำลังจะเรียน</h2>
        {upcoming.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">ยังไม่มีคอร์สที่จอง</p>
            <Link href="/courses" className="text-indigo-600 text-sm font-medium hover:underline mt-2 inline-block">
              ดูคอร์สทั้งหมด →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map((b) => (
              <BookingCard key={b._id} course={b.course} session={b.session ?? undefined} status="upcoming" />
            ))}
          </div>
        )}
      </section>

      {/* Past bookings */}
      {past.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">ประวัติการเรียน</h2>
          <div className="space-y-3">
            {past.map((b) => (
              <BookingCard key={b._id} course={b.course} session={b.session ?? undefined} status="past" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function BookingCard({ course, session, status }: { course: ICourse; session?: ISession; status: "upcoming" | "past" }) {
  return (
    <div className={`bg-white rounded-2xl border ${status === "upcoming" ? "border-indigo-100" : "border-gray-100"} p-5`}>
      <div className="flex gap-4">
        <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl overflow-hidden shrink-0">
          {course.coverImage ? (
            <Image src={course.coverImage} alt={course.title} fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <BookOpen className="w-8 h-8 text-indigo-300" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{course.title}</h3>
            <Badge variant={status === "upcoming" ? "success" : "default"} className="shrink-0">
              {status === "upcoming" ? "รอเรียน" : "เรียนแล้ว"}
            </Badge>
          </div>
          {session && (
            <div className="mt-2 space-y-1 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(session.date).toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {session.startTime} - {session.endTime} น.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Meet button — full width below, only for upcoming with link */}
      {session?.zoomLink && status === "upcoming" && (
        <div className="mt-4 pt-4 border-t border-gray-50">
          <MeetButton
            sessionDate={session.date}
            startTime={session.startTime}
            endTime={session.endTime}
            meetLink={session.zoomLink}
          />
        </div>
      )}
    </div>
  );
}
