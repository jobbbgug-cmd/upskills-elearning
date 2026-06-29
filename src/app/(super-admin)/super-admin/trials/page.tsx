"use client";
import { useEffect, useState } from "react";
import {
  Clock, CheckCircle2, PhoneCall, XCircle, RefreshCw, Trash2,
  Plus, Eye, EyeOff, X, ClipboardCopy, Copy, Building2,
} from "lucide-react";
import { PLAN_LABELS } from "@/lib/planLimits";
import LoadingSpinner from "@/components/LoadingSpinner";

/* ── helpers ── */
function buildWelcomeText(admin: CreatedAdmin): string {
  const roleLabel = admin.role === "owner" ? "บัญชีเจ้าของสถาบัน (Owner)" : "บัญชีผู้ดูแลระบบ (Admin)";
  return `เรียน คุณลูกค้า

ขอขอบคุณที่ไว้วางใจใช้บริการจากทีมงาน UPSkill

ทางทีมงานขอแจ้งข้อมูลสำหรับเข้าสู่ระบบ โดยมีรายละเอียดดังต่อไปนี้

${roleLabel}

ชื่อผู้ใช้: ${admin.name}

อีเมล: ${admin.email}

รหัสผ่าน: ${admin.password}

เพื่อความปลอดภัยของข้อมูล ขอแนะนำให้ท่านเปลี่ยนรหัสผ่านทันทีหลังจากเข้าสู่ระบบครั้งแรก

หากพบปัญหาในการเข้าสู่ระบบ หรือต้องการความช่วยเหลือเพิ่มเติม สามารถติดต่อทีมงานได้ตามช่องทางด้านล่าง ทางเรายินดีให้บริการอย่างเต็มที่

ขอแสดงความนับถือ

ทีมงาน UPSkill

โทรศัพท์: 094-801-8302

อีเมล: jobbbgug@gmail.com

Line ID: job0948018302`;
}

