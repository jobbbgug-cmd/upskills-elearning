import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId } from "@/lib/tenant";
import User from "@/models/User";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await getAuthUser();
    if (!auth || !["admin", "owner", "super_admin"].includes(auth.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);
    const { name, email, role, password, gradeLevel, profileImage, studentId, studentName } = await req.json();

    const user = await User.findById(params.id);
    if (!user) return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });

    // Verify user belongs to same institution
    if (institutionId && user.institutionId?.toString() !== institutionId.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updates: Record<string, any> = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (gradeLevel !== undefined) updates.gradeLevel = gradeLevel;
    if (profileImage !== undefined) updates.profileImage = profileImage;
    if (password) updates.password = await bcrypt.hash(password, 10);
    if (studentId !== undefined) updates.studentId = studentId;
    if (studentName !== undefined) updates.studentName = studentName;

    const updated = await User.findByIdAndUpdate(params.id, updates, { new: true }).select("-password").lean();
    return NextResponse.json(JSON.parse(JSON.stringify(updated)));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await getAuthUser();
    if (!auth || !["admin", "owner", "super_admin"].includes(auth.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const institutionId = await resolveInstitutionId(req, auth.institutionId);

    const user = await User.findById(params.id);
    if (!user) return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });

    // Verify user belongs to same institution
    if (institutionId && user.institutionId?.toString() !== institutionId.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Prevent owner from deleting other owner
    if (auth.role === "owner" && user.role === "owner" && user._id.toString() !== auth.userId) {
      return NextResponse.json({ error: "ไม่สามารถลบ owner ได้" }, { status: 403 });
    }

    await User.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "ลบสำเร็จ" });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
