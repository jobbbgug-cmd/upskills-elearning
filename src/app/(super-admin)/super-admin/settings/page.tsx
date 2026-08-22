"use client";
import { useState, useEffect } from "react";
import { Bell, Save, Mail, CheckCircle2, Send, AlertCircle, Wallet, Upload, X } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

const THAI_BANKS = [
  "ธนาคารกรุงเทพ",
  "ธนาคารไทยพาณิชย์",
  "ธนาคารกรุงไทย",
  "ธนาคารกสิกรไทย",
  "ธนาคารแห่งประเทศไทย",
  "ธนาคารเมืองไทย",
  "ธนาคารกรุงเทพ ประเทศไทย จำกัด (มหาชน)",
  "ธนาคารกรุงไทย จำกัด (มหาชน)",
  "ธนาคารกสิกรไทย จำกัด (มหาชน)",
  "ธนาคารกรุงศรีอยุธยา",
  "ธนาคารทหารไทย",
  "ธนาคารสยาม",
  "ธนาคารเอกชน",
  "ธนาคารคุณภาพ",
  "ธนาคารพัฒนาวิทยาลัยครู",
  "ธนาคารออมสิน",
  "ธนาคารอาคารสงเคราะห์",
];

const getInputClass = () =>
  "w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2";

export default function SettingsPage() {
  const [notifyEmail, setNotifyEmail] = useState("");
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [testing, setTesting]         = useState(false);
  const [testResult, setTestResult]   = useState<{ ok: boolean; msg: string } | null>(null);

  // Financial settings
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [qrCodePreview, setQrCodePreview] = useState<string>("");
  const [loadingFinancial, setLoadingFinancial] = useState(false);
  const [savingFinancial, setSavingFinancial] = useState(false);
  const [savedFinancial, setSavedFinancial] = useState(false);
  const [uploadingQR, setUploadingQR] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/super-admin/system-settings");
        const data = await res.json();
        setNotifyEmail(data.trialNotifyEmail || "upskillsth@gmail.com");
        setBankAccountNumber(data.bankAccountNumber || "");
        setBankAccountName(data.bankAccountName || "");
        setBankName(data.bankName || "");
        setQrCodeUrl(data.qrCodeUrl || "");
        setQrCodePreview(data.qrCodeUrl || "");
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
        setLoadingFinancial(false);
      }
    };
    loadSettings();
  }, []);

  const handleQRUpload = async (file: File) => {
    setUploadingQR(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      if (data.url) {
        setQrCodeUrl(data.url);
        setQrCodePreview(data.url);
        setQrCodeFile(null);
      }
    } catch (error) {
      console.error("QR upload failed:", error);
      alert("ไม่สามารถอัปโหลด QR Code ได้");
    } finally {
      setUploadingQR(false);
    }
  };

  const handleSaveFinancial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingFinancial(true);

    try {
      const updates = [
        { key: "bankAccountNumber", value: bankAccountNumber },
        { key: "bankAccountName", value: bankAccountName },
        { key: "bankName", value: bankName },
        { key: "qrCodeUrl", value: qrCodeUrl },
      ];

      for (const update of updates) {
        await fetch("/api/super-admin/system-settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(update),
        });
      }

      setSavingFinancial(false);
      setSavedFinancial(true);
      setTimeout(() => setSavedFinancial(false), 2500);
    } catch (error) {
      console.error("Failed to save financial settings:", error);
      alert("ไม่สามารถบันทึกข้อมูลได้");
      setSavingFinancial(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await fetch("/api/super-admin/test-email", { method: "POST" });
    const d = await res.json();
    setTestResult({
      ok: d.ok,
      msg: d.ok
        ? `ส่งสำเร็จ → SMTP: ${d.smtpUser} | NOTIFY: ${d.notifyEmail}`
        : `ส่งไม่ได้: ${d.error} | SMTP_USER: ${d.smtpUser} | SMTP_PASS: ${d.smtpPass}`,
    });
    setTesting(false);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/super-admin/system-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "trialNotifyEmail", value: notifyEmail }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ตั้งค่าทั่วไป</h1>
        <p className="text-gray-500 text-sm mt-1">จัดการการตั้งค่าระบบส่วนกลาง</p>
      </div>

      {/* Email notification */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          <h2 className="font-semibold text-gray-900">การแจ้งเตือนผ่านอีเมล</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          ระบบจะส่งอีเมลแจ้งเตือนไปยังที่อยู่นี้เมื่อมี:
        </p>
        <ul className="text-sm text-gray-500 mb-6 space-y-1.5 ml-1">
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--color-primary)' }} />คำขอทดลองใช้งานใหม่เข้ามา</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--color-primary)' }} />คำขอสมัครสมาชิกใหม่เข้ามา</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--color-primary)' }} />แจ้งเตือนการชำระเงินใหม่เข้ามา</li>
        </ul>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Mail className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />
                อีเมลรับแจ้งเตือนคำขอทดลองใช้งาน
              </label>
              <input
                type="email"
                required
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                placeholder="email@example.com"
                className={getInputClass()}
                style={{ '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.5)' } as any}
              />
              <p className="text-xs text-gray-400 mt-1.5">
                การแจ้งเตือนทั้งหมดจะถูกส่งไปยัง email นี้เพียงที่เดียว
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 theme-button"
              >
                <Save className="w-4 h-4" />
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
              <button
                type="button"
                onClick={handleTest}
                disabled={testing}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {testing ? "กำลังทดสอบ..." : "ทดสอบส่ง email"}
              </button>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" />บันทึกเรียบร้อย
                </span>
              )}
            </div>

            {testResult && (
              <div className={`flex items-start gap-2 text-sm p-3 rounded-xl mt-2 ${testResult.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {testResult.ok ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                <span>{testResult.msg}</span>
              </div>
            )}
          </form>
        )}
      </div>

      {/* Financial Settings */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-1">
          <Wallet className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          <h2 className="font-semibold text-gray-900">ข้อมูลการเงิน</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          ตั้งค่าข้อมูลบัญชีธนาคารและ QR Code สำหรับการชำระเงิน
        </p>

        {loadingFinancial ? (
          <LoadingSpinner />
        ) : (
          <form onSubmit={handleSaveFinancial} className="space-y-4">
            {/* Bank Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  ชื่อธนาคาร
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className={getInputClass()}
                  style={{ '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.5)' } as any}
                >
                  <option value="">เลือกธนาคาร</option>
                  {THAI_BANKS.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  ชื่อเจ้าของบัญชี
                </label>
                <input
                  type="text"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                  placeholder="เช่น UPSkills Co., Ltd."
                  className={getInputClass()}
                  style={{ '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.5)' } as any}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                เลขที่บัญชี
              </label>
              <input
                type="text"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                placeholder="เช่น 123-456-7890"
                className={getInputClass()}
                style={{ '--tw-ring-color': 'rgba(var(--color-primary-rgb), 0.5)' } as any}
              />
            </div>

            {/* QR Code Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                QR Code สำหรับการชำระเงิน
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6">
                {qrCodePreview ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <img src={qrCodePreview} alt="QR Code" className="w-32 h-32 object-contain" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">QR Code ที่ใช้งาน</p>
                          <p className="text-xs text-gray-500 mt-1">คลิกเพื่อเปลี่ยน QR Code ใหม่</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setQrCodePreview("");
                          setQrCodeFile(null);
                        }}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <label className="block cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setQrCodeFile(e.target.files[0]);
                            handleQRUpload(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                      <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium text-gray-700">
                        <Upload className="w-4 h-4" />
                        เปลี่ยน QR Code
                      </div>
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setQrCodeFile(e.target.files[0]);
                          handleQRUpload(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-6 h-6 text-gray-400" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">อัปโหลด QR Code</p>
                        <p className="text-xs text-gray-500 mt-0.5">คลิกเพื่อเลือกรูปภาพ</p>
                      </div>
                    </div>
                  </label>
                )}
              </div>
              {uploadingQR && (
                <p className="text-xs text-gray-500 mt-2">กำลังอัปโหลด...</p>
              )}
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <button
                type="submit"
                disabled={savingFinancial || uploadingQR}
                className="flex items-center gap-2 px-6 py-2.5 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 theme-button"
              >
                <Save className="w-4 h-4" />
                {savingFinancial ? "กำลังบันทึก..." : "บันทึก"}
              </button>
              {savedFinancial && (
                <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" />บันทึกเรียบร้อย
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
