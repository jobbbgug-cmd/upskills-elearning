import { cookies } from "next/headers";
import { verifyToken } from "./auth";

// tenantFilter — only adds institutionId when set, so unassigned records still match
export function tenantFilter(institutionId: string | null | undefined): Record<string, unknown> {
  return institutionId ? { institutionId } : {};
}

// Resolves institutionId: super_admin can pass ?institutionId= query param to filter by institution.
// Owner can switch branches via activeBranchId cookie.
// Regular admin always uses their own institutionId from auth token.
export async function resolveInstitutionId(
  req: unknown,
  authInstitutionId?: string | null
): Promise<string | null> {
  if (req && typeof req === "object" && "nextUrl" in req) {
    const nextReq = req as { nextUrl: URL };
    const qpId = nextReq.nextUrl.searchParams.get("institutionId");
    if (qpId && qpId !== "all") return qpId;
  }

  // Owner branch switching via cookie
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const payload = token ? verifyToken(token) : null;
    if (payload?.role === "owner") {
      const activeBranchId = cookieStore.get("activeBranchId")?.value;
      if (activeBranchId) return activeBranchId;
    }
  } catch {
    // cookies() may throw outside of request context
  }

  return authInstitutionId ?? null;
}
