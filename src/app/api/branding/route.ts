import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Institution from "@/models/Institution";

const DEFAULT_BRANDING = {
  name: "UPSkills",
  logoUrl: "",
  faviconUrl: "",
  primaryColor: "#7c3aed",
  tagline: "คอร์สเรียนออนไลน์",
  whiteLabelMode: false,
  isDefault: true,
};

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const institutionId = searchParams.get("institutionId");
    if (!institutionId) return NextResponse.json(DEFAULT_BRANDING);

    const inst = await Institution.findById(institutionId)
      .select("name logoUrl faviconUrl primaryColor tagline whiteLabelMode")
      .lean() as {
        name: string;
        logoUrl: string;
        faviconUrl: string;
        primaryColor: string;
        tagline: string;
        whiteLabelMode: boolean;
      } | null;

    if (!inst) return NextResponse.json(DEFAULT_BRANDING);

    return NextResponse.json({
      name: inst.name,
      logoUrl: inst.logoUrl || "",
      faviconUrl: inst.faviconUrl || "",
      primaryColor: inst.primaryColor || "#7c3aed",
      tagline: inst.tagline || "",
      whiteLabelMode: inst.whiteLabelMode ?? false,
      isDefault: false,
    });
  } catch {
    return NextResponse.json(DEFAULT_BRANDING);
  }
}
