import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { ICourse, ISession } from "@/types";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  // Admin can view any student's schedule via ?userId=xxx
  const queryUserId = req.nextUrl.searchParams.get("userId");
  const targetUserId =
    auth.role === "admin" && queryUserId ? queryUserId : auth.userId;

  const bookings = await Booking.find({ userId: targetUserId, status: "confirmed" })
    .populate("courseId")
    .lean();

  const events = bookings
    .filter((b) => b.courseId && typeof b.courseId === "object")
    .map((b) => {
      const course = b.courseId as unknown as ICourse;
      const session = course.sessions?.find((s: ISession) => s._id?.toString() === b.sessionId?.toString());
      if (!session) return null;
      const bookingId = (b._id as { toString(): string }).toString();
      return {
        bookingId,
        courseId: course._id.toString(),
        courseTitle: course.title,
        coverImage: course.coverImage ?? "",
        date: new Date(session.date).toISOString().slice(0, 10),
        startTime: session.startTime,
        endTime: session.endTime,
        zoomLink: session.zoomLink ?? "",
      };
    })
    .filter(Boolean)
    .sort((a, b) => a!.date.localeCompare(b!.date));

  return NextResponse.json({ events });
}
