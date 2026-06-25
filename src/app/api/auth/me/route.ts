import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const user = await User.findById(auth.userId).select("-password").populate("institutionId", "name");
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const auth = await getAuthUser();
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
