import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import Institution from "@/models/Institution";
import User from "@/models/User";
import Course from "@/models/Course";
import Booking from "@/models/Booking";
import Banner from "@/models/Banner";
import FinanceSetting from "@/models/FinanceSetting";
import CourseContent from "@/models/CourseContent";

// POST /api/admin/migrate
// Creates the default institution and tags all existing data with its ID.
// Safe to run multiple times (idempotent).
export async function POST() {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    // Create or fetch the default institution
    let institution = await Institution.findOne({ slug: "default" });
    if (!institution) {
      institution = await Institution.create({
        slug: "default",
        name: "UPSkills",
        plan: "pro",
        isActive: true,
      });
    }
    const institutionId = institution._id;

    // Tag all documents that don't have institutionId yet
    const [users, courses, bookings, banners, finance, contents] = await Promise.all([
      User.updateMany({ institutionId: null }, { $set: { institutionId } }),
      Course.updateMany({ institutionId: null }, { $set: { institutionId } }),
      Booking.updateMany({ institutionId: null }, { $set: { institutionId } }),
      Banner.updateMany({ institutionId: null }, { $set: { institutionId } }),
      FinanceSetting.updateMany({ institutionId: null }, { $set: { institutionId } }),
      CourseContent.updateMany({ institutionId: null }, { $set: { institutionId } }),
    ]);

    return NextResponse.json({
      message: "Migration สำเร็จ",
      institutionId: institutionId.toString(),
      institutionSlug: institution.slug,
      updated: {
        users: users.modifiedCount,
        courses: courses.modifiedCount,
        bookings: bookings.modifiedCount,
        banners: banners.modifiedCount,
        finance: finance.modifiedCount,
        contents: contents.modifiedCount,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Migration ล้มเหลว" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const institutions = await Institution.find().lean();
    const [users, courses, bookings, banners] = await Promise.all([
      User.countDocuments({ institutionId: null }),
      Course.countDocuments({ institutionId: null }),
      Booking.countDocuments({ institutionId: null }),
      Banner.countDocuments({ institutionId: null }),
    ]);

    return NextResponse.json({
      institutions: institutions.length,
      untagged: { users, courses, bookings, banners },
      needsMigration: users > 0 || courses > 0 || bookings > 0 || banners > 0,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
