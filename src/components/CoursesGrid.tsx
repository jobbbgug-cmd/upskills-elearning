"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import CourseCard from "@/components/CourseCard";
import RegisterModal from "@/components/RegisterModal";
import { ICourse } from "@/types";

interface Props {
  courses: ICourse[];
  isLoggedIn: boolean;
  defaultInstitutionId?: string;
}

export default function CoursesGrid({ courses, isLoggedIn, defaultInstitutionId }: Props) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleCardClick = (courseId: string) => (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      setShowModal(true);
    } else {
      router.push(`/courses/${courseId}`);
    }
  };

  if (courses.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>ไม่พบคอร์สที่ตรงกัน</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {courses.map((course) => (
          <CourseCard
            key={course._id}
            course={course}
            onClickOverride={!isLoggedIn ? handleCardClick(course._id) : undefined}
          />
        ))}
      </div>

      {showModal && (
        <RegisterModal
          defaultInstitutionId={defaultInstitutionId}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
