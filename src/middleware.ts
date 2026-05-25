import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

async function getUser(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const user = token ? await getUser(token) : null;

  // Redirect logged-in users away from auth pages
  if (user && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL(user.role === "admin" ? "/admin" : "/dashboard", req.url));
  }

  // Protect /teacher — teacher and admin only
  if (pathname.startsWith("/teacher") && (!user || (user.role !== "teacher" && user.role !== "admin"))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Protect /dashboard
  if (pathname.startsWith("/dashboard") && !user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Protect /admin — admin only
  if (pathname.startsWith("/admin") && (!user || user.role !== "admin")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/dashboard/:path*", "/admin/:path*"],
};
