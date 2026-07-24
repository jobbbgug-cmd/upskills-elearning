"use client";
import { useEffect, useState } from "react";
import { Users, BookOpen, TrendingUp, Edit3, Plus, X, Eye, EyeOff, RefreshCw, CheckCircle2, Copy, ClipboardCopy, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { PLAN_LABELS, PLAN_LIMITS } from "@/lib/planLimits";
import LoadingSpinner from "@/components/LoadingSpinner";

function buildWelcomeText(admin: CreatedAdmin): string {
  const roleLabel = admin.role === "owner" ? "บัญชีเจ้าของสถาบัน (Owner)" : "บัญชีผู้ดูแลระบบ (Admin)";
  return `เรียน คุณลูกค้า

ขอขอบคุณที่ไว้วางใจใช้บริการจากทีมงาน UPSkills
ทางทีมงานขอแจ้งข้อมูลสำหรับเข้าสู่ระบบ โดยมีรายละเอียดดังต่อไปนี้
${roleLabel}
ชื่อผู้ใช้: ${admin.name}
อีเมล: ${admin.email}
รหัสผ่าน: ${admin.password}

เพื่อความปลอดภัยของข้อมูล ขอแนะนำให้ท่านเปลี่ยนรหัสผ่านทันทีหลังจากเข้าสู่ระบบครั้งแรก

หากพบปัญหาในการเข้าสู่ระบบ หรือต้องการความช่วยเหลือเพิ่มเติม สามารถติดต่อทีมงานได้ตามช่องทางด้านล่าง ทางเรายินดีให้บริการอย่างเต็มที่

ขอแสดงความนับถือ

ทีมงาน UPSkills
โทรศัพท์: 094-801-8302
อีเมล: upskillsth@gmail.com
Line ID: job0948018302`;
}

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

interface CreatedAdmin {
  name: string;
  email: string;
  password: string;
  institutionName: string;
  role: "admin" | "owner";
}

const PLANS = ["trial", "starter", "growth", "pro", "enterprise"] as const;
const PLAN_COMMISSION: Record<string, number> = { trial: 12, starter: 10, growth: 8, pro: 5, enterprise: 3 };

function genPassword(len = 12) {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<InstitutionStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<InstitutionStats | null>(null);
  const [creating, setCreating] = useState(false);
  const [createdAdmin, setCreatedAdmin] = useState<CreatedAdmin | null>(null);
  const [form, setForm] = useState({ name: "", plan: "trial", planExpiresAt: "", isActive: true, commissionRate: 0 });
  const [newForm, setNewForm] = useState({
    slug: "", branchNames: [""], plan: "trial", commissionRate: PLAN_COMMISSION["trial"],
    branchCount: 1,
    ownerName: "", ownerEmail: "", ownerPassword: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: "", name: "" });
  const [selectedInst, setSelectedInst] = useState<string | null>(null);
  const [branches, setBranches] = useState<InstitutionStats[]>([]);

  const load = async () => {
    const res = await fetch("/api/super-admin/institutions");
    if (res.ok) setInstitutions(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    load();
    // Backfill commissionAmount for any confirmed bookings that don't have it stored yet
    fetch("/api/super-admin/migrate-commission", { method: "POST" }).catch(() => {});
  }, []);

  const openEdit = (inst: InstitutionStats) => {
    setEditing(inst);
    setForm({
      name: inst.name,
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
        name: form.name,
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
    const payload = {
      slug: newForm.slug,
      name: newForm.branchNames[0] || "",
      branchNames: newForm.branchNames,
      plan: newForm.plan,
      commissionRate: Number(newForm.commissionRate),
      branchCount: newForm.branchCount,
      ownerName: newForm.ownerName,
      ownerEmail: newForm.ownerEmail,
      ownerPassword: newForm.ownerPassword,
    };
    const res = await fetch("/api/admin/institutions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setCreating(false);
      setNewForm({ slug: "", branchNames: [""], plan: "trial", commissionRate: PLAN_COMMISSION["trial"], branchCount: 1, ownerName: "", ownerEmail: "", ownerPassword: "" });
      load();
      if (data.ownerUser) {
        setCreatedAdmin({
          name: data.ownerUser.name,
          email: data.ownerUser.email,
          password: newForm.ownerPassword,
          institutionName: newForm.branchNames[0] || "",
          role: data.ownerUser.role === "owner" ? "owner" : "admin",
        });
      }
    } else {
      const d = await res.json();
      setError(d.error ?? "เกิดข้อผิดพลาด");
    }
  };

  const deleteInstitution = async (id: string) => {
    await fetch(`/api/super-admin/institutions/${id}`, { method: "DELETE" });
    setInstitutions((prev) => prev.filter((i) => i._id !== id));
  };

  const toggleBranches = async (instId: string) => {
    if (selectedInst === instId) {
      setSelectedInst(null);
      setBranches([]);
    } else {
      setSelectedInst(instId);
      const res = await fetch(`/api/super-admin/institutions?parentId=${instId}`);
      if (res.ok) setBranches(await res.json());
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={deleteConfirm.open}
        title="ลบสถาบัน?"
        message={`"${deleteConfirm.name}" และสาขาทั้งหมด รวมถึงผู้ใช้ในสถาบันนี้ จะถูกลบถาวร ไม่สามารถกู้คืนได้`}
        confirmLabel="ลบถาวร"
        type="danger"
        onConfirm={() => deleteInstitution(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm((d) => ({ ...d, open: false }))}
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">สถาบันทั้งหมด</h1>
          <p className="text-gray-500 text-sm mt-1">{institutions.length} สถาบัน</p>
        </div>
        <button
          onClick={() => { setCreating(true); setError(""); }}
          className="flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-xl transition-colors theme-button"
        >
          <Plus className="w-4 h-4" /> เพิ่มสถาบัน
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {institutions.map((inst) => {
          const fmtB = (n: number) => { const r = Math.round(n * 100) / 100; const p = r.toString().split("."); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); return p.join("."); };
          const commissionAmount = inst.commissionRate > 0 ? fmtB(inst.stats.revenue * inst.commissionRate / 100) : null;
          const expired = inst.planExpiresAt && new Date(inst.planExpiresAt) < new Date();
          const daysLeft = inst.planExpiresAt
            ? Math.max(0, Math.ceil((new Date(inst.planExpiresAt).getTime() - Date.now()) / 86400000))
            : null;
          const limits = PLAN_LIMITS[inst.plan as keyof typeof PLAN_LIMITS] ?? PLAN_LIMITS.trial;
          const initials = inst.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
          const planColor: Record<string, string> = {
            trial: "from-gray-400 to-gray-500",
            starter: "from-blue-400 to-blue-600",
            pro: "from-violet-500 to-purple-600",
            enterprise: "from-amber-400 to-orange-500",
          };

          return (
            <div key={inst._id}>
              <div className={`bg-white rounded-xl border overflow-hidden transition-all hover:shadow-sm cursor-pointer ${selectedInst === inst._id ? "border-violet-300 bg-violet-50" : !inst.isActive ? "border-red-100" : "border-gray-100"}`} onClick={() => toggleBranches(inst._id)}>
                <div className={`h-0.5 w-full ${inst.plan === "trial" ? "" : `bg-gradient-to-r ${planColor[inst.plan] ?? planColor.trial}`}`}
                  style={inst.plan === "trial" ? { background: `linear-gradient(to right, rgba(var(--color-primary-rgb), 0.6), var(--color-primary))` } : undefined} />

                <div className="px-4 py-3 flex items-center gap-3">
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${inst.plan === "trial" ? "" : `bg-gradient-to-br ${planColor[inst.plan] ?? planColor.trial}`}`}
                    style={inst.plan === "trial" ? { background: `linear-gradient(to bottom right, rgba(var(--color-primary-rgb), 0.8), var(--color-primary))` } : undefined}>
                    <span className="text-white text-xs font-bold">{initials}</span>
                  </div>

                  {/* Name + badges */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{inst.name}</span>
                      <PlanBadge plan={inst.plan} />
                      {!inst.isActive && <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">ระงับ</span>}
                      {expired && <span className="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full">หมดอายุ</span>}
                      {inst.planExpiresAt && !expired && daysLeft! <= 7 && (
                        <span className="text-xs bg-orange-50 text-orange-500 border border-orange-200 px-2 py-0.5 rounded-full">⏱ {daysLeft} วัน</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                      <span className="font-mono">{inst.slug}</span>
                      <span><Users className="w-3 h-3 inline mr-0.5" />{inst.stats.users}{limits.maxStudents > 0 ? `/${limits.maxStudents}` : ""}</span>
                      <span><BookOpen className="w-3 h-3 inline mr-0.5" />{inst.stats.courses}{limits.maxCourses > 0 ? `/${limits.maxCourses}` : ""}</span>
                      <span>{inst.stats.bookings} การจอง</span>
                    </div>
                  </div>

                  {/* Revenue + commission */}
                  <div className="text-right shrink-0">
                    <p className="text-base font-extrabold theme-link">฿{fmtB(inst.stats.revenue)}</p>
                    {commissionAmount && (
                      <p className="text-xs theme-link">คอม {inst.commissionRate}% = ฿{commissionAmount}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => openEdit(inst)} className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors" title="แก้ไข">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteConfirm({ open: true, id: inst._id, name: inst.name })} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="ลบสถาบัน">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              {/* Branches */}
              {selectedInst === inst._id && branches.length > 0 && (
                <div className="bg-gray-50 border-t border-gray-100 px-4 py-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">สาขา</p>
                  <div className="space-y-2">
                    {branches.map((branch) => (
                      <div key={branch._id} className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                        <p className="text-sm font-medium text-gray-900">{branch.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{branch.slug}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit modal */}
      {editing && (
        <Modal title={`แก้ไข: ${editing.name}`} onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <Field label="ชื่อสถาบัน">
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
            </Field>
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
              <input
                type="text"
                inputMode="decimal"
                value={String(form.commissionRate)}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9.]/g, "");
                  const stripped = raw.replace(/^0+(?=\d)/, "") || "0";
                  setForm({ ...form, commissionRate: Number(stripped) });
                }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
            </Field>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
              <label htmlFor="isActive" className="text-sm text-gray-700">สถาบันใช้งานได้ (ปิดเพื่อระงับ)</label>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button onClick={saveEdit} disabled={saving}
                className="flex-1 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50 theme-button">
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
        <Modal title="เพิ่มสถาบันใหม่" onClose={() => { setCreating(false); setError(""); }}>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Institution fields */}
            <Field label="จำนวนสาขา *">
              <input
                type="number"
                min={1} max={10}
                value={newForm.branchCount}
                onChange={(e) => {
                  const count = Math.max(1, Math.min(10, Number(e.target.value) || 1));
                  const names = Array.from({ length: count }, (_, i) => newForm.branchNames[i] || "");
                  setNewForm({ ...newForm, branchCount: count, branchNames: names });
                }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
              <p className="text-xs text-gray-400 mt-1">ระบบจะสร้างสาขา 1, 2, 3, ... ให้อัตโนมัติ</p>
            </Field>
            {newForm.branchCount === 1 ? (
              <Field label="ชื่อสถาบัน *">
                <input type="text" value={newForm.branchNames[0] || ""} onChange={(e) => setNewForm({ ...newForm, branchNames: [e.target.value] })}
                  placeholder="โรงเรียน ABC" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
              </Field>
            ) : (
              <>
                {newForm.branchNames.map((name, i) => (
                  <Field key={i} label={`ชื่อสถาบัน${i + 1} *`}>
                    <input type="text" value={name} onChange={(e) => {
                      const updated = [...newForm.branchNames];
                      updated[i] = e.target.value;
                      setNewForm({ ...newForm, branchNames: updated });
                    }}
                      placeholder={`โรงเรียน ABC ${i + 1}`} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
                  </Field>
                ))}
              </>
            )}
            <Field label="Slug (ตัวพิมพ์เล็ก ไม่มีช่องว่าง) *">
              <input type="text" value={newForm.slug} onChange={(e) => setNewForm({ ...newForm, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                placeholder="abc-school" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
            </Field>
            <Field label="แผนเริ่มต้น">
              <select value={newForm.plan} onChange={(e) => setNewForm({ ...newForm, plan: e.target.value, commissionRate: PLAN_COMMISSION[e.target.value] ?? 0 })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300">
                {PLANS.map((p) => <option key={p} value={p}>{PLAN_LABELS[p]} — ค่าคอม {PLAN_COMMISSION[p]}%</option>)}
              </select>
            </Field>
            <Field label="Commission (%)">
              <input
                type="text"
                inputMode="decimal"
                value={String(newForm.commissionRate)}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9.]/g, "");
                  const stripped = raw.replace(/^0+(?=\d)/, "") || "0";
                  setNewForm({ ...newForm, commissionRate: Number(stripped) });
                }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
            </Field>

            {/* Divider */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-xs font-semibold text-violet-500 uppercase tracking-wider whitespace-nowrap">
                {newForm.branchCount > 1 ? "บัญชีเจ้าของสถาบัน (Owner) *" : "บัญชีผู้ดูแลระบบ (Admin) *"}
              </span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            <Field label="ชื่อ-นามสกุล *">
              <input type="text" value={newForm.ownerName} onChange={(e) => setNewForm({ ...newForm, ownerName: e.target.value })}
                placeholder="นายสมชาย ใจดี" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
            </Field>
            <Field label="อีเมล *">
              <input type="email" value={newForm.ownerEmail} onChange={(e) => setNewForm({ ...newForm, ownerEmail: e.target.value })}
                placeholder={newForm.branchCount > 1 ? "owner@school.com" : "admin@school.com"} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
            </Field>
            <Field label="รหัสผ่าน *">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPw ? "text" : "password"}
                    value={newForm.ownerPassword}
                    onChange={(e) => setNewForm({ ...newForm, ownerPassword: e.target.value })}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button type="button"
                  onClick={() => { const pw = genPassword(); setNewForm({ ...newForm, ownerPassword: pw }); setShowPw(true); }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-gray-500 hover:text-violet-600 hover:border-violet-300 transition-colors"
                  title="สร้างรหัสผ่านอัตโนมัติ">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </Field>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button
                onClick={createInstitution}
                disabled={saving || !newForm.slug || !newForm.branchNames[0]?.trim() || !newForm.ownerName || !newForm.ownerEmail || !newForm.ownerPassword}
                className="flex-1 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50 theme-button">
                {saving ? "กำลังสร้าง..." : "สร้างสถาบัน"}
              </button>
              <button onClick={() => { setCreating(false); setError(""); }}
                className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors">
                ยกเลิก
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Success modal — show admin credentials */}
      {createdAdmin && (
        <SuccessModal admin={createdAdmin} onClose={() => setCreatedAdmin(null)} />
      )}
    </div>
  );
}

function SuccessModal({ admin, onClose }: { admin: CreatedAdmin; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const text = buildWelcomeText(admin);

  const copyAll = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <Modal title="สร้างสถาบันสำเร็จ!" onClose={onClose}>
      <div className="space-y-5">
        {/* Success Banner */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold text-green-900 text-sm">สร้างสถาบันสำเร็จ</p>
              <p className="text-sm text-green-800 font-bold truncate">{admin.institutionName}</p>
            </div>
          </div>
          <div className={`flex-shrink-0 px-3 py-2 rounded-lg border-2 font-semibold text-xs leading-tight text-center ${
            admin.role === "owner"
              ? "border-green-500 bg-green-50 text-green-600"
              : "border-blue-500 bg-blue-50 text-blue-600"
          }`}>
            {admin.role === "owner" ? (
              <>
                <div>พร้อมเจ้าของ</div>
                <div>สถาบัน (Owner)</div>
              </>
            ) : (
              <>
                <div>พร้อมผู้ดูแล</div>
                <div>ระบบ (Admin)</div>
              </>
            )}
          </div>
        </div>

        {/* Credentials Section */}
        <div>
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-3">
            ข้อมูลเข้าสู่ระบบ
          </p>
          <div className="space-y-2">
            <CredRow label="ชื่อ" value={admin.name} />
            <CredRow label="อีเมล" value={admin.email} />
            <CredRow label="รหัสผ่าน" value={admin.password} secret />
          </div>
        </div>

        <p className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
          ⚠️ คัดลอกรหัสผ่านไว้ก่อน! จะไม่สามารถดูได้อีกครั้ง
        </p>

        {/* Copy welcome letter */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-sm text-gray-700 transition-colors"
          >
            <span className="font-medium">ดูข้อความสำหรับส่งลูกค้า</span>
            <span className="text-gray-400 text-xs">{showPreview ? "ซ่อน ▲" : "แสดง ▼"}</span>
          </button>
          {showPreview && (
            <pre className="px-4 py-3 text-xs text-gray-700 bg-white whitespace-pre-wrap leading-relaxed max-h-52 overflow-y-auto border-t border-gray-200 font-sans">
              {text}
            </pre>
          )}
        </div>

        <button
          onClick={copyAll}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            copied
              ? "bg-green-500 text-white"
              : "theme-button"
          }`}
        >
          {copied ? (
            <><CheckCircle2 className="w-4 h-4" /> คัดลอกแล้ว!</>
          ) : (
            <><ClipboardCopy className="w-4 h-4" /> คัดลอกข้อความทั้งหมด</>
          )}
        </button>

        <button
          onClick={onClose}
          className="w-full border border-gray-200 text-gray-600 text-sm py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ปิด
        </button>
      </div>
    </Modal>
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

function CredRow({ label, value, secret }: { label: string; value: string; secret?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [show, setShow] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(value).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div className="flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-gray-300 transition-colors">
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-mono text-gray-900 break-all">
          {secret && !show ? "•".repeat(Math.min(value.length, 16)) : value}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {secret && (
          <button onClick={() => setShow(!show)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors" title={show ? "ซ่อน" : "แสดง"}>
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
        <button onClick={copy} className="p-1.5 text-gray-400 hover:text-violet-600 rounded transition-colors" title="คัดลอก">
          {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
