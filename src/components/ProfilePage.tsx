"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Camera, CheckCircle2, Eye, EyeOff, Loader2, Lock, User } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin:       "Admin",
  owner:       "Owner",
  teacher:     "ครู / อาจารย์",
  student:     "นักเรียน",
};

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  institutionId?: { _id: string; name: string } | null;
  createdAt?: string;
}

export default function ProfilePage() {
  const [user,         setUser]         = useState<UserProfile | null>(null);
  const [name,         setName]         = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [uploading,    setUploading]    = useState(false);
  const [savingInfo,   setSavingInfo]   = useState(false);
  const [infoSuccess,  setInfoSuccess]  = useState(false);
  const [infoError,    setInfoError]    = useState("");

  const [currentPw,  setCurrentPw]  = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [confirmPw,  setConfirmPw]  = useState("");
  const [showCur,    setShowCur]    = useState(false);
  const [showNew,    setShowNew]    = useState(false);
  const [showCon,    setShowCon]    = useState(false);
  const [savingPw,   setSavingPw]   = useState(false);
  const [pwSuccess,  setPwSuccess]  = useState(false);
  const [pwError,    setPwError]    = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d.user) {
        setUser(d.user);
        setName(d.user.name ?? "");
        setProfileImage(d.user.profileImage ?? "");
      }
    });
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setProfileImage(data.url);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoError(""); setInfoSuccess(false);
    if (!name.trim()) { setInfoError("กรุณากรอกชื่อ"); return; }
    setSavingInfo(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, profileImage }),
      });
      const data = await res.json();
      if (!res.ok) { setInfoError(data.error ?? "เกิดข้อผิดพลาด"); return; }
      setUser(data.user);
      setInfoSuccess(true);
      setTimeout(() => setInfoSuccess(false), 3000);
    } catch {
      setInfoError("เกิดข้อผิดพลาด");
    } finally {
      setSavingInfo(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(""); setPwSuccess(false);
    if (!currentPw || !newPw || !confirmPw) { setPwError("กรุณากรอกข้อมูลให้ครบ"); return; }
    if (newPw.length < 6) { setPwError("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร"); return; }
    if (newPw !== confirmPw) { setPwError("รหัสผ่านใหม่ไม่ตรงกัน"); return; }
    setSavingPw(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) { setPwError(data.error ?? "เกิดข้อผิดพลาด"); return; }
      setPwSuccess(true);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(() => setPwSuccess(false), 3000);
    } catch {
      setPwError("เกิดข้อผิดพลาด");
    } finally {
      setSavingPw(false);
    }
  };

  if (!user) return <div className="text-center py-20 text-gray-400">กำลังโหลด...</div>;

  const initials = user.name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) ?? "U";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">โปรไฟล์ของฉัน</h1>
        <p className="text-gray-500 text-sm mt-1">จัดการข้อมูลส่วนตัวและความปลอดภัยของบัญชี</p>
      </div>

      {/* Profile Info Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-4 h-4 text-gray-500" />
          <h2 className="text-base font-semibold text-gray-800">ข้อมูลส่วนตัว</h2>
        </div>

        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-violet-100 flex items-center justify-center border-4 border-white shadow-md">
              {profileImage ? (
                <Image src={profileImage} alt={user.name} width={96} height={96} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-violet-600">{initials}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-violet-700 transition-colors disabled:opacity-60"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>
        </div>

        <form onSubmit={handleSaveInfo} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อ-นามสกุล</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            />
          </div>

          {/* Email (readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">อีเมล</label>
            <input
              type="email"
              value={user.email}
              readOnly
              className="w-full border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ประเภทบัญชี</label>
            <div className="border border-gray-100 rounded-xl px-4 py-2.5 bg-gray-50">
              <span className="text-sm text-gray-500">{ROLE_LABELS[user.role] ?? user.role}</span>
            </div>
          </div>

          {/* Institution — shown for non-super_admin roles only */}
          {user.role !== "super_admin" && user.institutionId?.name && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">สถาบัน</label>
              <div className="border border-gray-100 rounded-xl px-4 py-2.5 bg-gray-50">
                <span className="text-sm text-gray-500">{user.institutionId.name}</span>
              </div>
            </div>
          )}

          {infoError && <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl">{infoError}</p>}

          <button
            type="submit"
            disabled={savingInfo}
            className="w-full py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(90deg,#7c3aed,#6d28d9)" }}
          >
            {savingInfo ? <><Loader2 className="w-4 h-4 animate-spin" />กำลังบันทึก...</> :
             infoSuccess ? <><CheckCircle2 className="w-4 h-4" />บันทึกแล้ว!</> : "บันทึกข้อมูล"}
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock className="w-4 h-4 text-gray-500" />
          <h2 className="text-base font-semibold text-gray-800">เปลี่ยนรหัสผ่าน</h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          {[
            { label: "รหัสผ่านปัจจุบัน", value: currentPw, set: setCurrentPw, show: showCur, toggle: () => setShowCur((v) => !v) },
            { label: "รหัสผ่านใหม่ (อย่างน้อย 6 ตัว)", value: newPw, set: setNewPw, show: showNew, toggle: () => setShowNew((v) => !v) },
            { label: "ยืนยันรหัสผ่านใหม่", value: confirmPw, set: setConfirmPw, show: showCon, toggle: () => setShowCon((v) => !v) },
          ].map(({ label, value, set, show, toggle }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <div className="flex items-center border border-gray-200 rounded-xl px-4 py-2.5 bg-white gap-2">
                <input
                  type={show ? "text" : "password"}
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className="flex-1 text-sm text-gray-900 outline-none bg-transparent"
                  placeholder="••••••••"
                />
                <button type="button" onClick={toggle} className="text-gray-400 hover:text-gray-600">
                  {show ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}

          {pwError && <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl">{pwError}</p>}

          <button
            type="submit"
            disabled={savingPw}
            className="w-full py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(90deg,#7c3aed,#6d28d9)" }}
          >
            {savingPw ? <><Loader2 className="w-4 h-4 animate-spin" />กำลังบันทึก...</> :
             pwSuccess ? <><CheckCircle2 className="w-4 h-4" />เปลี่ยนรหัสผ่านแล้ว!</> : "เปลี่ยนรหัสผ่าน"}
          </button>
        </form>
      </div>
    </div>
  );
}
