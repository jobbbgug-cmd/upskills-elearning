"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Plus, Trash2, Upload, GripVertical, Eye, EyeOff } from "lucide-react";
import { IBanner } from "@/types";

const DEFAULT_COLORS = ["#1e1b4b", "#0f172a", "#1e3a5f", "#14532d", "#450a0a", "#1c1917"];

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<IBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    imageUrl: "",
    title: "",
    subtitle: "",
    linkUrl: "",
    linkText: "ดูรายละเอียด",
    bgColor: "#1e1b4b",
  });
  const [showForm, setShowForm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/banners");
    if (res.ok) setBanners(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) setForm((f) => ({ ...f, imageUrl: data.url }));
    setUploading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl) return alert("กรุณาอัปโหลดรูปภาพก่อน");
    const res = await fetch("/api/admin/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, order: banners.length }),
    });
    if (res.ok) {
      setForm({ imageUrl: "", title: "", subtitle: "", linkUrl: "", linkText: "ดูรายละเอียด", bgColor: "#1e1b4b" });
      setShowForm(false);
      load();
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
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          เพิ่มแบนเนอร์
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-5">แบนเนอร์ใหม่</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            {/* Image upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">รูปภาพแบนเนอร์ *</label>
              <div className="flex items-start gap-4">
                {form.imageUrl ? (
                  <div className="relative w-48 h-28 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                    <Image src={form.imageUrl} alt="preview" fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-48 h-28 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 border-2 border-dashed border-gray-300">
                    <span className="text-xs text-gray-400">ยังไม่มีรูป</span>
                  </div>
                )}
                <div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? "กำลังอัปโหลด..." : "อัปโหลดรูป"}
                  </button>
                  <p className="text-xs text-gray-400 mt-1.5">แนะนำ 1200×420px</p>
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
                      style={{
                        background: c,
                        borderColor: form.bgColor === c ? "#6366f1" : "transparent",
                      }}
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
                บันทึกแบนเนอร์
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors">
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

              {/* Preview */}
              <div
                className="relative w-32 h-20 rounded-xl overflow-hidden shrink-0"
                style={{ background: banner.bgColor }}
              >
                <Image src={banner.imageUrl} alt={banner.title || "banner"} fill className="object-cover" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{banner.title || "(ไม่มีหัวข้อ)"}</p>
                <p className="text-sm text-gray-400 truncate mt-0.5">{banner.subtitle}</p>
                {banner.linkUrl && (
                  <p className="text-xs text-indigo-500 mt-1 truncate">{banner.linkUrl}</p>
                )}
              </div>

              {/* Color swatch */}
              <div className="w-6 h-6 rounded-full border border-gray-200 shrink-0" style={{ background: banner.bgColor }} title={banner.bgColor} />

              {/* Status badge */}
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${banner.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {banner.isActive ? "แสดง" : "ซ่อน"}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
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
