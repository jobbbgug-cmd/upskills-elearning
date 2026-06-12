import Booking from "@/models/Booking";
import Course from "@/models/Course";

/**
 * Cancel bookings that have expired (no slip uploaded within the time limit).
 * Releases seats back to the session.
 * Safe to call on every page load — only affects expired records.
 */
export async function cleanupExpiredBookings(courseId: string) {
  const now = new Date();

  const expired = await Booking.find({
    courseId,
    status: "pending_payment",
    slipImage: { $in: ["", null] },
    expiresAt: { $ne: null, $lt: now },
  });

  if (expired.length === 0) return;

  const course = await Course.findById(courseId);

  for (const booking of expired) {
    booking.status = "cancelled";
    await booking.save();

    if (course) {
      const session = course.sessions.id(booking.sessionId.toString());
      if (session && booking.seatNumber) {
        session.bookedSeats = (session.bookedSeats ?? []).filter(
          (s: number) => s !== booking.seatNumber
        );
        session.bookedCount = session.bookedSeats.length;
      }
    }
  }

  if (course) await course.save();
}
