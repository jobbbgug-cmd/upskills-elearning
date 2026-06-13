"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Plus, Trash2, Upload, GripVertical, Eye, EyeOff, Monitor, Smartphone, Pencil } from "lucide-react";
import { compressImage } from "@/lib/compressImage";
import { IBanner } from "@/types";

const DEFAULT_COLORS = ["#1e1b4b", "#0f172a", "#1e3a5f", "#14532d", "#450a0a", "#1c1917"];

const EMPTY_FORM = {
  imageUrl: "",
  mobileImageUrl: "",
  title: "",
  subtitle: "",
  linkUrl: "",
  linkText: "ดูรายละเอียด",
  bgColor: "#1e1b4b",
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<IBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<"desktop" | "mobile" | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const desktopFileRef = useRef<HTMLInputElement>(null);
  const mobileFileRef  = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/banners");
    if (res.ok) setBanners(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "desktop" | "mobile") => {
    const raw = e.target.files?.[0];
    if (!raw) return;
    setUploading(target);
    const file = await compressImage(raw, 1920, 0.85);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) {
      setForm((f) => ({
        ...f,
        [target === "desktop" ? "imageUrl" : "mobileImageUrl"]: data.url,
      }));
    }
    setUploading(null);
    e.target.value = "";
  };

  const openEdit = (banner: IBanner) => {
    setForm({
      imageUrl: banner.imageUrl,
      mobileImageUrl: banner.mobileImageUrl || "",
      title: banner.title,
      subtitle: banner.subtitle,
      linkUrl: banner.linkUrl,
      linkText: banner.linkText || "ดูรายละเอียด",
      bgColor: banner.bgColor || "#1e1b4b",
    });
    setEditingId(banner._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl) return alert("กรุณาอัปโหลดรูปภาพ Desktop ก่อน");
    if (editingId) {
      const res = await fetch(`/api/admin/banners/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) { closeForm(); load(); }
    } else {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, order: banners.length }),
      });
      if (res.ok) { closeForm(); load(); }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ลบแบนเนอร์นี้?")) return;
    await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    load();
  };

  const toggleActive = async (banner: IBanner) => {
    await fetch(`/api/admin/banners/${banner._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !banner.isActive }),
    });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการแบนเนอร์</h1>
          <p className="text-gray-500 text-sm mt-1">แบนเนอร์สไลด์โชว์บนหน้าแรก</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setForm(EMPTY_FORM); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          เพิ่มแบนเนอร์
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-5">
            {editingId ? "แก้ไขแบนเนอร์" : "แบนเนอร์ใหม่"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Image uploads — side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              {/* Desktop image */}
              <div className="border border-gray-200 rounded-2xl p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <Monitor className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-semibold text-gray-700">รูป Desktop *</span>
                </div>
                <div className="flex items-start gap-3 mb-3">
                  <p className="flex-1 text-xs text-gray-500">
                    ต้องใช้รูป <span className="font-semibold text-indigo-600">แนวนอน</span> เท่านั้น — แนะนำ <span className="font-semibold text-indigo-600">1920 × 1080px</span> (16:9)<br/>
                    ⚠️ รูปแนวตั้งจะถูกซูมและตัดขอบออกอัตโนมัติ
                  </p>
                  <input ref={desktopFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "desktop")} />
                  <button
                    type="button"
                    onClick={() => desktopFileRef.current?.click()}
                    disabled={uploading === "desktop"}
                    className="shrink-0 flex items-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading === "desktop" ? "กำลังอัปโหลด..." : "อัปโหลดรูป Desktop"}
                  </button>
                </div>
                {form.imageUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <img src={form.imageUrl} alt="desktop preview" className="w-full h-auto block" />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                    >×</button>
                  </div>
                ) : (
                  <div className="flex-1 min-h-[10rem] rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <span className="text-xs text-gray-400">ยังไม่มีรูป</span>
                  </div>
                )}
              </div>

              {/* Mobile image */}
              <div className="border border-gray-200 rounded-2xl p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-semibold text-gray-700">รูป Mobile</span>
                </div>
                <div className="flex gap-4 flex-1 min-h-0">
                  {/* Image preview — left, stretches to full card height */}
                  <div className="shrink-0 w-44 flex flex-col">
                    {form.mobileImageUrl ? (
                      <div className="relative rounded-xl overflow-hidden border border-gray-200">
                        <img src={form.mobileImageUrl} alt="mobile preview" className="w-full h-auto block" />
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, mobileImageUrl: "" }))}
                          className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 z-10"
                        >×</button>
                      </div>
                    ) : (
                      <div className="flex-1 rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center text-center px-2">
                        <span className="text-[10px] text-gray-400">ยังไม่มีรูป</span>
                      </div>
                    )}
                  </div>

                  {/* Right: details top, upload button bottom */}
                  <div className="flex-1 flex flex-col justify-between gap-3">
                    <p className="text-xs text-gray-500">
                      ต้องใช้รูป <span className="font-semibold text-green-600">แนวตั้ง</span> เท่านั้น — แนะนำ <span className="font-semibold text-green-600">1080 × 1920px</span> (9:16)<br/>
                      ⚠️ รูปแนวนอนจะถูกซูมและตัดขอบออกอัตโนมัติ
                    </p>
                    <input ref={mobileFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "mobile")} />
                    <button
                      type="button"
                      onClick={() => mobileFileRef.current?.click()}
                      disabled={uploading === "mobile"}
                      className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-green-400 hover:text-green-600 transition-colors disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4" />
                      {uploading === "mobile" ? "กำลังอัปโหลด..." : "อัปโหลดรูป Mobile"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">หัวข้อ</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="เช่น คอร์สใหม่มาแล้ว!"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">คำอธิบาย</label>
                <textarea
                  rows={2}
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="รายละเอียดเพิ่มเติม..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ลิงก์ปุ่ม</label>
                <input
                  value={form.linkUrl}
                  onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                  placeholder="https://... หรือ /courses"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ข้อความปุ่ม</label>
                <input
                  value={form.linkText}
                  onChange={(e) => setForm({ ...form, linkText: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">สีพื้นหลัง</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {DEFAULT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, bgColor: c })}
                      className="w-8 h-8 rounded-lg border-2 transition-all"
                      style={{ background: c, borderColor: form.bgColor === c ? "#6366f1" : "transparent" }}
                    />
                  ))}
                  <input
                    type="color"
                    value={form.bgColor}
                    onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-gray-300"
                    title="เลือกสีเอง"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
                {editingId ? "บันทึกการแก้ไข" : "บันทึกแบนเนอร์"}
              </button>
              <button type="button" onClick={closeForm} className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors">
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Banner list */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">กำลังโหลด...</div>
      ) : banners.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400">ยังไม่มีแบนเนอร์ กด "+ เพิ่มแบนเนอร์" เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner) => (
            <div key={banner._id} className={`bg-white rounded-2xl border p-4 flex items-center gap-4 transition-opacity ${banner.isActive ? "border-gray-200" : "border-gray-100 opacity-60"}`}>
              <GripVertical className="w-5 h-5 text-gray-300 shrink-0" />

              {/* Previews */}
              <div className="flex gap-2 shrink-0">
                <div className="relative w-36 h-20 rounded-xl overflow-hidden" style={{ background: banner.bgColor }}>
                  <Image src={banner.imageUrl} alt="desktop" fill className="object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center pb-0.5">
                    <span className="text-[9px] text-white/70 bg-black/30 px-1 rounded">Desktop</span>
                  </div>
                </div>
                {banner.mobileImageUrl ? (
                  <div className="relative w-14 h-20 rounded-xl overflow-hidden" style={{ background: banner.bgColor }}>
                    <Image src={banner.mobileImageUrl} alt="mobile" fill className="object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center pb-0.5">
                      <span className="text-[9px] text-white/70 bg-black/30 px-0.5 rounded">Mobile</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-14 h-20 rounded-xl bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center">
                    <Smartphone className="w-3 h-3 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{banner.title || "(ไม่มีหัวข้อ)"}</p>
                <p className="text-sm text-gray-400 truncate mt-0.5">{banner.subtitle}</p>
                {banner.linkUrl && (
                  <p className="text-xs text-indigo-500 mt-1 truncate">{banner.linkUrl}</p>
                )}
              </div>

              {/* Mobile badge */}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${banner.mobileImageUrl ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                {banner.mobileImageUrl ? "มีรูป Mobile" : "ไม่มีรูป Mobile"}
              </span>

              {/* Status badge */}
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${banner.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {banner.isActive ? "แสดง" : "ซ่อน"}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => openEdit(banner)}
                  className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  title="แก้ไขแบนเนอร์"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleActive(banner)}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title={banner.isActive ? "ซ่อนแบนเนอร์" : "แสดงแบนเนอร์"}
                >
                  {banner.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleDelete(banner._id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="ลบแบนเนอร์"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
