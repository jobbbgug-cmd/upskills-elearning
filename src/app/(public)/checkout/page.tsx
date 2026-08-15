import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Course from '@/models/Course';
import { ICourse } from '@/types';

async function getCheckoutCourse(courseId: string): Promise<ICourse | null> {
  try {
    await connectDB();
    const course = await Course.findById(courseId).lean();
    return course ? JSON.parse(JSON.stringify(course)) : null;
  } catch {
    return null;
  }
}

export const metadata = {
  title: 'Checkout',
  description: 'Complete your course purchase',
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string }>;
}) {
  const params = await searchParams;
  const courseId = params.courseId;

  if (!courseId) {
    redirect('/');
  }

  const course = await getCheckoutCourse(courseId);

  if (!course) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">ชำระเงิน</h1>

          {/* Course Summary */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">สรุปคอร์ส</h2>
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-lg text-gray-900 font-semibold">{course.title}</p>
                <p className="text-gray-600">โดย {course.instructor}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-red-600">฿{course.price.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">วิธีการชำระเงิน</h2>
            <div className="space-y-3">
              <label className="flex items-center p-4 border-2 border-purple-600 rounded-xl cursor-pointer">
                <input type="radio" name="payment" defaultChecked className="w-4 h-4" />
                <span className="ml-3 text-gray-900 font-medium">โอนเงินธนาคาร</span>
              </label>
              <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-gray-300">
                <input type="radio" name="payment" className="w-4 h-4" />
                <span className="ml-3 text-gray-900 font-medium">บัตรเครดิต/เดบิต</span>
              </label>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <button className="w-full bg-purple-600 text-white font-semibold py-3 rounded-xl hover:bg-purple-700 transition-colors">
              ยืนยันการชำระเงิน
            </button>
            <a href={`/courses/${courseId}`} className="w-full border-2 border-gray-300 text-gray-900 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors block text-center">
              ยกเลิก
            </a>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 text-center text-gray-600">
          <p>หากมีปัญหาในการชำระเงิน โปรดติดต่อทีมสนับสนุน</p>
        </div>
      </div>
    </div>
  );
}
