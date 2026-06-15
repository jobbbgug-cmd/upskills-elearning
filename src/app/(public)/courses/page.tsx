import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import Institution from "@/models/Institution";
import CourseCard from "@/components/CourseCard";
import { getAuthUser } from "@/lib/auth";
import { ICourse, GradeLevel } from "@/types";
import { BookOpen } from "lucide-react";
import Link from "next/link";

const GRADE_GROUPS = [
  { label: "ประถม", grades: ["ป.1", "ป.2", "ป.3", "ป.4", "ป.5", "ป.6"] as GradeLevel[] },
  { label: "มัธยมต้น", grades: ["ม.1", "ม.2", "ม.3"] as GradeLevel[] },
  { label: "มัธยมปลาย", grades: ["ม.4", "ม.5", "ม.6"] as GradeLevel[] },
  { label: "อาชีวะ/ม.เปิด", grades: ["ปวช.", "ปวส.", "มหาวิทยาลัย", "ทั่วไป"] as GradeLevel[] },
];

const ALL_GRADE_LEVELS: GradeLevel[] = GRADE_GROUPS.flatMap((g) => g.grades);

interface IInstitutionItem {
  _id: string;
  name: string;
}

async function getInstitutions(): Promise<IInstitutionItem[]> {
  await connectDB();
  const insts = await Institution.find({ isActive: true }).select("_id name").sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(insts)) as IInstitutionItem[];
}

async function getCourses(institutionId?: string, gradeGroup?: string, gradeLevel?: string, category?: string) {
  await connectDB();
  const query: Record<string, unknown> = { isActive: true };

  if (institutionId) query.institutionId = institutionId;

  if (gradeLevel) {
    query.gradeLevels = gradeLevel;
  } else if (gradeGroup) {
    const group = GRADE_GROUPS.find((g) => g.label === gradeGroup);
    if (group) query.gradeLevels = { $in: group.grades };
  }

  if (category) query.category = category;

  const courses = await Course.find(query).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(courses)) as ICourse[];
}

