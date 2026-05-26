import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

async function getUser(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: string; email: string; name: string; role: string };
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
    const dest = user.role === "admin" || user.role === "teacher" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  // Protect /dashboard
  if (pathname.startsWith("/dashboard") && !user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Protect /admin — admin or teacher only
  if (pathname.startsWith("/admin") && (!user || (user.role !== "admin" && user.role !== "teacher"))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/dashboard/:path*", "/admin/:path*"],
};
