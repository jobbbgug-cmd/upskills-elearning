import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { signToken } from "@/lib/auth";
import User from "@/models/User";
import { logActivity, ACTION } from "@/lib/activityLog";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "กรุณากรอกอีเมลและรหัสผ่าน" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }

    if (user.status === "pending") {
      return NextResponse.json({ error: "บัญชีของคุณรอการอนุมัติจาก Admin กรุณารอการติดต่อกลับ" }, { status: 403 });
    }
    if (user.status === "rejected") {
      return NextResponse.json({ error: "บัญชีของคุณถูกปฏิเสธ กรุณาติดต่อ Admin" }, { status: 403 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }

    const institutionId = user.institutionId?.toString() ?? undefined;

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role as import("@/lib/auth").JwtPayload["role"],
      institutionId,
    });

    const res = NextResponse.json({
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, gradeLevel: user.gradeLevel },
    });
    res.cookies.set("token", token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: "/" });

    if (["admin", "owner", "super_admin"].includes(user.role)) {
      void logActivity({
        userId:        user._id.toString(),
        userName:      user.name,
        userEmail:     user.email,
        userRole:      user.role,
        institutionId: user.institutionId?.toString(),
        action:        ACTION.LOGIN,
        description:   `เข้าสู่ระบบ`,
        ipAddress:     req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined,
      });
    }

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
