import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: "" },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  status: { type: String, enum: ["draft", "published"], default: "draft" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

async function getCourseModel() {
  const db = await connectDB();
  if (db.models.Course) {
    return db.models.Course;
  }
  return db.model("Course", CourseSchema);
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "teacher-online" && auth.role !== "teacher_online")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, price, image } = body;

    if (!title || !description || !category || price === undefined || price === "") {
      return NextResponse.json(
        { error: "ข้อมูลไม่ครบถ้วน" },
        { status: 400 }
      );
    }

    const Course = await getCourseModel();
    const newCourse = await Course.create({
      teacherId: auth._id,
      title,
      description,
      category,
      price: Number(price),
      image: image || "",
    });

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "ไม่สามารถสร้างคอร์สได้" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || (auth.role !== "teacher-online" && auth.role !== "teacher_online")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const Course = await getCourseModel();
    const courses = await Course.find({ teacherId: auth._id }).sort({ createdAt: -1 });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "ไม่สามารถดึงข้อมูลคอร์สได้" },
      { status: 500 }
    );
  }
}
