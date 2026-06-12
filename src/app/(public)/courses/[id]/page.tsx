import { notFound } from "next/navigation";
import Image from "next/image";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import CourseContent from "@/models/CourseContent";
import { ICourse, ICourseContent } from "@/types";
import { getAuthUser } from "@/lib/auth";
import Booking from "@/models/Booking";
import { cleanupExpiredBookings } from "@/lib/cleanupExpiredBookings";
import Badge from "@/components/ui/Badge";
import CourseBooking from "./CourseBooking";
import VideoPlayerSection from "@/components/VideoPlayerSection";
import {
  BookOpen, Users, Calendar, Clock, Video,
  FileText, Play, Download, Lock,
} from "lucide-react";

async function getCourseWithContent(id: string): Promise<{ course: ICourse; content: ICourseContent | null } | null> {
  await connectDB();
  try {
    const raw = await Course.findById(id).lean();
    if (!raw) return null;
    const course = JSON.parse(JSON.stringify(raw)) as ICourse;

    let content: ICourseContent | null = null;
    if (course.contentId) {
      const rawContent = await CourseContent.findById(course.contentId).lean();
      if (rawContent) content = JSON.parse(JSON.stringify(rawContent)) as ICourseContent;
    }
    return { course, content };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getCourseWithContent(id);
  if (!result) return {};
  const { course } = result;
  return {
    title: course.title,
    description: course.description || `คอร์ส ${course.title} สอนโดย ${course.instructor}`,
    openGraph: {
      title: course.title,
      description: course.description || `คอร์ส ${course.title} สอนโดย ${course.instructor}`,
      images: course.coverImage ? [{ url: course.coverImage }] : [],
    },
  };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getCourseWithContent(id);
  if (!result) notFound();

  const { course, content } = result;
  const auth = await getAuthUser();

  await connectDB();

  // Auto-cancel expired holds before building the seat map
  await cleanupExpiredBookings(id);

  const allBookings = await Booking.find({
    courseId: id,
    status: { $in: ["pending_payment", "confirmed"] },
  }).lean();

  const sessionSeatsMap: Record<string, number[]> = {};
  allBookings.forEach((b) => {
    const sid = b.sessionId.toString();
    if (!sessionSeatsMap[sid]) sessionSeatsMap[sid] = [];
    if (b.seatNumber) sessionSeatsMap[sid].push(b.seatNumber as number);
  });

  course.sessions = course.sessions.map((s) => ({
    ...s,
    bookedSeats: sessionSeatsMap[s._id] ?? s.bookedSeats ?? [],
    bookedCount: (sessionSeatsMap[s._id] ?? s.bookedSeats ?? []).length,
  }));

  interface MyBookingInfo { bookingId: string; seatNumber: number; status: string; slipImage: string; expiresAt: string | null; }
  const myBookings: Record<string, MyBookingInfo> = {};
  if (auth) {
    const myRecs = await Booking.find({
      userId: auth.userId,
      courseId: id,
      status: { $in: ["pending_payment", "confirmed", "rejected"] },
    }).lean();
    myRecs.forEach((b) => {
      myBookings[b.sessionId.toString()] = {
        bookingId: (b._id as { toString(): string }).toString(),
        seatNumber: b.seatNumber as number,
        status: b.status,
        slipImage: b.slipImage ?? "",
        expiresAt: b.expiresAt ? (b.expiresAt as Date).toISOString() : null,
      };
    });
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const futureSessions = course.sessions
    .filter((s) => s.date.slice(0, 10) >= todayStr)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Resolve content (contentId takes priority, fall back to course-embedded)
  const ebookCoverUrl   = content?.ebookCoverUrl   || course.coverImage       || "";
  const ebookPdfUrl     = content?.ebookPdfUrl     || course.ebookPdfUrl      || "";
  const smartPpts       = content?.smartPpts       ?? course.smartPpts        ?? [];
  const teachingClips   = content?.teachingClips   ?? course.teachingClips   ?? [];
  const summaryClips    = content?.summaryClips    ?? course.summaryClips    ?? [];
  const downloadFree    = content?.downloadFree    ?? course.downloadFree    ?? [];
  const downloadTeacherCard = content?.downloadTeacherCard ?? course.downloadTeacherCard ?? [];
  const downloadAksorn  = content?.downloadAksorn  ?? course.downloadAksorn  ?? [];

  // Access control
  const isAdminOrTeacher = auth?.role === "admin" || auth?.role === "teacher";
  const hasPaidAccess    = isAdminOrTeacher ||
    Object.values(myBookings).some((b) => b.status === "confirmed");
  const isTeacherOrAdmin = isAdminOrTeacher;

  return (
    <div className="py-10">

      {/* ── Top section: info + booking (constrained width) ── */}
      <div className="max-w-[1200px] mx-auto px-4 mb-10">

        {/* Title row — full width with shortcut buttons at far right */}
        <div className="flex items-start justify-between gap-3 mb-6">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="info">{course.category}</Badge>
              {course.gradeLevels.map((g) => <Badge key={g}>{g}</Badge>)}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{course.title}</h1>
          </div>
          <div className="flex gap-3 sm:gap-4 shrink-0">
            <a href="#clips" className="flex flex-col items-center gap-1 group">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-amber-400 group-hover:bg-amber-500 transition-colors flex items-center justify-center shadow">
                <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white" />
              </div>
              <span className="text-xs font-medium text-gray-600 text-center leading-tight">คลิป</span>
            </a>
            <a href="#downloads" className="flex flex-col items-center gap-1 group">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-amber-400 group-hover:bg-amber-500 transition-colors flex items-center justify-center shadow">
                <Download className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-600 text-center leading-tight">สื่อ<br/>ประกอบ</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Cover image */}
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl overflow-hidden">
              {course.coverImage ? (
                <Image
                  src={course.coverImage}
                  alt={course.title}
                  width={800}
                  height={600}
                  className="w-full h-auto object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-64">
                  <BookOpen className="w-20 h-20 text-indigo-300" />
                </div>
              )}
            </div>

            {/* Course info */}
            <div>
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                <Users className="w-4 h-4" />
                <span>สอนโดย {course.instructor}</span>
              </div>
              <p className="text-gray-600 leading-relaxed">{course.description}</p>
            </div>

          </div>

          {/* Right column — booking */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
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

      {/* ── รายละเอียดคอร์ส — full width ── */}
      <div className="max-w-[1200px] mx-auto px-4 mb-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">รายละเอียดคอร์ส</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
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

      {/* ── สื่อการเรียนการสอน — full width ── */}
      <div className="max-w-[1200px] mx-auto px-4 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">สื่อการเรียนการสอน</h2>

        {/* 1. e-Book */}
        <ContentSection
          icon={<BookOpen className="w-5 h-5 text-red-500" />}
          title="e-Book"
          accentColor="red"
          locked={!hasPaidAccess}
          action={hasPaidAccess && ebookPdfUrl ? (
            <a
              href={ebookPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              ดาวน์โหลดสื่อ
            </a>
          ) : undefined}
        >
          {ebookPdfUrl || ebookCoverUrl ? (
            <a
              href={ebookPdfUrl || "#"}
              target={ebookPdfUrl ? "_blank" : undefined}
              rel="noopener noreferrer"
              className={`inline-block group ${!ebookPdfUrl ? "pointer-events-none" : ""}`}
            >
              <div className="relative w-full max-w-[288px] rounded-xl overflow-hidden shadow group-hover:shadow-lg transition-shadow border border-gray-100">
                {ebookCoverUrl ? (
                  <Image src={ebookCoverUrl} alt={course.title} width={288} height={384} className="object-cover w-full" />
                ) : (
                  <div className="w-full max-w-[288px] h-96 bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                    <BookOpen className="w-20 h-20 text-red-300" />
                  </div>
                )}
                {ebookPdfUrl && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-end transition-colors">
                    <span className="w-full text-center text-xs font-semibold text-white bg-red-500/80 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      เปิดดู PDF →
                    </span>
                  </div>
                )}
              </div>
            </a>
          ) : (
            <EmptyState />
          )}
        </ContentSection>

        {/* 2. Smart PPT */}
        <ContentSection
          icon={<FileText className="w-5 h-5 text-purple-500" />}
          title="Smart PPT"
          accentColor="purple"
          locked={!hasPaidAccess}
        >
          {smartPpts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {smartPpts.map((ppt, i) => (
                <a
                  key={i}
                  href={ppt.pptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden flex items-center justify-center">
                    {ppt.thumbnailUrl ? (
                      <img src={ppt.thumbnailUrl} alt={ppt.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                    ) : (
                      <FileText className="w-10 h-10 text-purple-300" />
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-sm font-medium text-gray-700 line-clamp-2">{ppt.title}</p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </ContentSection>

        {/* 3. คลิปประกอบการสอน */}
        <div id="clips" className="scroll-mt-6">
        <ContentSection
          icon={<Play className="w-5 h-5 text-red-500" />}
          title="คลิปประกอบการสอน"
          accentColor="red"
          locked={!hasPaidAccess}
        >
          {teachingClips.length > 0 ? (
            <VideoPlayerSection title="คลิปประกอบการสอน" clips={teachingClips} accentColor="red" />
          ) : (
            <EmptyState />
          )}
        </ContentSection>
        </div>

        {/* 4. คลิปอักษรเรียนสรุป */}
        <ContentSection
          icon={<Play className="w-5 h-5 text-pink-500" />}
          title="คลิปอักษรเรียนสรุป"
          accentColor="pink"
          locked={!hasPaidAccess}
        >
          {summaryClips.length > 0 ? (
            <VideoPlayerSection title="คลิปอักษรเรียนสรุป" clips={summaryClips} accentColor="pink" />
          ) : (
            <EmptyState />
          )}
        </ContentSection>

        {/* 5. สื่อประกอบการสอน */}
        <div id="downloads" className="scroll-mt-6">
        <ContentSection
          icon={<Download className="w-5 h-5 text-amber-500" />}
          title="สื่อประกอบการสอน"
          accentColor="amber"
        >
          <div className="space-y-4">
            <DownloadSubGroup
              label="ดาวน์โหลดฟรี"
              items={downloadFree}
              variant="free"
              locked={false}
            />
            <DownloadSubGroup
              label="เฉพาะลูกค้าอักษร (ยื่นบัตรครู)"
              items={downloadTeacherCard}
              variant="teacher"
              locked={!isTeacherOrAdmin}
              lockMessage="สำหรับครูเท่านั้น — กรุณายื่นบัตรครูเพื่อรับสิทธิ์"
            />
            <DownloadSubGroup
              label="เฉพาะลูกค้าอักษร"
              items={downloadAksorn}
              variant="aksorn"
              locked={!hasPaidAccess}
            />
          </div>
        </ContentSection>
        </div>
      </div>
    </div>
  );
}

/* ── Shared UI components ── */

function EmptyState() {
  return (
    <div className="flex items-center gap-2 text-gray-400 text-sm italic py-2">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
      ยังไม่มีข้อมูล
    </div>
  );
}

function LockedOverlay({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
        <Lock className="w-7 h-7 text-gray-400" />
      </div>
      <p className="text-sm font-semibold text-gray-500">
        {message ?? "ชำระเงินเพื่อปลดล็อกเนื้อหา"}
      </p>
      <p className="text-xs text-gray-400">จองและชำระเงินให้ครบเพื่อเข้าถึงส่วนนี้</p>
    </div>
  );
}

function ContentSection({
  icon, title, accentColor, action, locked, children,
}: {
  icon: React.ReactNode;
  title: string;
  accentColor: "red" | "blue" | "purple" | "pink" | "amber";
  action?: React.ReactNode;
  locked?: boolean;
  children: React.ReactNode;
}) {
  const borderMap = {
    red: "border-red-200",
    blue: "border-blue-200",
    purple: "border-purple-200",
    pink: "border-pink-200",
    amber: "border-amber-200",
  };
  const headerMap = {
    red: "bg-red-50",
    blue: "bg-blue-50",
    purple: "bg-purple-50",
    pink: "bg-pink-50",
    amber: "bg-amber-50",
  };

  return (
    <div className={`border ${borderMap[accentColor]} rounded-2xl overflow-hidden`}>
      <div className={`${headerMap[accentColor]} px-4 py-3 flex items-center gap-2`}>
        {icon}
        <h3 className="font-semibold text-gray-900 text-sm flex-1">{title}</h3>
        {locked && <Lock className="w-4 h-4 text-gray-400" />}
        {!locked && action}
      </div>
      <div className="p-4 bg-white">
        {locked ? <LockedOverlay /> : children}
      </div>
    </div>
  );
}


function DownloadSubGroup({
  label, items, variant, locked, lockMessage,
}: {
  label: string;
  items: { title: string; thumbnailUrl: string; fileUrl: string }[];
  variant: "free" | "teacher" | "aksorn";
  locked: boolean;
  lockMessage?: string;
}) {
  const variantStyle = {
    free:    { badge: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-400" },
    teacher: { badge: "bg-blue-100 text-blue-700 border-blue-200",   dot: "bg-blue-400"  },
    aksorn:  { badge: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-400" },
  }[variant];

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full shrink-0 ${variantStyle.dot}`} />
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${variantStyle.badge}`}>
          {label}
        </span>
        {locked && <Lock className="w-3.5 h-3.5 text-gray-400" />}
      </div>

      {locked ? (
        <div className="pl-4">
          <div className="flex items-center gap-2 py-3 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-sm text-gray-500">
            <Lock className="w-4 h-4 text-gray-400 shrink-0" />
            <span>{lockMessage ?? "ชำระเงินเพื่อปลดล็อกไฟล์ในส่วนนี้"}</span>
          </div>
        </div>
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-wrap gap-4 pl-4">
          {items.map((item, i) => (
            <a
              key={i}
              href={item.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="group flex flex-col items-center w-36"
            >
              <div className="w-36 h-44 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center group-hover:shadow-md transition-shadow">
                {item.thumbnailUrl ? (
                  <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <FileText className="w-12 h-12 text-gray-300" />
                )}
              </div>
              <p className="text-sm text-center text-gray-600 mt-2 font-medium leading-snug line-clamp-2">{item.title}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
