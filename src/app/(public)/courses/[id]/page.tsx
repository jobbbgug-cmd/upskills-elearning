import { notFound } from "next/navigation";
import Image from "next/image";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import { ICourse } from "@/types";
import { getAuthUser } from "@/lib/auth";
import Booking from "@/models/Booking";
import Badge from "@/components/ui/Badge";
import CourseBooking from "./CourseBooking";
import { BookOpen, Users, Calendar, Clock, Video } from "lucide-react";

async function getCourse(id: string): Promise<ICourse | null> {
  await connectDB();
  try {
    const course = await Course.findById(id).lean();
    if (!course) return null;
    return JSON.parse(JSON.stringify(course)) as ICourse;
  } catch {
    return null;
  }
}

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await getCourse(id);
  if (!course) notFound();

  const auth = await getAuthUser();

  // Fetch ALL active bookings for this course to sync bookedSeats accurately
  await connectDB();
  const allBookings = await Booking.find({
    courseId: id,
    status: { $in: ["pending_payment", "confirmed"] },
  }).lean();

  // Build sessionId -> seatNumbers map from real booking records
  const sessionSeatsMap: Record<string, number[]> = {};
  allBookings.forEach((b) => {
    const sid = b.sessionId.toString();
    if (!sessionSeatsMap[sid]) sessionSeatsMap[sid] = [];
    if (b.seatNumber) sessionSeatsMap[sid].push(b.seatNumber as number);
  });

  // Override session.bookedSeats with actual DB data
  course.sessions = course.sessions.map((s) => ({
    ...s,
    bookedSeats: sessionSeatsMap[s._id] ?? s.bookedSeats ?? [],
    bookedCount: (sessionSeatsMap[s._id] ?? s.bookedSeats ?? []).length,
  }));

  interface MyBookingInfo { bookingId: string; seatNumber: number; status: string; slipImage: string; }
  const myBookings: Record<string, MyBookingInfo> = {};
  if (auth) {
    const myRecs = await Booking.find({
      userId: auth.userId,
      courseId: id,
      status: { $in: ["pending_payment", "confirmed", "rejected"] },
    }).lean();
    myRecs.forEach((b) => {
      myBookings[b.sessionId.toString()] = {
        bookingId: b._id.toString(),
        seatNumber: b.seatNumber as number,
        status: b.status,
        slipImage: b.slipImage ?? "",
      };
    });
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const futureSessions = course.sessions
    .filter((s) => s.date.slice(0, 10) >= todayStr)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover image */}
          <div className="relative h-64 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl overflow-hidden">
            {course.coverImage ? (
              <Image src={course.coverImage} alt={course.title} fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <BookOpen className="w-20 h-20 text-indigo-300" />
              </div>
            )}
          </div>

          {/* Course info */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="info">{course.category}</Badge>
              {course.gradeLevels.map((g) => <Badge key={g}>{g}</Badge>)}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{course.title}</h1>
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
              <Users className="w-4 h-4" />
              <span>สอนโดย {course.instructor}</span>
            </div>
            <p className="text-gray-600 leading-relaxed">{course.description}</p>
          </div>

          {/* Course details */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">รายละเอียดคอร์ส</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>{course.sessions.length} รอบเรียน</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>สูงสุด {course.sessions[0]?.maxCapacity ?? 10} คน/รอบ</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Video className="w-4 h-4 text-indigo-500" />
                <span>สอนสดผ่าน Jitsi Meet</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>{course.sessions[0] ? `${course.sessions[0].startTime} - ${course.sessions[0].endTime}` : "-"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column — booking */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
            <div className="text-center mb-5">
              <div className="text-3xl font-bold text-indigo-600 mb-1">
                {course.price === 0 ? "ฟรี" : `฿${course.price.toLocaleString()}`}
              </div>
              <p className="text-sm text-gray-500">ต่อคน ต่อรอบ</p>
            </div>

            {futureSessions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">ยังไม่มีรอบเรียนที่เปิด</p>
              </div>
            ) : (
              <CourseBooking
                course={course}
                sessions={futureSessions}
                myBookings={myBookings}
                isLoggedIn={!!auth}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
