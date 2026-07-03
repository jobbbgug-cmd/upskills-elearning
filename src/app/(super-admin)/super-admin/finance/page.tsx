"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Upload, Save, QrCode, Building2, CreditCard, Phone, ChevronDown } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

const THAI_BANKS = [
  { value: "", label: "-- เลือกธนาคาร --", color: "" },
  { value: "ธนาคารกรุงเทพ", label: "ธนาคารกรุงเทพ (BBL)", color: "#1e3a8a" },
  { value: "ธนาคารกสิกรไทย", label: "ธนาคารกสิกรไทย (KBank)", color: "#166534" },
  { value: "ธนาคารไทยพาณิชย์", label: "ธนาคารไทยพาณิชย์ (SCB)", color: "#6b21a8" },
  { value: "ธนาคารกรุงไทย", label: "ธนาคารกรุงไทย (KTB)", color: "#1d4ed8" },
  { value: "ธนาคารกรุงศรีอยุธยา", label: "ธนาคารกรุงศรีอยุธยา (BAY)", color: "#fbbf24" },
  { value: "ธนาคารทหารไทยธนชาต", label: "ธนาคารทหารไทยธนชาต (TTB)", color: "#0369a1" },
  { value: "ธนาคารออมสิน", label: "ธนาคารออมสิน", color: "#15803d" },
  { value: "ธนาคารอาคารสงเคราะห์", label: "ธนาคารอาคารสงเคราะห์ (GHB)", color: "#f97316" },
  { value: "ธนาคารเพื่อการเกษตรและสหกรณ์", label: "ธ.ก.ส.", color: "#84cc16" },
  { value: "ธนาคารซิตี้แบงก์", label: "Citibank", color: "#1d4ed8" },
  { value: "ธนาคารยูโอบี", label: "UOB", color: "#1e3a8a" },
];

interface Institution {
  _id: string;
  name: string;
}

interface FinanceForm {
  bankName:    string;
  bankAccount: string;
  bankBrand:   string;
  promptpay:   string;
  qrCodeImage: string;
}

const EMPTY: FinanceForm = {
  bankName:    "",
  bankAccount: "",
  bankBrand:   "",
  promptpay:   "",
  qrCodeImage: "",
};

const getInputClass = () =>
  "w-full px-4 py-2.5 border rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2";

