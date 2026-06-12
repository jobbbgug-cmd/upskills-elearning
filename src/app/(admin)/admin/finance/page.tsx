"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, Save, QrCode, Building2, CreditCard, Phone, ChevronDown } from "lucide-react";

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

const inputClass =
  "w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500";

export default function FinancePage() {
  const [form, setForm]       = useState<FinanceForm>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved]     = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const qrRef   = useRef<HTMLInputElement>(null);
  const router  = useRouter();

  useEffect(() => {
    const init = async () => {
      const meRes = await fetch("/api/auth/me");
      const me    = await meRes.json();
      if (!me.user || me.user.role !== "admin") {
        router.replace("/");
        return;
      }
      setAuthorized(true);
      const res = await fetch("/api/admin/finance");
      const d   = await res.json();
      if (d && !d.error) {
        setForm({
          bankName:    d.bankName    ?? "",
          bankAccount: d.bankAccount ?? "",
          bankBrand:   d.bankBrand   ?? "",
          promptpay:   d.promptpay   ?? "",
          qrCodeImage: d.qrCodeImage ?? "",
        });
      }
      setLoading(false);
    };
    init();
  }, [router]);

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
    setSaving(true);
    const res = await fetch("/api/admin/finance", {
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

  if (!authorized || loading) return <div className="text-center py-20 text-gray-400">กำลังโหลด...</div>;

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ข้อมูลทางการเงิน</h1>
        <p className="text-gray-500 text-sm mt-1">ข้อมูลบัญชีและ QR Code ที่นักเรียนเห็นเมื่อจองคอร์ส</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* QR Code */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-500" />
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
                className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-indigo-300 rounded-xl text-sm text-indigo-600 hover:border-indigo-500 hover:bg-indigo-50 transition-colors disabled:opacity-50 w-full justify-center"
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
            <Building2 className="w-5 h-5 text-indigo-500" />
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
                className={inputClass}
                placeholder="เช่น 000-0-00000-0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อบัญชี</label>
              <input
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                className={inputClass}
                placeholder="เช่น นาย สมชาย ใจดี"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ธนาคาร</label>
              <div className="relative">
                <select
                  value={form.bankBrand}
                  onChange={(e) => setForm({ ...form, bankBrand: e.target.value })}
                  className={`${inputClass} appearance-none pr-10`}
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
            <Phone className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-gray-900">พร้อมเพย์</h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">เบอร์โทร / เลขบัตรประชาชน</label>
            <input
              value={form.promptpay}
              onChange={(e) => setForm({ ...form, promptpay: e.target.value })}
              className={inputClass}
              placeholder="เช่น 0812345678"
            />
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
          {saved && (
            <span className="text-sm text-green-600 font-medium animate-pulse">
              บันทึกเรียบร้อย ✓
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
