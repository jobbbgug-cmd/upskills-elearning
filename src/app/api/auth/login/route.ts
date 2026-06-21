import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { signToken } from "@/lib/auth";
import User from "@/models/User";

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

    const isOwner = user.role === "owner";
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: isOwner ? "admin" : (user.role as import("@/lib/auth").JwtPayload["role"]),
      institutionId,
      isOwner,
    });

    const res = NextResponse.json({
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, gradeLevel: user.gradeLevel },
    });
    res.cookies.set("token", token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: "/" });
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
