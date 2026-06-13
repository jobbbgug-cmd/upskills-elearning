import Link from "next/link";
import Image from "next/image";
import { Clock, Users, BookOpen, Timer } from "lucide-react";
import Badge from "./ui/Badge";
import { ICourse } from "@/types";

interface CourseCardProps {
  course: ICourse;
}

export default function CourseCard({ course }: CourseCardProps) {
  const nextSession = course.sessions
    .filter((s) => new Date(s.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const firstSession = course.sessions[0];
  const sessionDuration = (() => {
    if (!firstSession?.startTime || !firstSession?.endTime) return null;
    const [sh, sm] = firstSession.startTime.split(":").map(Number);
    const [eh, em] = firstSession.endTime.split(":").map(Number);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins <= 0) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m === 0 ? `${h} ชม.` : `${h} ชม. ${m} นาที`;
  })();

  const totalSeats = course.sessions.reduce((sum, s) => sum + s.maxCapacity, 0);
  const totalBooked = course.sessions.reduce((sum, s) => sum + s.bookedCount, 0);
  const hasAvailable = course.sessions.some((s) => s.bookedCount < s.maxCapacity);

  return (
    <Link href={`/courses/${course._id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all duration-200 h-full flex flex-col">
        {/* Cover Image */}
        <div className="relative h-48 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
          {course.coverImage ? (
            <Image
              src={course.coverImage}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <BookOpen className="w-16 h-16 text-indigo-300" />
            </div>
          )}
          {/* Status badge */}
          <div className="absolute top-3 right-3">
            {hasAvailable ? (
              <span className="bg-green-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                ยังมีที่ว่าง
              </span>
            ) : (
              <span className="bg-red-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                เต็มทุกรอบ
              </span>
            )}
          </div>
        </div>

        <div className="p-5 flex flex-col flex-1">
          {/* Category + Grade */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <Badge variant="info">{course.category}</Badge>
            {course.gradeLevels.map((g) => (
              <Badge key={g} variant="default">{g}</Badge>
            ))}
          </div>

          <h3 className="font-semibold text-gray-900 text-base line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors">
            {course.title}
          </h3>
          <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{course.description}</p>

          <div className="space-y-2 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>{course.instructor} (อาจารย์)</span>
            </div>
            {nextSession && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  รอบถัดไป: {new Date(nextSession.date).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })} {nextSession.startTime} น.
                </span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center gap-3 text-gray-400">
                <span>{course.sessions.length} รอบเรียน</span>
                {sessionDuration && (
                  <span className="flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5" />
                    {sessionDuration}
                  </span>
                )}
              </div>
              <span className="font-semibold text-indigo-600 text-sm">
                {course.price === 0 ? "ฟรี" : `฿${course.price.toLocaleString()}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
