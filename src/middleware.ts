import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

async function getUser(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: string; email: string; name: string; role: string; institutionId?: string };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Auth checks only needed for page routes (API routes do their own auth)
  if (!pathname.startsWith("/api/")) {
    const token = req.cookies.get("token")?.value;
    const user = token ? await getUser(token) : null;

    if (user && (pathname === "/login" || pathname === "/register")) {
      if (user.role === "super_admin") return NextResponse.redirect(new URL("/super-admin", req.url));
      const dest = user.role === "admin" || user.role === "teacher" || user.role === "owner" ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(dest, req.url));
    }

    if (pathname.startsWith("/dashboard") && !user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Block super_admin from /admin/* — they have their own /super-admin/* pages
    if (pathname.startsWith("/admin") && user?.role === "super_admin") {
      return NextResponse.redirect(new URL("/super-admin", req.url));
    }

    if (
      pathname.startsWith("/admin") &&
      (!user || (user.role !== "admin" && user.role !== "teacher" && user.role !== "owner"))
    ) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Teacher: allowed pages
    const teacherAdminAllowed = ["/admin/schedule", "/admin/revenue", "/admin/courses", "/admin/content", "/admin/profile"];
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

    if (pathname.startsWith("/super-admin") && (!user || user.role !== "super_admin")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/dashboard/:path*", "/admin/:path*", "/super-admin/:path*", "/api/:path*"],
};