export default function SuperAdminFinancePage() {
  const [form, setForm]           = useState<FinanceForm>(EMPTY);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState("");
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved]         = useState(false);
  const qrRef = useRef<HTMLInputElement>(null);

  // Load institutions on mount
  useEffect(() => {
    const init = async () => {
      const instRes = await fetch("/api/admin/institutions");
      if (instRes.ok) {
        const insts = await instRes.json() as Institution[];
        setInstitutions(insts);
        if (insts.length > 0) setSelectedInstitution(insts[0]._id);
      }
      setLoading(false);
    };
    init();
  }, []);

  // Load finance data when institution changes
  useEffect(() => {
    if (!selectedInstitution) return;
    const loadFinance = async () => {
      setLoading(true);
      const res = await fetch(`/api/admin/finance?institutionId=${selectedInstitution}`);
      const d   = await res.json();
      if (d && !d.error) {
        setForm({
          bankName:    d.bankName    ?? "",
          bankAccount: d.bankAccount ?? "",
          bankBrand:   d.bankBrand   ?? "",
          promptpay:   d.promptpay   ?? "",
          qrCodeImage: d.qrCodeImage ?? "",
        });
      } else {
        setForm(EMPTY);
      }
      setLoading(false);
    };
    loadFinance();
  }, [selectedInstitution]);

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res  = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) setForm((f) => ({ ...f, qrCodeImage: data.url }));
    setUploading(false);
    e.target.value = "";
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstitution) return alert("กรุณาเลือกสถาบันก่อน");
    setSaving(true);
    const res = await fetch(`/api/admin/finance?institutionId=${selectedInstitution}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const selectedInstitutionName = institutions.find((i) => i._id === selectedInstitution)?.name ?? "";

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ข้อมูลทางการเงิน</h1>
        <p className="text-gray-500 text-sm mt-1">ดูและแก้ไขข้อมูลบัญชีสำหรับแต่ละสถาบัน</p>
      </div>

      {/* Institution selector */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          <h2 className="font-semibold text-gray-900">เลือกสถาบัน</h2>
        </div>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-primary)' }} />
          <select
            value={selectedInstitution}
            onChange={(e) => setSelectedInstitution(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 border rounded-xl text-sm appearance-none cursor-pointer"
            style={{ borderColor: 'rgba(var(--color-primary-rgb), 0.3)', backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', color: 'var(--color-primary)', '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.4)' } as any}
          >
            <option value="">-- เลือกสถาบัน --</option>
            {institutions.map((i) => (
              <option key={i._id} value={i._id}>{i.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-primary)' }} />
        </div>
        {selectedInstitutionName && (
          <p className="text-xs mt-2 font-medium" style={{ color: 'var(--color-primary)' }}>
            กำลังดูข้อมูลของ: {selectedInstitutionName}
          </p>
        )}
      </div>

      {!selectedInstitution ? (
        <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>กรุณาเลือกสถาบันเพื่อดูข้อมูลทางการเงิน</p>
        </div>
      ) : loading ? (
        <LoadingSpinner />
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* QR Code */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              <h2 className="font-semibold text-gray-900">QR Code การชำระเงิน</h2>
            </div>

            <div className="flex gap-6 items-start">
              <div className="relative w-40 h-40 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
                {form.qrCodeImage ? (
                  <Image src={form.qrCodeImage} alt="QR Code" fill className="object-contain p-2" />
                ) : (
                  <div className="text-center text-gray-400">
                    <QrCode className="w-10 h-10 mx-auto mb-1 opacity-40" />
                    <span className="text-xs">ยังไม่มี QR</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 flex-1">
                <input ref={qrRef} type="file" accept="image/*" className="hidden" onChange={handleQrUpload} />
                <button
                  type="button"
                  onClick={() => qrRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed rounded-xl text-sm transition-colors disabled:opacity-50 w-full justify-center"
                  style={{ borderColor: 'rgba(var(--color-primary-rgb), 0.5)', color: 'var(--color-primary)', backgroundColor: 'rgba(var(--color-primary-rgb), 0.05)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(var(--color-primary-rgb), 0.8)'; e.currentTarget.style.backgroundColor = 'rgba(var(--color-primary-rgb), 0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(var(--color-primary-rgb), 0.5)'; e.currentTarget.style.backgroundColor = 'rgba(var(--color-primary-rgb), 0.05)'; }}
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? "กำลังอัปโหลด..." : "อัปโหลด QR Code"}
                </button>
                {form.qrCodeImage && (
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, qrCodeImage: "" }))}
                    className="text-xs text-red-500 hover:text-red-700 w-full text-center"
                  >
                    ลบรูป QR
                  </button>
                )}
                <p className="text-xs text-gray-400">รองรับ JPG, PNG ขนาดไม่เกิน 10MB</p>
              </div>
            </div>
          </div>

          {/* Bank account */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              <h2 className="font-semibold text-gray-900">บัญชีธนาคาร</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <CreditCard className="w-3.5 h-3.5 inline mr-1" />
                  เลขที่บัญชี
                </label>
                <input
                  value={form.bankAccount}
                  onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
                  className={getInputClass()}
                  style={{ borderColor: 'rgba(var(--color-primary-rgb), 0.3)', '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.4)' } as any}
                  placeholder="เช่น 000-0-00000-0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อบัญชี</label>
                <input
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  className={getInputClass()}
                  style={{ borderColor: 'rgba(var(--color-primary-rgb), 0.3)', '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.4)' } as any}
                  placeholder="เช่น นาย สมชาย ใจดี"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ธนาคาร</label>
                <div className="relative">
                  <select
                    value={form.bankBrand}
                    onChange={(e) => setForm({ ...form, bankBrand: e.target.value })}
                    className={`${getInputClass()} appearance-none pr-10`}
                    style={{ borderColor: 'rgba(var(--color-primary-rgb), 0.3)', '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.4)' } as any}
                  >
                    {THAI_BANKS.map((b) => (
                      <option key={b.value} value={b.value}>{b.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                {form.bankBrand && (
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full shrink-0"
                      style={{ background: THAI_BANKS.find((b) => b.value === form.bankBrand)?.color ?? "#6b7280" }}
                    />
                    <span className="text-xs text-gray-500">{form.bankBrand}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Promptpay */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              <h2 className="font-semibold text-gray-900">พร้อมเพย์</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">เบอร์โทร / เลขบัตรประชาชน</label>
              <input
                value={form.promptpay}
                onChange={(e) => setForm({ ...form, promptpay: e.target.value })}
                className={getInputClass()}
                style={{ borderColor: 'rgba(var(--color-primary-rgb), 0.3)', '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.4)' } as any}
                placeholder="เช่น 0812345678"
              />
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 theme-button"
            >
              <Save className="w-4 h-4" />
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
            {saved && (
              <span className="text-sm text-green-600 font-medium animate-pulse">
                บันทึกเรียบร้อย
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
