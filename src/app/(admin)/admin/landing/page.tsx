"use client";
import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Eye, ToggleLeft, ToggleRight, GripVertical } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Feature  { icon: string; title: string; desc: string; }
interface Testimonial { name: string; text: string; role?: string; }
interface LandingConfig {
  hero: { headline: string; subheadline: string; ctaText: string; ctaLink: string; bgImage: string; showCourses: boolean; };
  about: { enabled: boolean; title: string; body: string; image: string; };
  features: { enabled: boolean; title: string; items: Feature[]; };
  testimonials: { enabled: boolean; title: string; items: Testimonial[]; };
  cta: { enabled: boolean; headline: string; subheadline: string; buttonText: string; };
}

const DEFAULT: LandingConfig = {
  hero: { headline: "เรียนรู้ทักษะใหม่ ก้าวหน้าทุกด้านชีวิต", subheadline: "คอร์สออนไลน์คุณภาพสูง สอนโดยผู้เชี่ยวชาญ", ctaText: "ดูคอร์สทั้งหมด", ctaLink: "/courses", bgImage: "", showCourses: true },
  about: { enabled: true, title: "เกี่ยวกับเรา", body: "เราเป็นสถาบันการศึกษาที่มุ่งมั่นในการพัฒนาศักยภาพผู้เรียน", image: "" },
  features: { enabled: true, title: "ทำไมต้องเลือกเรา?", items: [
    { icon: "🎓", title: "ผู้สอนมืออาชีพ", desc: "สอนโดยผู้เชี่ยวชาญที่มีประสบการณ์จริง" },
    { icon: "📱", title: "เรียนได้ทุกที่", desc: "เข้าถึงคอร์สได้ทุกอุปกรณ์ตลอด 24 ชม." },
    { icon: "🏆", title: "ใบรับรองจริง", desc: "รับใบรับรองเมื่อเรียนจบหลักสูตร" },
  ]},
  testimonials: { enabled: true, title: "เสียงจากผู้เรียน", items: [
    { name: "คุณสมชาย", role: "นักเรียน", text: "คอร์สดีมาก เนื้อหาชัดเจน ครูอธิบายเข้าใจง่าย" },
    { name: "คุณสมหญิง", role: "นักเรียน", text: "ได้ความรู้จริง นำไปใช้ในงานได้เลย" },
  ]},
  cta: { enabled: true, headline: "พร้อมเริ่มต้นแล้วหรือยัง?", subheadline: "สมัครเรียนวันนี้ ก้าวสู่ความสำเร็จพร้อมกัน", buttonText: "สมัครเรียนตอนนี้" },
};

type Section = "hero" | "about" | "features" | "testimonials" | "cta";

