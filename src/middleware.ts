import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

function getUser(token: string) {
  try {
    const secret = process.env.JWT_SECRET!;
    const payload = jwt.verify(token, secret) as { userId: string; email: string; name: string; role: string; institutionId?: string };
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Super admin dashboard is at /super-admin (root of route group)

  // Auth checks only needed for page routes (API routes do their own auth)
  if (!pathname.startsWith("/api/")) {
    const token = req.cookies.get("token")?.value;
    const user = token ? getUser(token) : null;

    if (user && (pathname === "/login" || pathname === "/register")) {
      if (user.role === "super_admin") return NextResponse.redirect(new URL("/super-admin", req.url));
      if (user.role === "admin") return NextResponse.redirect(new URL("/admin", req.url));
      if (user.role === "owner") return NextResponse.redirect(new URL("/admin", req.url));
      if (user.role === "teacher") return NextResponse.redirect(new URL("/teacher", req.url));
      if (user.role === "parent") return NextResponse.redirect(new URL("/parent", req.url));
      if (user.role === "student") return NextResponse.redirect(new URL("/student", req.url));
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if ((pathname.startsWith("/dashboard") || pathname.startsWith("/student")) && !user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Block super_admin from /admin/* — they have their own /super-admin/* pages
    if (pathname.startsWith("/admin") && user?.role === "super_admin") {
      return NextResponse.redirect(new URL("/super-admin", req.url));
    }

    // Admin-only pages
    if (
      pathname.startsWith("/admin") &&
      (!user || (user.role !== "admin" && user.role !== "teacher" && user.role !== "owner"))
    ) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Owner-only pages
    if (pathname.startsWith("/owner") && (!user || user.role !== "owner")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Teacher-only pages
    if (pathname.startsWith("/teacher") && (!user || user.role !== "teacher")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Parent-only pages
    if (pathname.startsWith("/parent") && (!user || user.role !== "parent")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Student-only pages
    if (pathname.startsWith("/student") && (!user || user.role !== "student")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Teacher: allowed pages
    const teacherAdminAllowed = ["/admin/schedule", "/admin/revenue", "/admin/courses", "/admin/content", "/admin/profile", "/admin/students", "/admin/attendance", "/admin/homework", "/admin/quiz", "/admin/notifications", "/admin/live", "/admin/teacher-portal", "/admin/forum"];
    if (pathname.startsWith("/admin") && user?.role === "teacher") {
      if (!teacherAdminAllowed.some((p) => pathname.startsWith(p))) {
        return NextResponse.redirect(new URL("/admin/courses", req.url));
      }
    }

    // super_admin only pages
    const superAdminOnlyPages = ["/admin/bookings", "/admin/finance", "/admin/roles"];
    if (superAdminOnlyPages.some((p) => pathname.startsWith(p)) && user?.role !== "super_admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    if ((pathname === "/super-admin" || pathname.startsWith("/super-admin/")) && (!user || user.role !== "super_admin")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/dashboard/:path*", "/student/:path*", "/admin/:path*", "/owner/:path*", "/teacher/:path*", "/parent/:path*", "/super-admin/:path*", "/api/:path*"],
};

export const runtime = "nodejs";
