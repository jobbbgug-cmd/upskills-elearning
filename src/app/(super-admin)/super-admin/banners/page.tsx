"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Plus, Trash2, Upload, Eye, EyeOff, Pencil } from "lucide-react";
import { compressImage } from "@/lib/compressImage";

interface IBanner {
  _id: string;
  imageUrl: string;
  mobileImageUrl?: string;
  title: string;
  subtitle: string;
  buttonType?: "link" | "register";
  linkUrl: string;
  linkText?: string;
  bgColor?: string;
  isActive?: boolean;
  order?: number;
}

const DEFAULT_COLORS = ["#1e1b4b", "#0f172a", "#1e3a5f", "#14532d", "#450a0a", "#1c1917"];

const EMPTY_FORM = {
  imageUrl: "",
  mobileImageUrl: "",
  title: "",
  subtitle: "",
  buttonType: "link" as "link" | "register",
  linkUrl: "",
  linkText: "ดูรายละเอียด",
  bgColor: "#1e1b4b",
};

export default function BannersPage() {
  const [banners, setBanners] = useState<IBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<"desktop" | "mobile" | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const desktopFileRef = useRef<HTMLInputElement>(null);
  const mobileFileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/banners");
      if (res.ok) {
        const data = await res.json();
        setBanners(Array.isArray(data) ? data : data.banners || []);
      }
    } catch (error) {
      console.error("Failed to fetch banners:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "desktop" | "mobile") => {
    const raw = e.target.files?.[0];
    if (!raw) return;
    setUploading(target);
    try {
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
    } catch (error) {
      console.error("Upload failed:", error);
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
      buttonType: banner.buttonType ?? "link",
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
    if (!form.imageUrl) {
      alert("กรุณาอัปโหลดรูปภาพ Desktop ก่อน");
      return;
    }
    try {
      if (editingId) {
        const res = await fetch(`/api/super-admin/banners/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          closeForm();
          load();
        }
      } else {
        const res = await fetch("/api/super-admin/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, order: banners.length }),
        });
        if (res.ok) {
          closeForm();
          load();
        }
      }
    } catch (error) {
      console.error("Submit failed:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ลบแบนเนอร์นี้?")) return;
    try {
      await fetch(`/api/super-admin/banners/${id}`, { method: "DELETE" });
      load();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const toggleActive = async (banner: IBanner) => {
    try {
      await fetch(`/api/super-admin/banners/${banner._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });
      load();
    } catch (error) {
      console.error("Toggle failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">จัดการแบนเนอร์</h1>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการแบนเนอร์</h1>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setForm(EMPTY_FORM);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          เพิ่มแบนเนอร์
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">{editingId ? "แก้ไขแบนเนอร์" : "เพิ่มแบนเนอร์ใหม่"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Desktop Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">รูปภาพ Desktop (1920x600)</label>
              <div
                onClick={() => desktopFileRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
              >
                {form.imageUrl ? (
                  <div className="text-sm text-green-600">✓ อัปโหลดแล้ว</div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-6 h-6 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600">คลิกเพื่ออัปโหลด</p>
                  </div>
                )}
              </div>
              <input
                ref={desktopFileRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload(e, "desktop")}
                className="hidden"
              />
            </div>

            {/* Mobile Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">รูปภาพ Mobile (540x600)</label>
              <div
                onClick={() => mobileFileRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
              >
                {form.mobileImageUrl ? (
                  <div className="text-sm text-green-600">✓ อัปโหลดแล้ว</div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-6 h-6 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600">คลิกเพื่ออัปโหลด</p>
                  </div>
                )}
              </div>
              <input
                ref={mobileFileRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload(e, "mobile")}
                className="hidden"
              />
            </div>

            {/* Title & Subtitle */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">หัวเรื่อง</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">คำอธิบาย</label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>

            {/* Button Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทปุ่ม</label>
                <select
                  value={form.buttonType}
                  onChange={(e) => setForm({ ...form, buttonType: e.target.value as "link" | "register" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                >
                  <option value="link">ลิงก์</option>
                  <option value="register">สมัครเรียน</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ข้อความปุ่ม</label>
                <input
                  type="text"
                  value={form.linkText}
                  onChange={(e) => setForm({ ...form, linkText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>

            {/* Link URL & Color */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL ลิงก์</label>
                <input
                  type="text"
                  value={form.linkUrl}
                  onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">สีพื้นหลัง</label>
                <div className="flex gap-2">
                  {DEFAULT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm({ ...form, bgColor: color })}
                      style={{ backgroundColor: color }}
                      className={`w-8 h-8 rounded-lg ${form.bgColor === color ? "ring-2 ring-offset-2 ring-gray-400" : ""}`}
                    />
                  ))}
                  <input
                    type="color"
                    value={form.bgColor}
                    onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                    className="w-8 h-8 rounded-lg border border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={uploading !== null}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {uploading ? "กำลังอัปโหลด..." : editingId ? "บันทึก" : "เพิ่มแบนเนอร์"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Banners List */}
      <div className="space-y-4">
        {banners.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-gray-500">ไม่มีแบนเนอร์</p>
          </div>
        ) : (
          banners.map((banner) => (
            <div key={banner._id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start gap-4">
                {banner.imageUrl && (
                  <div className="w-32 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{banner.title}</h3>
                  <p className="text-sm text-gray-600">{banner.subtitle}</p>
                  <p className="text-xs text-gray-500 mt-1">{banner.linkUrl}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(banner)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    title={banner.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                  >
                    {banner.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEdit(banner)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
