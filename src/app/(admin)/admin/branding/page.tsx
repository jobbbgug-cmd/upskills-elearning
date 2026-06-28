"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Palette, Upload, Check, Globe, CheckCircle, XCircle } from "lucide-react";
import { compressImage } from "@/lib/compressImage";
import LoadingSpinner from "@/components/LoadingSpinner";

interface BrandingForm {
  name: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  tagline: string;
  whiteLabelMode: boolean;
}

const PRESET_COLORS = [
  "#7c3aed", "#4f46e5", "#0ea5e9", "#10b981",
  "#f59e0b", "#ef4444", "#ec4899", "#6b7280",
];

export default function BrandingPage() {
  const [form, setForm] = useState<BrandingForm>({
    name: "", logoUrl: "", faviconUrl: "", primaryColor: "#7c3aed", tagline: "", whiteLabelMode: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [uploading, setUploading] = useState<"logo" | "favicon" | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/branding")
      .then((r) => r.json())
      .then((d) => {
        setForm({
          name: d.name ?? "",
          logoUrl: d.logoUrl ?? "",
          faviconUrl: d.faviconUrl ?? "",
          primaryColor: d.primaryColor ?? "#7c3aed",
          tagline: d.tagline ?? "",
          whiteLabelMode: d.whiteLabelMode ?? false,
        });
        setLoading(false);
      });
  }, []);

  const uploadImage = async (file: File, field: "logo" | "favicon") => {
    setUploading(field);
    const compressed = await compressImage(file, 512, 0.9);
    const fd = new FormData();
    fd.append("file", compressed);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    setUploading(null);
    if (res.ok) {
      const { url } = await res.json();
      setForm((f) => ({ ...f, [field === "logo" ? "logoUrl" : "faviconUrl"]: url }));
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/branding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        showToast("success", "บันทึกการตั้งค่า Branding สำเร็จ");
        window.dispatchEvent(new CustomEvent("branding-updated", { detail: { logoUrl: form.logoUrl } }));
      } else {
        showToast("error", "บันทึกไม่สำเร็จ กรุณาลองใหม่");
      }
    } catch {
      showToast("error", "เกิดข้อผิดพลาด กรุณาตรวจสอบการเชื่อมต่อ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl space-y-6">

      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-white text-sm font-medium ${
          toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
        }`}>
          {toast.type === "success"
            ? <CheckCircle className="w-5 h-5 shrink-0" />
            : <XCircle className="w-5 h-5 shrink-0" />}
          {toast.message}
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ตั้งค่า Branding</h1>
        <p className="text-gray-500 text-sm mt-1">โลโก้ สี และชื่อสถาบันที่แสดงในระบบ</p>
      </div>

      {/* Institution name & tagline */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-500" /> ข้อมูลสถาบัน
        </h2>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">ชื่อสถาบัน</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="UPSkills Academy"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">คำโปรย (Tagline)</label>
          <input
            type="text"
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="คอร์สเรียนออนไลน์คุณภาพสูง"
          />
        </div>
      </div>

      {/* Logo */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Upload className="w-4 h-4 text-indigo-500" /> โลโก้
        </h2>
        <div className="flex items-center gap-4">
          <div className="w-32 h-14 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
            {form.logoUrl ? (
              <Image src={form.logoUrl} alt="logo" width={120} height={48} className="object-contain w-full h-full" />
            ) : (
              <span className="text-xs text-gray-400">ยังไม่มีโลโก้</span>
            )}
          </div>
          <div className="flex-1">
            <input ref={logoRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], "logo")} />
            <button onClick={() => logoRef.current?.click()} disabled={uploading === "logo"}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
              <Upload className="w-4 h-4" />
              {uploading === "logo" ? "กำลังอัปโหลด..." : "อัปโหลดโลโก้"}
            </button>
            <p className="text-xs text-gray-400 mt-1.5">PNG, SVG · แนะนำขนาด <span className="font-medium text-gray-500">1000 × 242 px</span> · พื้นหลังโปร่งใส · แสดงใน Navbar</p>
          </div>
        </div>
        {form.logoUrl && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">URL โลโก้</label>
            <input type="text" value={form.logoUrl} readOnly
              className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500" />
          </div>
        )}
      </div>


      {/* Primary color */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Palette className="w-4 h-4 text-indigo-500" /> สีหลัก (Primary Color)
        </h2>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setForm({ ...form, primaryColor: c })}
              style={{ backgroundColor: c }}
              className={`w-9 h-9 rounded-full transition-transform hover:scale-110 ${
                form.primaryColor === c ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""
              }`}
            />
          ))}
          <input
            type="color"
            value={form.primaryColor}
            onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
            className="w-9 h-9 rounded-full cursor-pointer border border-gray-200"
            title="เลือกสีเอง"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: form.primaryColor }} />
          <span className="text-sm font-mono text-gray-600">{form.primaryColor}</span>
          <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: form.primaryColor + "33" }}>
            <div className="h-2 rounded-full w-2/3" style={{ backgroundColor: form.primaryColor }} />
          </div>
        </div>
      </div>

      {/* White-label */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium text-gray-900 text-sm">White-Label Mode</p>
            <p className="text-xs text-gray-400 mt-0.5">ซ่อน "Powered by UPSkills" ในทุกหน้า</p>
          </div>
          <button
            onClick={() => setForm({ ...form, whiteLabelMode: !form.whiteLabelMode })}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              form.whiteLabelMode ? "bg-indigo-600" : "bg-gray-200"
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              form.whiteLabelMode ? "translate-x-5" : ""
            }`} />
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gray-900 rounded-2xl p-5">
        <p className="text-xs text-gray-400 mb-3">Preview — Navbar</p>
        <div className="flex items-center gap-3">
          {form.logoUrl ? (
            <Image src={form.logoUrl} alt="preview" width={100} height={34} className="object-contain brightness-0 invert h-8 w-auto" />
          ) : (
            <span className="text-white font-bold text-lg">{form.name || "ชื่อสถาบัน"}</span>
          )}
          {!form.whiteLabelMode && (
            <span className="text-gray-500 text-xs">· Powered by UPSkills</span>
          )}
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50"
        style={{ backgroundColor: form.primaryColor }}
      >
        {saved ? <><Check className="w-4 h-4" /> บันทึกแล้ว</> : saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
      </button>
    </div>
  );
}
