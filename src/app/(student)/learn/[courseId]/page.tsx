import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Course from "@/models/Course";
import { ArrowLeft, Monitor, Play, Download, BookOpen } from "lucide-react";

const MEDIA_LINKS = [
  { key: "linkDigital",      label: "สื่อดิจิทัล",        Icon: Monitor  },
  { key: "linkClip",         label: "คลิป",               Icon: Play     },
  { key: "linkSupplementary",label: "สื่อประกอบการสอน",   Icon: Download },
  { key: "linkFullbook",     label: "สื่อฯ เต็มเล่ม",     Icon: BookOpen },
] as const;

export default async function LearnPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const auth = await getAuthUser();
  if (!auth) redirect("/login");

  await connectDB();

  const [booking, course] = await Promise.all([
    Booking.findOne({ userId: auth.userId, courseId, status: "confirmed" }).lean(),
    Course.findById(courseId).lean(),
  ]);

  if (!booking || !course) redirect("/dashboard");

  const c = JSON.parse(JSON.stringify(course)) as Record<string, string>;

  const activeLinks = MEDIA_LINKS.filter((m) => c[m.key]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back */}
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        ย้อนกลับ
      </Link>

      {/* Title row + media buttons */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-2">{c.title}</h1>
          <p className="text-gray-500 text-sm">{c.instructor}</p>
        </div>

        {/* 4 orange circle buttons */}
        {activeLinks.length > 0 && (
          <div className="flex flex-wrap gap-6 shrink-0">
            {MEDIA_LINKS.map(({ key, label, Icon }) => {
              const url = c[key];
              if (!url) return null;
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-14 h-14 rounded-full bg-amber-400 group-hover:bg-amber-500 transition-colors flex items-center justify-center shadow-md">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 text-center leading-tight max-w-[70px]">
                    {label}
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* Cover image */}
      {c.coverImage ? (
        <div className="flex justify-center">
          <div className="relative w-72 h-96 rounded-2xl overflow-hidden shadow-xl">
            <Image src={c.coverImage} alt={c.title} fill className="object-cover" />
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="w-72 h-96 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-xl">
            <BookOpen className="w-20 h-20 text-indigo-300" />
          </div>
        </div>
      )}

      {/* No links message */}
      {activeLinks.length === 0 && (
        <p className="text-center text-gray-400 text-sm mt-8">ยังไม่มีสื่อการสอนสำหรับคอร์สนี้</p>
      )}
    </div>
  );
}