function genPassword(len = 12) {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const PLAN_COMMISSION: Record<string, number> = { trial: 10, starter: 8, pro: 5, enterprise: 3 };
const PLANS = ["trial", "starter", "pro", "enterprise"] as const;

/* ── types ── */
interface TrialItem {
  _id: string;
  institutionName: string;
  fullName: string;
  phone: string;
  institutionType: string;
  contactChannel: string;
  contactValue: string;
  status: "pending" | "contacted" | "approved" | "rejected";
  institutionCreated: boolean;
  createdAt: string;
}

interface CreatedAdmin {
  name: string;
  email: string;
  password: string;
  institutionName: string;
  role: "admin" | "owner";
}

/* ── config ── */
const STATUS_CONFIG = {
  pending:   { label: "รอดำเนินการ", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  contacted: { label: "ติดต่อแล้ว",  color: "bg-blue-100 text-blue-700 border-blue-200",   icon: PhoneCall },
  approved:  { label: "อนุมัติแล้ว", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  rejected:  { label: "ปฏิเสธ",      color: "bg-red-100 text-red-700 border-red-200",       icon: XCircle },
};

const NEXT_STATUS: Record<string, string[]> = {
  pending:   ["contacted", "approved", "rejected"],
  contacted: ["approved", "rejected"],
  approved:  [],
  rejected:  [],
};

/* ── main page ── */
export default function TrialsPage() {
  const [items, setItems]   = useState<TrialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]  = useState<string>("pending");

  // Create institution modal state
  const [currentTrialId, setCurrentTrialId] = useState<string | null>(null);
  const [creating, setCreating]       = useState(false);
  const [createdAdmin, setCreatedAdmin] = useState<CreatedAdmin | null>(null);
  const [newForm, setNewForm] = useState({
    slug: "", name: "", plan: "trial", commissionRate: PLAN_COMMISSION["trial"],
    branchCount: 1, ownerName: "", ownerEmail: "", ownerPassword: "",
  });
  const [showPw, setShowPw]   = useState(false);
  const [saving, setSaving]   = useState(false);
  const [createError, setCreateError] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/super-admin/trial-requests");
    const data = await res.json();
    setItems(data.items ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/super-admin/trial-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setItems((prev) => prev.map((it) => it._id === id ? { ...it, status: status as TrialItem["status"] } : it));
  };

  const deleteItem = async (id: string) => {
    if (!confirm("ลบรายการนี้?")) return;
    await fetch("/api/super-admin/trial-requests", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setItems((prev) => prev.filter((it) => it._id !== id));
  };

  const openCreateFromTrial = (item: TrialItem) => {
    const slug = item.institutionName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    setCurrentTrialId(item._id);
    setNewForm({
      slug,
      name: item.institutionName,
      plan: "trial",
      commissionRate: PLAN_COMMISSION["trial"],
      branchCount: 1,
      ownerName: item.fullName,
      ownerEmail: "",
      ownerPassword: genPassword(),
    });
    setShowPw(true);
    setCreateError("");
    setCreating(true);
  };

  const createInstitution = async () => {
    setSaving(true);
    setCreateError("");
    const res = await fetch("/api/admin/institutions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: newForm.slug,
        name: newForm.name,
        plan: newForm.plan,
        commissionRate: Number(newForm.commissionRate),
        branchCount: newForm.branchCount,
        ownerName: newForm.ownerName,
        ownerEmail: newForm.ownerEmail,
        ownerPassword: newForm.ownerPassword,
      }),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setCreating(false);
      setNewForm({ slug: "", name: "", plan: "trial", commissionRate: PLAN_COMMISSION["trial"], branchCount: 1, ownerName: "", ownerEmail: "", ownerPassword: "" });
      // Mark trial as institution created
      if (currentTrialId) {
        await fetch("/api/super-admin/trial-requests", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: currentTrialId, institutionCreated: true }),
        });
        setItems((prev) => prev.map((it) => it._id === currentTrialId ? { ...it, institutionCreated: true } : it));
        setCurrentTrialId(null);
      }
      if (data.ownerUser) {
        setCreatedAdmin({
          name: data.ownerUser.name,
          email: data.ownerUser.email,
          password: newForm.ownerPassword,
          institutionName: newForm.name,
          role: data.ownerUser.role === "owner" ? "owner" : "admin",
        });
      }
    } else {
      const d = await res.json();
      setCreateError(d.error ?? "เกิดข้อผิดพลาด");
    }
  };

  const filtered = filter === "all" ? items : items.filter((i) => i.status === filter);
  const counts = {
    all: items.length,
    pending: items.filter((i) => i.status === "pending").length,
    contacted: items.filter((i) => i.status === "contacted").length,
    approved: items.filter((i) => i.status === "approved").length,
    rejected: items.filter((i) => i.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">คำขอทดลองใช้งาน</h1>
          <p className="text-gray-500 text-sm mt-1">รายการคำขอจากหน้าเว็บไซต์</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600 border border-gray-200 hover:border-teal-300 px-3 py-1.5 rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4" />รีเฟรช
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all", label: "ทั้งหมด" },
          { key: "pending", label: "รอดำเนินการ" },
          { key: "contacted", label: "ติดต่อแล้ว" },
          { key: "approved", label: "อนุมัติแล้ว" },
          { key: "rejected", label: "ปฏิเสธ" },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === key ? "bg-teal-500 text-white border-teal-500" : "bg-white text-gray-600 border-gray-200 hover:border-teal-300"
            }`}>
            {label} ({counts[key as keyof typeof counts]})
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">ไม่มีรายการ</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const cfg = STATUS_CONFIG[item.status];
            const Icon = cfg.icon;
            const nextStatuses = NEXT_STATUS[item.status];
            return (
              <div key={item._id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-3">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">ชื่อสถาบัน</p>
                        <h3 className="font-semibold text-gray-900">{item.institutionName}</h3>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
                        <Icon className="w-3 h-3" />{cfg.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-sm">
                      <div><span className="text-gray-400">ชื่อผู้ติดต่อ:</span> <span className="text-gray-700">{item.fullName}</span></div>
                      <div><span className="text-gray-400">โทร:</span> <span className="text-gray-700">{item.phone}</span></div>
                      <div><span className="text-gray-400">ประเภท:</span> <span className="text-gray-700">{item.institutionType}</span></div>
                      <div>
                        <span className="text-gray-400">ช่องทาง:</span>{" "}
                        <span className="text-gray-700">
                          {item.contactChannel === "line" ? "LINE" : item.contactChannel === "email" ? "อีเมล" : "โทร"}
                          {" — "}{item.contactValue}
                        </span>
                      </div>
                      <div className="text-gray-400 text-xs mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>

                    {/* Create institution button — shown only for approved */}
                    {item.status === "approved" && (
                      <button
                        onClick={() => openCreateFromTrial(item)}
                        disabled={item.institutionCreated}
                        className={`mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl shadow-sm transition-colors ${
                          item.institutionCreated
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                            : "bg-violet-600 hover:bg-violet-700 text-white"
                        }`}
                      >
                        <Building2 className="w-4 h-4" />
                        {item.institutionCreated ? "สร้างสถาบันแล้ว" : "สร้างสถาบัน"}
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    {nextStatuses.map((s) => {
                      const nc = STATUS_CONFIG[s as keyof typeof STATUS_CONFIG];
                      return (
                        <button key={s} onClick={() => updateStatus(item._id, s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${nc.color} hover:opacity-80`}>
                          {nc.label}
                        </button>
                      );
                    })}
                    <button onClick={() => deleteItem(item._id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 transition-colors flex items-center gap-1">
                      <Trash2 className="w-3 h-3" />ลบ
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create institution modal */}
      {creating && (
        <Modal title="เพิ่มสถาบันใหม่" onClose={() => { setCreating(false); setCreateError(""); }}>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <Field label="ชื่อสถาบัน *">
              <input type="text" value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                placeholder="โรงเรียน ABC" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
            </Field>
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
              <input type="text" inputMode="decimal" value={String(newForm.commissionRate)}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9.]/g, "");
                  const stripped = raw.replace(/^0+(?=\d)/, "") || "0";
                  setNewForm({ ...newForm, commissionRate: Number(stripped) });
                }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
            </Field>
            <Field label="จำนวนสาขา *">
              <input type="number" min={1} max={10} value={newForm.branchCount}
                onChange={(e) => setNewForm({ ...newForm, branchCount: Math.max(1, Math.min(10, Number(e.target.value) || 1)) })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
              <p className="text-xs text-gray-400 mt-1">ระบบจะสร้างสาขา 1, 2, 3, ... ให้อัตโนมัติ</p>
            </Field>

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
                placeholder={newForm.branchCount > 1 ? "owner@school.com" : "admin@school.com"}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
            </Field>
            <Field label="รหัสผ่าน *">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input type={showPw ? "text" : "password"} value={newForm.ownerPassword}
                    onChange={(e) => setNewForm({ ...newForm, ownerPassword: e.target.value })}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button type="button" onClick={() => { setNewForm({ ...newForm, ownerPassword: genPassword() }); setShowPw(true); }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-gray-500 hover:text-violet-600 hover:border-violet-300 transition-colors" title="สร้างรหัสผ่านอัตโนมัติ">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </Field>

            {createError && <p className="text-red-500 text-sm">{createError}</p>}
            <div className="flex gap-3 pt-2">
              <button onClick={createInstitution}
                disabled={saving || !newForm.slug || !newForm.name || !newForm.ownerName || !newForm.ownerEmail || !newForm.ownerPassword}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50">
                {saving ? "กำลังสร้าง..." : "สร้างสถาบัน"}
              </button>
              <button onClick={() => { setCreating(false); setCreateError(""); }}
                className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors">
                ยกเลิก
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Success modal */}
      {createdAdmin && <SuccessModal admin={createdAdmin} onClose={() => setCreatedAdmin(null)} />}
    </div>
  );
}

