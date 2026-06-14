import { connectDB } from "./mongodb";
import Institution from "@/models/Institution";

const slugCache = new Map<string, { id: string; expiresAt: number }>();

export function getTenantSlug(req: Request): string {
  return req.headers.get("x-tenant-slug") ?? "default";
}

export async function getTenantId(req: Request): Promise<string | null> {
  const slug = getTenantSlug(req);

  const hit = slugCache.get(slug);
  if (hit && hit.expiresAt > Date.now()) return hit.id;

  await connectDB();
  const inst = (await Institution.findOne({ slug, isActive: true })
    .select("_id")
    .lean()) as { _id: { toString(): string } } | null;
  if (!inst) return null;

  const id = inst._id.toString();
  slugCache.set(slug, { id, expiresAt: Date.now() + 60_000 });
  return id;
}

// Use auth.institutionId if present (new tokens), otherwise resolve from header
export async function resolveInstitutionId(
  req: Request,
  authInstitutionId?: string | null
): Promise<string | null> {
  if (authInstitutionId) return authInstitutionId;
  return getTenantId(req);
}

// Build a query filter — only adds institutionId if it's set, so pre-migration data still works
export function tenantFilter(institutionId: string | null | undefined): Record<string, unknown> {
  return institutionId ? { institutionId } : {};
}
