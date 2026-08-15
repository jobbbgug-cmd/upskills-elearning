'use client';

import Link from 'next/link';

export default function BuyCourseButton({ courseId }: { courseId: string }) {
  return (
    <Link
      href={`/checkout/courses/${courseId}`}
      className="w-full bg-purple-600 text-white font-semibold py-3 rounded-xl hover:bg-purple-700 transition-colors block text-center"
    >
      ซื้อคอร์สนี้
    </Link>
  );
}