export default function LandingBuilderPage() {
  const [config,  setConfig]  = useState<LandingConfig>(DEFAULT);
  const [section, setSection] = useState<Section>("hero");
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/landing").then((r) => r.json()).then((d) => {
      if (d && Object.keys(d).length > 0) setConfig({ ...DEFAULT, ...d });
    }).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch("/api/admin/landing", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500);
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white";
  const Toggle = ({ on, onChange }: { on: boolean; onChange: () => void }) => (
    <button type="button" onClick={onChange} className={`transition-colors ${on ? "text-indigo-600" : "text-gray-300"}`}>
      {on ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
    </button>
  );

  const addFeature = () => setConfig({ ...config, features: { ...config.features, items: [...config.features.items, { icon: "✨", title: "", desc: "" }] } });
  const removeFeature = (i: number) => setConfig({ ...config, features: { ...config.features, items: config.features.items.filter((_, idx) => idx !== i) } });
  const updateFeature = (i: number, field: keyof Feature, val: string) => setConfig({ ...config, features: { ...config.features, items: config.features.items.map((f, idx) => idx === i ? { ...f, [field]: val } : f) } });

  const addTestimonial = () => setConfig({ ...config, testimonials: { ...config.testimonials, items: [...config.testimonials.items, { name: "", text: "", role: "" }] } });
  const removeTestimonial = (i: number) => setConfig({ ...config, testimonials: { ...config.testimonials, items: config.testimonials.items.filter((_, idx) => idx !== i) } });
  const updateTestimonial = (i: number, field: keyof Testimonial, val: string) => setConfig({ ...config, testimonials: { ...config.testimonials, items: config.testimonials.items.map((t, idx) => idx === i ? { ...t, [field]: val } : t) } });

  if (loading) return <LoadingSpinner />;

  const SECTIONS: { key: Section; label: string }[] = [
    { key: "hero",         label: "Hero Banner" },
    { key: "about",        label: "เกี่ยวกับเรา" },
    { key: "features",     label: "จุดเด่น" },
    { key: "testimonials", label: "รีวิวผู้เรียน" },
    { key: "cta",          label: "CTA Button" },
  ];

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Landing Page Builder</h1>
          <p className="text-gray-500 text-sm mt-1">แก้ไขหน้าแรกของสถาบัน</p>
        </div>
        <div className="flex gap-3">
          <a href="/" target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors">
            <Eye className="w-4 h-4" /> Preview
          </a>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            <Save className="w-4 h-4" />{saving ? "บันทึก..." : saved ? "บันทึกแล้ว ✓" : "บันทึก"}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Section tabs */}
        <div className="w-48 shrink-0">
          <div className="space-y-1">
            {SECTIONS.map((s) => (
              <button key={s.key} onClick={() => setSection(s.key)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${section === s.key ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                <GripVertical className="w-3.5 h-3.5 opacity-40" /> {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Editor panel */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          {/* Hero */}
          {section === "hero" && (
            <>
              <h2 className="font-semibold text-gray-900">Hero Banner</h2>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">หัวข้อหลัก</label>
                <input value={config.hero.headline} onChange={(e) => setConfig({ ...config, hero: { ...config.hero, headline: e.target.value } })} className={inputCls} placeholder="หัวข้อหลักของสถาบัน..." /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">หัวข้อรอง</label>
                <textarea value={config.hero.subheadline} onChange={(e) => setConfig({ ...config, hero: { ...config.hero, subheadline: e.target.value } })} rows={2} className={`${inputCls} resize-none`} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">ข้อความปุ่ม CTA</label>
                  <input value={config.hero.ctaText} onChange={(e) => setConfig({ ...config, hero: { ...config.hero, ctaText: e.target.value } })} className={inputCls} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">ลิงก์ปุ่ม CTA</label>
                  <input value={config.hero.ctaLink} onChange={(e) => setConfig({ ...config, hero: { ...config.hero, ctaLink: e.target.value } })} className={inputCls} placeholder="/courses" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">รูปพื้นหลัง (URL)</label>
                <input value={config.hero.bgImage} onChange={(e) => setConfig({ ...config, hero: { ...config.hero, bgImage: e.target.value } })} className={inputCls} placeholder="https://..." /></div>
              <label className="flex items-center gap-2 cursor-pointer">
                <Toggle on={config.hero.showCourses} onChange={() => setConfig({ ...config, hero: { ...config.hero, showCourses: !config.hero.showCourses } })} />
                <span className="text-sm text-gray-700">แสดงคอร์สแนะนำใต้ Hero</span>
              </label>
            </>
          )}

          {/* About */}
          {section === "about" && (
            <>
              <div className="flex items-center gap-3"><h2 className="font-semibold text-gray-900 flex-1">เกี่ยวกับเรา</h2>
                <Toggle on={config.about.enabled} onChange={() => setConfig({ ...config, about: { ...config.about, enabled: !config.about.enabled } })} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">หัวข้อ</label>
                <input value={config.about.title} onChange={(e) => setConfig({ ...config, about: { ...config.about, title: e.target.value } })} className={inputCls} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">เนื้อหา</label>
                <textarea value={config.about.body} onChange={(e) => setConfig({ ...config, about: { ...config.about, body: e.target.value } })} rows={5} className={`${inputCls} resize-none`} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">รูปภาพ (URL)</label>
                <input value={config.about.image} onChange={(e) => setConfig({ ...config, about: { ...config.about, image: e.target.value } })} className={inputCls} placeholder="https://..." /></div>
            </>
          )}

          {/* Features */}
          {section === "features" && (
            <>
              <div className="flex items-center gap-3"><h2 className="font-semibold text-gray-900 flex-1">จุดเด่น</h2>
                <Toggle on={config.features.enabled} onChange={() => setConfig({ ...config, features: { ...config.features, enabled: !config.features.enabled } })} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">หัวข้อ</label>
                <input value={config.features.title} onChange={(e) => setConfig({ ...config, features: { ...config.features, title: e.target.value } })} className={inputCls} /></div>
              <div className="space-y-3">
                {config.features.items.map((f, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <input value={f.icon} onChange={(e) => updateFeature(i, "icon", e.target.value)} className="w-14 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center" placeholder="🎓" />
                      <input value={f.title} onChange={(e) => updateFeature(i, "title", e.target.value)} className={`${inputCls} flex-1`} placeholder="ชื่อจุดเด่น" />
                      <button onClick={() => removeFeature(i)} className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <input value={f.desc} onChange={(e) => updateFeature(i, "desc", e.target.value)} className={inputCls} placeholder="คำอธิบาย" />
                  </div>
                ))}
              </div>
              {config.features.items.length < 6 && (
                <button onClick={addFeature} className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                  <Plus className="w-4 h-4" /> เพิ่มจุดเด่น
                </button>
              )}
            </>
          )}

          {/* Testimonials */}
          {section === "testimonials" && (
            <>
              <div className="flex items-center gap-3"><h2 className="font-semibold text-gray-900 flex-1">รีวิวผู้เรียน</h2>
                <Toggle on={config.testimonials.enabled} onChange={() => setConfig({ ...config, testimonials: { ...config.testimonials, enabled: !config.testimonials.enabled } })} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">หัวข้อ</label>
                <input value={config.testimonials.title} onChange={(e) => setConfig({ ...config, testimonials: { ...config.testimonials, title: e.target.value } })} className={inputCls} /></div>
              <div className="space-y-3">
                {config.testimonials.items.map((t, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-2">
                    <div className="flex gap-2">
                      <input value={t.name} onChange={(e) => updateTestimonial(i, "name", e.target.value)} className={`${inputCls} flex-1`} placeholder="ชื่อผู้รีวิว" />
                      <input value={t.role ?? ""} onChange={(e) => updateTestimonial(i, "role", e.target.value)} className="w-32 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="บทบาท" />
                      <button onClick={() => removeTestimonial(i)} className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <textarea value={t.text} onChange={(e) => updateTestimonial(i, "text", e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="ข้อความรีวิว..." />
                  </div>
                ))}
              </div>
              {config.testimonials.items.length < 6 && (
                <button onClick={addTestimonial} className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                  <Plus className="w-4 h-4" /> เพิ่มรีวิว
                </button>
              )}
            </>
          )}

          {/* CTA */}
          {section === "cta" && (
            <>
              <div className="flex items-center gap-3"><h2 className="font-semibold text-gray-900 flex-1">CTA Section</h2>
                <Toggle on={config.cta.enabled} onChange={() => setConfig({ ...config, cta: { ...config.cta, enabled: !config.cta.enabled } })} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">หัวข้อ</label>
                <input value={config.cta.headline} onChange={(e) => setConfig({ ...config, cta: { ...config.cta, headline: e.target.value } })} className={inputCls} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">หัวข้อรอง</label>
                <input value={config.cta.subheadline} onChange={(e) => setConfig({ ...config, cta: { ...config.cta, subheadline: e.target.value } })} className={inputCls} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">ข้อความปุ่ม</label>
                <input value={config.cta.buttonText} onChange={(e) => setConfig({ ...config, cta: { ...config.cta, buttonText: e.target.value } })} className={inputCls} /></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
