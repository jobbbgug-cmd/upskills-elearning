"use client";
import { useEffect, useState } from "react";
import { Building2, Users, BookOpen, TrendingUp, CheckCircle2, XCircle, Edit3, Plus, X } from "lucide-react";
import { PLAN_LABELS, PLAN_LIMITS } from "@/lib/planLimits";

interface InstitutionStats {
  _id: string;
  slug: string;
  name: string;
  plan: string;
  planExpiresAt: string | null;
  isActive: boolean;
  commissionRate: number;
  createdAt: string;
  stats: { users: number; courses: number; revenue: number; bookings: number };
}

const PLANS = ["trial", "starter", "pro", "enterprise"] as const;

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<InstitutionStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<InstitutionStats | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ plan: "trial", planExpiresAt: "", isActive: true, commissionRate: 0 });
  const [newForm, setNewForm] = useState({ slug: "", name: "", plan: "trial", commissionRate: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const res = await fetch("/api/super-admin/institutions");
    if (res.ok) setInstitutions(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openEdit = (inst: InstitutionStats) => {
    setEditing(inst);
    setForm({
      plan: inst.plan,
      planExpiresAt: inst.planExpiresAt ? inst.planExpiresAt.slice(0, 10) : "",
      isActive: inst.isActive,
      commissionRate: inst.commissionRate,
    });
    setError("");
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    setError("");
    const res = await fetch(`/api/super-admin/institutions/${editing._id}/plan`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan: form.plan,
        planExpiresAt: form.planExpiresAt || null,
        isActive: form.isActive,
        commissionRate: Number(form.commissionRate),
      }),
    });
    setSaving(false);
    if (res.ok) { setEditing(null); load(); }
    else { const d = await res.json(); setError(d.error ?? "เกิดข้อผิดพลาด"); }
  };

  const createInstitution = async () => {
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/institutions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newForm),
    });
    setSaving(false);
    if (res.ok) { setCreating(false); setNewForm({ slug: "", name: "", plan: "trial", commissionRate: 0 }); load(); }
    else { const d = await res.json(); setError(d.error ?? "เกิดข้อผิดพลาด"); }
  };

  if (loading) return <div className="text-gray-400 text-sm p-8">กำลังโหลด...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">สถาบันทั้งหมด</h1>
          <p className="text-gray-500 text-sm mt-1">{institutions.length} สถาบัน</p>
        </div>
        <button
          onClick={() => { setCreating(true); setError(""); }}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> เพิ่มสถาบัน
        </button>
      </div>

      <div className="space-y-3">
        {institutions.map((inst) => {
          const expired = inst.planExpiresAt && new Date(inst.planExpiresAt) < new Date();
          const daysLeft = inst.planExpiresAt
            ? Math.max(0, Math.ceil((new Date(inst.planExpiresAt).getTime() - Date.now()) / 86400000))
            : null;
          const limits = PLAN_LIMITS[inst.plan as keyof typeof PLAN_LIMITS] ?? PLAN_LIMITS.trial;

          return (
            <div key={inst._id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{inst.name}</h3>
                    <span className="text-xs text-gray-400 font-mono">{inst.slug}</span>
                    <PlanBadge plan={inst.plan} />
                    {!inst.isActive && (
                      <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">ระงับ</span>
                    )}
                    {expired && (
                      <span className="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full">หมดอายุ</span>
                    )}
                  </div>

                  {/* Stats row */}
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-gray-400" />
                      {inst.stats.users} / {limits.maxStudents === 0 ? "∞" : limits.maxStudents} ผู้ใช้
                    </span>
                    <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-gray-400" />
                      {inst.stats.courses} / {limits.maxCourses === 0 ? "∞" : limits.maxCourses} คอร์ส
                    </span>
                    <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                      ฿{inst.stats.revenue.toLocaleString()} รายได้
                    </span>
                    {inst.commissionRate > 0 && (
                      <span className="text-violet-600 font-medium">Commission {inst.commissionRate}%</span>
                    )}
                  </div>

                  {/* Expiry */}
                  {inst.planExpiresAt && (
                    <p className={`text-xs mt-2 ${expired ? "text-red-500" : daysLeft! <= 7 ? "text-orange-500" : "text-gray-400"}`}>
                      {expired ? "หมดอายุแล้ว" : `หมดอายุใน ${daysLeft} วัน`} —{" "}
                      {new Date(inst.planExpiresAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => openEdit(inst)}
                  className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors shrink-0"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit modal */}
      {editing && (
        <Modal title={`แก้ไข: ${editing.name}`} onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <Field label="แผน">
              <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300">
                {PLANS.map((p) => <option key={p} value={p}>{PLAN_LABELS[p]}</option>)}
              </select>
            </Field>
            <Field label="วันหมดอายุ (ว่าง = ไม่มีวันหมดอายุ)">
              <input type="date" value={form.planExpiresAt} onChange={(e) => setForm({ ...form, planExpiresAt: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
            </Field>
            <Field label="Commission (%)">
              <input type="number" min={0} max={100} step={0.5} value={form.commissionRate}
                onChange={(e) => setForm({ ...form, commissionRate: Number(e.target.value) })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
            </Field>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
              <label htmlFor="isActive" className="text-sm text-gray-700">สถาบันใช้งานได้ (ปิดเพื่อระงับ)</label>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button onClick={saveEdit} disabled={saving}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50">
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
              <button onClick={() => setEditing(null)}
                className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors">
                ยกเลิก
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create modal */}
      {creating && (
        <Modal title="เพิ่มสถาบันใหม่" onClose={() => setCreating(false)}>
          <div className="space-y-4">
            <Field label="Slug (ใช้ใน subdomain เช่น abc.upskills.com)">
              <input type="text" value={newForm.slug} onChange={(e) => setNewForm({ ...newForm, slug: e.target.value.toLowerCase() })}
                placeholder="abc" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
            </Field>
            <Field label="ชื่อสถาบัน">
              <input type="text" value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                placeholder="โรงเรียน ABC" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
            </Field>
            <Field label="แผนเริ่มต้น">
              <select value={newForm.plan} onChange={(e) => setNewForm({ ...newForm, plan: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300">
                {PLANS.map((p) => <option key={p} value={p}>{PLAN_LABELS[p]}</option>)}
              </select>
            </Field>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button onClick={createInstitution} disabled={saving || !newForm.slug || !newForm.name}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50">
                {saving ? "กำลังสร้าง..." : "สร้างสถาบัน"}
              </button>
              <button onClick={() => setCreating(false)}
                className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors">
                ยกเลิก
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    trial:      "bg-gray-50 text-gray-600 border-gray-200",
    starter:    "bg-blue-50 text-blue-700 border-blue-200",
    pro:        "bg-violet-50 text-violet-700 border-violet-200",
    enterprise: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${styles[plan] ?? styles.trial}`}>
      {PLAN_LABELS[plan] ?? plan}
    </span>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
