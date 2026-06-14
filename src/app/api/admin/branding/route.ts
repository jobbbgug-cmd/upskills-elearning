import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { resolveInstitutionId } from "@/lib/tenant";
import Institution from "@/models/Institution";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const institutionId = await resolveInstitutionId(req, auth.institutionId);
  if (!institutionId) return NextResponse.json({ error: "Institution not found" }, { status: 404 });

  const inst = await Institution.findById(institutionId)
    .select("name logoUrl faviconUrl primaryColor tagline whiteLabelMode")
    .lean();
  return NextResponse.json(inst ?? {});
}

export async function PUT(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const institutionId = await resolveInstitutionId(req, auth.institutionId);
  if (!institutionId) return NextResponse.json({ error: "Institution not found" }, { status: 404 });

  const { name, logoUrl, faviconUrl, primaryColor, tagline, whiteLabelMode } = await req.json();
  const update: Record<string, unknown> = {};
  if (name !== undefined) update.name = name;
  if (logoUrl !== undefined) update.logoUrl = logoUrl;
  if (faviconUrl !== undefined) update.faviconUrl = faviconUrl;
  if (primaryColor !== undefined) update.primaryColor = primaryColor;
  if (tagline !== undefined) update.tagline = tagline;
  if (whiteLabelMode !== undefined) update.whiteLabelMode = whiteLabelMode;

  const inst = await Institution.findByIdAndUpdate(institutionId, update, { new: true })
    .select("name logoUrl faviconUrl primaryColor tagline whiteLabelMode");
  return NextResponse.json(JSON.parse(JSON.stringify(inst)));
}
