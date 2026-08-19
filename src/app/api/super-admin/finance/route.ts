import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Course from "@/models/Course";
import Payout from "@/models/Payout";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const [bookings, payouts, courses] = await Promise.all([
      Booking.find({}),
      Payout.find({}),
      Course.find({}),
    ]);

    const finances: any[] = [];

    // Add income from confirmed bookings
    bookings.forEach((booking: any) => {
      if (booking.status === "confirmed") {
        const course = courses.find((c: any) => c._id?.toString() === booking.courseId?.toString());
        finances.push({
          _id: `income-${booking._id}`,
          category: "ค่าเรียน",
          amount: course?.price || 0,
          date: booking.createdAt || new Date(),
          type: "income",
          description: `การจองคอร์ส: ${course?.title || "Unknown"}`,
        });
      }
    });

    // Add expenses from payouts
    payouts.forEach((payout: any) => {
      finances.push({
        _id: payout._id,
        category: "การเบิกเงิน",
        amount: payout.amount || 0,
        date: payout.createdAt || new Date(),
        type: "expense",
        description: `เบิกเงินให้สถาบัน`,
      });
    });

    // Sort by date descending
    finances.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(finances);
  } catch (error) {
    console.error("[finance] Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}