async function getCategories(institutionId?: string) {
  await connectDB();
  const filter: Record<string, unknown> = { isActive: true };
  if (institutionId) filter.institutionId = institutionId;
  const categories = await Course.distinct("category", filter);
  return categories as string[];
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ gradeLevel?: string; gradeGroup?: string; category?: string; institution?: string }>;
}) {
  const { gradeLevel, gradeGroup, category, institution } = await searchParams;

  const [auth, institutions] = await Promise.all([getAuthUser(), getInstitutions()]);

  // If user has an institutionId and no ?institution= in URL, default to theirs
  const defaultInstitution = auth?.institutionId ?? undefined;
  const activeInstitutionId = institution !== undefined ? institution || undefined : defaultInstitution;

  const [courses, categories] = await Promise.all([
    getCourses(activeInstitutionId, gradeGroup, gradeLevel, category),
    getCategories(activeInstitutionId),
  ]);

  const activeGroup = gradeGroup
    ? GRADE_GROUPS.find((g) => g.label === gradeGroup)
    : gradeLevel
    ? GRADE_GROUPS.find((g) => g.grades.includes(gradeLevel as GradeLevel))
    : null;

  const visibleGrades = activeGroup ? activeGroup.grades : ALL_GRADE_LEVELS;

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged: Record<string, string | undefined> = {
      institution: activeInstitutionId,
      gradeGroup,
      gradeLevel,
      category,
      ...overrides,
    };
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v); });
    const qs = params.toString();
    return `/courses${qs ? `?${qs}` : ""}`;
  };

  const activeInstitution = institutions.find((i) => i._id === activeInstitutionId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">คอร์สทั้งหมด</h1>
        <p className="text-gray-500 text-sm">เลือกระดับชั้นหรือหมวดหมู่เพื่อกรองคอร์สที่เหมาะกับคุณ</p>
      </div>

      {/* Institution tabs — only show when there are multiple institutions */}
      {institutions.length > 1 && (
        <div className="mb-5 -mx-4 px-4 overflow-x-auto">
          <div className="flex gap-2 pb-2" style={{ minWidth: "max-content" }}>
            <Link
              href={buildUrl({ institution: "" })}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
                !activeInstitutionId
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300"
              }`}
            >
              ทุกสถาบัน
            </Link>
            {institutions.map((inst) => (
              <Link
                key={inst._id}
                href={buildUrl({ institution: inst._id })}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
                  activeInstitutionId === inst._id
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300"
                }`}
              >
                {inst.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mobile filter chips */}
      <div className="lg:hidden mb-5 -mx-4 px-4 overflow-x-auto">
        <div className="flex gap-2 pb-2" style={{ minWidth: "max-content" }}>
          <Link href={buildUrl({ gradeGroup: undefined, gradeLevel: undefined, category: undefined })}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${!gradeLevel && !gradeGroup && !category ? "bg-indigo-600 text-white border-indigo-600" : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300"}`}>
            ทั้งหมด
          </Link>
          {activeGroup ? (
            <>
              <Link href={buildUrl({ gradeGroup: undefined, gradeLevel: undefined })} className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border bg-white border-gray-200 text-gray-500 hover:border-indigo-300">
                ← กลับ
              </Link>
              <Link href={buildUrl({ gradeGroup: activeGroup.label, gradeLevel: undefined })}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${gradeGroup && !gradeLevel ? "bg-indigo-600 text-white border-indigo-600" : "bg-white border-gray-200 text-gray-700 hover:border-indigo-300"}`}>
                {activeGroup.label} (ทั้งหมด)
              </Link>
              {visibleGrades.map((g) => (
                <Link key={g} href={buildUrl({ gradeGroup: activeGroup.label, gradeLevel: g })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${gradeLevel === g ? "bg-indigo-600 text-white border-indigo-600" : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300"}`}>
                  {g}
                </Link>
              ))}
            </>
          ) : (
            GRADE_GROUPS.map((group) => (
              <Link key={group.label} href={buildUrl({ gradeGroup: group.label })}
                className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border bg-white border-gray-200 text-gray-600 hover:border-indigo-300 transition-colors">
                {group.label}
              </Link>
            ))
          )}
          {categories.map((cat) => (
            <Link key={cat}
              href={buildUrl({ category: cat })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${category === cat ? "bg-purple-600 text-white border-purple-600" : "bg-white border-gray-200 text-gray-600 hover:border-purple-300"}`}>
              {cat}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar — desktop only */}
        <aside className="hidden lg:block lg:w-56 shrink-0">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 sticky top-20">
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">ระดับชั้น</h3>
              <div className="space-y-1">
                <Link
                  href={buildUrl({ gradeGroup: undefined, gradeLevel: undefined })}
                  className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${!gradeLevel && !gradeGroup ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  ทั้งหมด
                </Link>
                {activeGroup ? (
                  <>
                    <Link href={buildUrl({ gradeGroup: undefined, gradeLevel: undefined })} className="block px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:bg-gray-50 transition-colors">
                      ← กลับ
                    </Link>
                    <Link
                      href={buildUrl({ gradeGroup: activeGroup.label, gradeLevel: undefined })}
                      className={`block px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${gradeGroup && !gradeLevel ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                      {activeGroup.label} (ทั้งหมด)
                    </Link>
                    {visibleGrades.map((g) => (
                      <Link key={g} href={buildUrl({ gradeGroup: activeGroup.label, gradeLevel: g })}
                        className={`block px-3 py-1.5 rounded-lg text-sm transition-colors pl-5 ${gradeLevel === g ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                      >
                        {g}
                      </Link>
                    ))}
                  </>
                ) : (
                  GRADE_GROUPS.map((group) => (
                    <Link key={group.label} href={buildUrl({ gradeGroup: group.label })}
                      className="block px-3 py-1.5 rounded-lg text-sm transition-colors text-gray-600 hover:bg-gray-50"
                    >
                      {group.label}
                    </Link>
                  ))
                )}
              </div>
            </div>

            {categories.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">หมวดหมู่</h3>
                <div className="space-y-1">
                  <Link href={buildUrl({ category: undefined })}
                    className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${!category ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    ทั้งหมด
                  </Link>
                  {categories.map((cat) => (
                    <Link key={cat} href={buildUrl({ category: cat })}
                      className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${category === cat ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Course Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-500">
              {activeInstitution && (
                <span className="font-medium text-indigo-600 mr-2">{activeInstitution.name}</span>
              )}
              {activeGroup && (
                <span className="font-medium text-indigo-600 mr-2">
                  {gradeLevel ? gradeLevel : activeGroup.label}
                </span>
              )}
              พบ {courses.length} คอร์ส
            </p>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>ไม่พบคอร์สที่ตรงกัน</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
