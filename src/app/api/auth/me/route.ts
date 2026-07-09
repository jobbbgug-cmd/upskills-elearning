import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Institution from "@/models/Institution";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const user = await User.findById(payload.userId).select("-password").populate("institutionId", "name").lean();
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const auth = verifyToken(token);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { name, profileImage } = await req.json();

  const update: Record<string, string> = {};
  if (name?.trim()) update.name = name.trim();
  if (profileImage !== undefined) update.profileImage = profileImage;

  const user = await User.findByIdAndUpdate(auth.userId, update, { new: true }).select("-password");
  return NextResponse.json({ user });
}

export async function DELETE() {
  const res = NextResponse.json({ message: "Logged out" });
  res.cookies.set("token", "", { maxAge: 0, path: "/" });
  res.cookies.set("activeBranchId", "", { maxAge: 0, path: "/" });
  return res;
}
