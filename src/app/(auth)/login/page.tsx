"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, X, CheckCircle2, Loader2 } from "lucide-react";

function ForgotPasswordModal({ onClose, loginEmail }: { onClose: () => void; loginEmail?: string }) {
  const [email,   setEmail]   = useState(loginEmail ?? "");
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "เกิดข้อผิดพลาด"); return; }
      setDone(true);
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        {done ? (
          <div className="flex flex-col items-center text-center py-2">
            <CheckCircle2 className="w-14 h-14 text-green-500 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">ส่งอีเมลแล้ว!</h3>
            <p className="text-gray-500 text-sm">หากอีเมลนี้มีในระบบ คุณจะได้รับลิงก์รีเซ็ตรหัสผ่านภายในไม่กี่นาที</p>
            <button onClick={onClose} className="mt-6 text-sm font-medium" style={{ color: "#7c3aed" }}>ปิด</button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-1">ลืมรหัสผ่าน?</h2>
            <p className="text-gray-400 text-sm mb-1">ระบุอีเมลที่ต้องการรับลิงก์รีเซ็ตรหัสผ่าน</p>
            {loginEmail && (
              <p className="text-xs text-gray-400 mb-5">
                บัญชีที่ลองเข้าสู่ระบบ: <span className="font-medium text-gray-600">{loginEmail}</span>
              </p>
            )}
            {!loginEmail && <div className="mb-5" />}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-3 bg-gray-100 rounded-2xl px-4 py-3.5">
                <Mail className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="อีเมลที่ต้องการรับลิงก์รีเซ็ตรหัสผ่าน"
                  className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                />
              </div>
              {email && (
                <p className="text-xs text-gray-500 px-1">
                  ลิงก์รีเซ็ตรหัสผ่านจะถูกส่งไปที่ <span className="font-semibold text-violet-600">{email}</span>
                </p>
              )}

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(90deg, #7c3aed 0%, #6d28d9 100%)" }}
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />กำลังส่ง...</> : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [form, setForm]               = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [showForgot, setShowForgot]   = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "เกิดข้อผิดพลาด");
      } else {
        router.push(data.user.role === "admin" ? "/admin" : "/dashboard");
        router.refresh();
      }
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} loginEmail={form.email || undefined} />}

      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Image src="/logo.png" alt="UPSkills" width={260} height={90} className="object-contain" priority />
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 leading-snug">
              เข้าสู่บัญชี UPSkills ของคุณ
            </h1>
            <p className="text-violet-500 text-sm mt-2">
              เรียนรู้คอร์สเรียนกับผู้เชี่ยวชาญจากหลากหลายสาขา
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 bg-gray-100 rounded-2xl px-4 py-3.5">
              <Mail className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="อีเมล"
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
              />
            </div>

            <div className="flex items-center gap-3 bg-gray-100 rounded-2xl px-4 py-3.5">
              <Lock className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="รหัสผ่าน"
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-sm font-medium"
                style={{ color: "#7c3aed" }}
              >
                ลืมรหัสผ่าน ?
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm transition-opacity disabled:opacity-60"
              style={{ background: "linear-gradient(90deg, #7c3aed 0%, #6d28d9 100%)" }}
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ยังไม่เป็นสมาชิก{" "}
            <Link href="/register" className="font-medium hover:underline" style={{ color: "#7c3aed" }}>
              คลิกเพื่อสมัครสมาชิก
            </Link>
          </p>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: "#7c3aed" }}>
            <ArrowLeft className="w-4 h-4" />
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    </>
  );
}
