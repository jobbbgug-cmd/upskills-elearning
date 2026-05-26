import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Course from "@/models/Course";
import { ICourse } from "@/types";
import { ArrowLeft, Monitor, Play, Download, BookOpen, FileText } from "lucide-react";
import VideoSection from "@/components/VideoSection";

export default async function LearnPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const auth = await getAuthUser();
  if (!auth) redirect("/login");

  await connectDB();

  const isAdmin = auth.role === "admin" || auth.role === "teacher";

  const [booking, rawCourse] = await Promise.all([
    isAdmin ? Promise.resolve(true) : Booking.findOne({ userId: auth.userId, courseId, status: "confirmed" }).lean(),
    Course.findById(courseId).lean(),
  ]);

  if (!booking || !rawCourse) redirect("/dashboard");

  const course = JSON.parse(JSON.stringify(rawCourse)) as ICourse;

  const hasContent =
    course.ebookPdfUrl ||
    (course.smartPpts?.length ?? 0) > 0 ||
    (course.teachingClips?.length ?? 0) > 0 ||
    (course.summaryClips?.length ?? 0) > 0 ||
    (course.downloadFree?.length ?? 0) > 0 ||
    (course.downloadTeacherCard?.length ?? 0) > 0 ||
    (course.downloadAksorn?.length ?? 0) > 0;

  const NAV_BUTTONS = [
    { label: "สื่อดิจิทัล",        Icon: Monitor,  href: "#ebook"    },
    { label: "คลิป",               Icon: Play,     href: "#clips"    },
    { label: "สื่อประกอบการสอน",   Icon: Download, href: "#downloads"},
    { label: "สื่อฯ เต็มเล่ม",     Icon: BookOpen, href: course.linkFullbook ? course.linkFullbook : "#ebook" },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back */}
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        ย้อนกลับ
      </Link>

      {/* ── Header: title + 4 buttons + download ── */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-snug">{course.title}</h1>
          <p className="text-gray-500 text-sm mt-1">{course.instructor}</p>
        </div>

        <div className="flex flex-col items-end gap-3 shrink-0">
          {/* 4 orange circle buttons */}
          <div className="flex gap-5">
            {NAV_BUTTONS.map(({ label, Icon, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className="w-14 h-14 rounded-full bg-amber-400 group-hover:bg-amber-500 transition-colors flex items-center justify-center shadow">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-600 text-center leading-tight max-w-[68px]">{label}</span>
              </a>
            ))}
          </div>

          {/* Download button */}
          {course.linkDownload && (
            <a
              href={course.linkDownload}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              ดาวน์โหลดสื่อ
            </a>
          )}
        </div>
      </div>

      {!hasContent && (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">ยังไม่มีสื่อการสอนสำหรับคอร์สนี้</p>
        </div>
      )}

      {/* ── e-Book section ── */}
      {(course.coverImage || course.ebookPdfUrl) && (
        <section id="ebook" className="mb-10 scroll-mt-20">
          <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-4">
            <span className="text-red-600 font-extrabold text-lg">📚</span>
            e-Book
          </h2>
          {course.ebookPdfUrl ? (
            <a href={course.ebookPdfUrl} target="_blank" rel="noopener noreferrer" className="inline-block group">
              <div className="relative w-48 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
                {course.coverImage ? (
                  <Image src={course.coverImage} alt={course.title} width={192} height={256} className="object-cover w-full" />
                ) : (
                  <div className="w-48 h-64 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-indigo-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full transition-opacity">
                    เปิดดู PDF
                  </span>
                </div>
              </div>
            </a>
          ) : course.coverImage ? (
            <div className="relative w-48 rounded-xl overflow-hidden shadow-lg">
              <Image src={course.coverImage} alt={course.title} width={192} height={256} className="object-cover w-full" />
            </div>
          ) : null}
        </section>
      )}

      {/* ── Smart PPT ── */}
      {(course.smartPpts?.length ?? 0) > 0 && (
        <section id="smartppt" className="mb-10 scroll-mt-20">
          <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-4">
            <span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shrink-0">
              <Play className="w-3 h-3 text-white fill-white" />
            </span>
            Smart PPT
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {course.smartPpts!.map((ppt, i) => (
              <a
                key={i}
                href={ppt.pptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {ppt.thumbnailUrl ? (
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    <img src={ppt.thumbnailUrl} alt={ppt.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <FileText className="w-10 h-10 text-gray-400" />
                  </div>
                )}
                <div className="p-2">
                  <p className="text-xs font-medium text-gray-700 line-clamp-2">{ppt.title}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── คลิปประกอบการสอน ── */}
      <div id="clips" className="scroll-mt-20">
        {(course.teachingClips?.length ?? 0) > 0 && (
          <VideoSection title="คลิปประกอบการสอน" clips={course.teachingClips!} sectionId="teachingclips" />
        )}

        {/* ── คลิปอักษรเรียนสรุป ── */}
        {(course.summaryClips?.length ?? 0) > 0 && (
          <VideoSection title="คลิปอักษรเรียนสรุป" clips={course.summaryClips!} sectionId="summaryclips" />
        )}
      </div>

      {/* ── สื่อประกอบการสอน (downloads) ── */}
      {((course.downloadFree?.length ?? 0) > 0 ||
        (course.downloadTeacherCard?.length ?? 0) > 0 ||
        (course.downloadAksorn?.length ?? 0) > 0) && (
        <section id="downloads" className="scroll-mt-20 mb-10">
          <h2 className="text-base font-bold text-gray-900 mb-4">สื่อประกอบการสอน</h2>

          {/* ดาวน์โหลดฟรี */}
          {(course.downloadFree?.length ?? 0) > 0 && (
            <DownloadGroup label="ดาวน์โหลดฟรี" items={course.downloadFree!} />
          )}

          {/* เฉพาะลูกค้าอักษร (ยื่นบัตรครู) */}
          {(course.downloadTeacherCard?.length ?? 0) > 0 && (
            <DownloadGroup label="เฉพาะลูกค้าอักษร (ยื่นบัตรครู)" items={course.downloadTeacherCard!} />
          )}

          {/* เฉพาะลูกค้าอักษร */}
          {(course.downloadAksorn?.length ?? 0) > 0 && (
            <DownloadGroup label="เฉพาะลูกค้าอักษร" items={course.downloadAksorn!} />
          )}
        </section>
      )}
    </div>
  );
}

function DownloadGroup({ label, items }: { label: string; items: { title: string; thumbnailUrl: string; fileUrl: string }[] }) {
  return (
    <div className="bg-gray-100 rounded-2xl p-5 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">[{label}]</h3>
      <div className="flex flex-wrap gap-4">
        {items.map((item, i) => (
          <a
            key={i}
            href={item.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="group flex flex-col items-center w-28"
          >
            <div className="w-24 h-28 bg-white rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center group-hover:shadow-md transition-shadow">
              {item.thumbnailUrl ? (
                <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <FileText className="w-10 h-10 text-gray-300" />
              )}
            </div>
            <p className="text-xs text-center text-gray-600 mt-1.5 font-medium leading-snug">{item.title}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