/* ── shared UI components ── */

function SuccessModal({ admin, onClose }: { admin: CreatedAdmin; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const text = buildWelcomeText(admin);

  const copyAll = () => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  };

  return (
    <Modal title="สร้างสถาบันสำเร็จ!" onClose={onClose}>
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            สร้าง <span className="font-bold">{admin.institutionName}</span> พร้อม{admin.role === "owner" ? "เจ้าของสถาบัน (Owner)" : "ผู้ดูแลระบบ (Admin)"} เรียบร้อย
          </div>
        </div>

        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          ข้อมูลเข้าสู่ระบบ ({admin.role === "owner" ? "Owner" : "Admin"})
        </p>

        <div className="space-y-2">
          <CredRow label="ชื่อ" value={admin.name} />
          <CredRow label="อีเมล" value={admin.email} />
          <CredRow label="รหัสผ่าน" value={admin.password} secret />
        </div>

        <p className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
          ⚠️ คัดลอกรหัสผ่านไว้ก่อน! จะไม่สามารถดูได้อีกครั้ง
        </p>

        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <button onClick={() => setShowPreview(!showPreview)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-sm text-gray-700 transition-colors">
            <span className="font-medium">ดูข้อความสำหรับส่งลูกค้า</span>
            <span className="text-gray-400 text-xs">{showPreview ? "ซ่อน ▲" : "แสดง ▼"}</span>
          </button>
          {showPreview && (
            <pre className="px-4 py-3 text-xs text-gray-700 bg-white whitespace-pre-wrap leading-relaxed max-h-52 overflow-y-auto border-t border-gray-200 font-sans">
              {text}
            </pre>
          )}
        </div>

        <button onClick={copyAll}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            copied ? "bg-green-500 text-white" : "bg-violet-600 hover:bg-violet-700 text-white"
          }`}>
          {copied ? <><CheckCircle2 className="w-4 h-4" />คัดลอกแล้ว!</> : <><ClipboardCopy className="w-4 h-4" />คัดลอกข้อความทั้งหมด</>}
        </button>

        <button onClick={onClose} className="w-full border border-gray-200 text-gray-600 text-sm py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
          ปิด
        </button>
      </div>
    </Modal>
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
  const [show, setShow]     = useState(false);
  const copy = () => { navigator.clipboard.writeText(value).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };
  return (
    <div className="flex items-center justify-between gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
      <span className="text-xs text-gray-500 w-16 shrink-0">{label}</span>
      <span className="flex-1 text-sm font-mono text-gray-800 break-all">
        {secret && !show ? "•".repeat(Math.min(value.length, 16)) : value}
      </span>
      <div className="flex items-center gap-1 shrink-0">
        {secret && (
          <button onClick={() => setShow(!show)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        )}
        <button onClick={copy} className="p-1 text-gray-400 hover:text-violet-600 rounded" title="คัดลอก">
          {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
