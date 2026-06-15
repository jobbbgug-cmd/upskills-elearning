// tenantFilter — only adds institutionId when set, so unassigned records still match
export function tenantFilter(institutionId: string | null | undefined): Record<string, unknown> {
  return institutionId ? { institutionId } : {};
}

// Resolves institutionId: super_admin can pass ?institutionId= query param to filter by institution
// For regular admin, always uses their own institutionId from auth token
export async function resolveInstitutionId(
  req: unknown,
  authInstitutionId?: string | null
): Promise<string | null> {
  // If there's a request object with a URL, try to extract institutionId from query param
  if (req && typeof req === "object" && "nextUrl" in req) {
    const nextReq = req as { nextUrl: URL };
    const qpId = nextReq.nextUrl.searchParams.get("institutionId");
    if (qpId && qpId !== "all") return qpId;
  }
  return authInstitutionId ?? null;
}
