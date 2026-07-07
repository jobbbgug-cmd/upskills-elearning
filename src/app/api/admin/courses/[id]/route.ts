import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    const course = await Course.findByIdAndUpdate(
      params.id,
      { ...body, institutionId: auth.institutionId },
      { new: true }
    );

    if (!course) {
      return Response.json({ error: "Course not found" }, { status: 404 });
    }

    return Response.json(course);
  } catch (err: any) {
    console.error(err);
    return Response.json(
      { error: err.message || "Failed to update course" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const course = await Course.findByIdAndDelete(params.id);

    if (!course) {
      return Response.json({ error: "Course not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to delete course" }, { status: 500 });
  }
}
