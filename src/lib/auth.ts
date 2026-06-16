import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface JwtPayload {
  userId: string;
  email: string;
  name: string;
  role: "student" | "teacher" | "admin" | "super_admin";
  institutionId?: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

// Always reads institutionId fresh from DB to avoid stale JWT data
export async function getAuthUser(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;

  try {
    await connectDB();
    const user = await User.findById(payload.userId).select("institutionId role").lean() as {
      institutionId?: { toString(): string } | null;
      role: string;
    } | null;
    if (!user) return payload;

    return {
      ...payload,
      role: user.role as JwtPayload["role"],
      institutionId: user.institutionId?.toString() ?? undefined,
    };
  } catch {
    return payload;
  }
}
