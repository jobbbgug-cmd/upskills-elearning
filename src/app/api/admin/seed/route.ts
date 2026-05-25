import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Course from "@/models/Course";

export async function POST() {
  try {
    await connectDB();

    // Patch all users without status to approved
    await User.updateMany({ status: { $exists: false } }, { $set: { status: "approved" } });
    await User.updateMany({ role: "admin", status: "pending" }, { $set: { status: "approved" } });

    // Create admin user
    const existing = await User.findOne({ email: "admin@elearning.com" });
    if (!existing) {
      const hashed = await bcrypt.hash("admin1234", 10);
      await User.create({
        name: "ผู้ดูแลระบบ",
        email: "admin@elearning.com",
        password: hashed,
        role: "admin",
        status: "approved",
      });
    }

    // Create sample courses
    const count = await Course.countDocuments();
    if (count === 0) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      await Course.insertMany([
        {
          title: "คณิตศาสตร์พื้นฐาน ม.1",
          description: "เรียนรู้คณิตศาสตร์พื้นฐานสำหรับนักเรียนชั้น ม.1 ครอบคลุมเนื้อหาตามหลักสูตร",
          coverImage: "",
          gradeLevels: ["ม.1"],
          instructor: "อาจารย์สมชาย ใจดี",
          category: "คณิตศาสตร์",
          price: 299,
          sessions: [
            { date: tomorrow, startTime: "09:00", endTime: "11:00", maxCapacity: 10, bookedCount: 3, zoomLink: "https://zoom.us/j/example1" },
            { date: nextWeek, startTime: "13:00", endTime: "15:00", maxCapacity: 10, bookedCount: 7, zoomLink: "https://zoom.us/j/example2" },
          ],
        },
        {
          title: "ภาษาอังกฤษสื่อสาร ม.2-3",
          description: "พัฒนาทักษะภาษาอังกฤษเพื่อการสื่อสารในชีวิตประจำวัน เน้นการพูดและฟัง",
          coverImage: "",
          gradeLevels: ["ม.2", "ม.3"],
          instructor: "อาจารย์นิดา วงค์",
          category: "ภาษาต่างประเทศ",
          price: 399,
          sessions: [
            { date: tomorrow, startTime: "10:00", endTime: "12:00", maxCapacity: 10, bookedCount: 10, zoomLink: "https://zoom.us/j/example3" },
            { date: nextWeek, startTime: "14:00", endTime: "16:00", maxCapacity: 10, bookedCount: 2, zoomLink: "https://zoom.us/j/example4" },
          ],
        },
        {
          title: "วิทยาศาสตร์ ป.5-6",
          description: "สนุกกับการเรียนวิทยาศาสตร์ผ่านการทดลองและกิจกรรมที่น่าสนใจ",
          coverImage: "",
          gradeLevels: ["ป.5", "ป.6"],
          instructor: "อาจารย์มานี รักเรียน",
          category: "วิทยาศาสตร์",
          price: 249,
          sessions: [
            { date: tomorrow, startTime: "15:00", endTime: "17:00", maxCapacity: 10, bookedCount: 5, zoomLink: "https://zoom.us/j/example5" },
          ],
        },
      ]);
    }

    return NextResponse.json({ message: "Seed สำเร็จ! admin@elearning.com / admin1234" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
