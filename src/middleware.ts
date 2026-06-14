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

function extractTenantSlug(req: NextRequest): string {
  const host = req.headers.get("host") ?? "";
  const hostname = host.split(":")[0]; // strip port
  const parts = hostname.split(".");
  // abc.upskills.com → ["abc","upskills","com"] → slug "abc"
  // upskills.com / localhost / *.vercel.app → "default"
  if (
    parts.length >= 3 &&
    parts[0] !== "www" &&
    !parts[0].startsWith("upskills") &&
    parts[0] !== "localhost"
  ) {
    return parts[0];
  }
  return "default";
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const tenantSlug = extractTenantSlug(req);

  // Always inject tenant slug into downstream request headers
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-tenant-slug", tenantSlug);

  // Auth checks only needed for page routes (API routes do their own auth)
  if (!pathname.startsWith("/api/")) {
    const token = req.cookies.get("token")?.value;
    const user = token ? await getUser(token) : null;

    if (user && (pathname === "/login" || pathname === "/register")) {
      if (user.role === "super_admin") return NextResponse.redirect(new URL("/super-admin", req.url));
      const dest = user.role === "admin" || user.role === "teacher" ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(dest, req.url));
    }

    if (pathname.startsWith("/dashboard") && !user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (
      pathname.startsWith("/admin") &&
      (!user || (user.role !== "admin" && user.role !== "teacher" && user.role !== "super_admin"))
    ) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Protect /super-admin — super_admin only
    if (pathname.startsWith("/super-admin") && (!user || user.role !== "super_admin")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/login", "/register", "/dashboard/:path*", "/admin/:path*", "/super-admin/:path*", "/api/:path*"],
};
