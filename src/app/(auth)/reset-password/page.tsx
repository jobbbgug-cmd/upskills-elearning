"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, Eye, EyeOff, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

function ResetPasswordForm() {
  const params   = useSearchParams();
  const router   = useRouter();
  const token    = params.get("token") ?? "";

  const [password,   setPassword]   = useState("");
  const [confirm,    setConfirm]    = useState("");
  const [showPw,     setShowPw]     = useState(false);
  const [showCf,     setShowCf]     = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [done,       setDone]       = useState(false);

  useEffect(() => {
    if (!token) setError("ลิงก์ไม่ถูกต้อง กรุณาขอรีเซ็ตรหัสผ่านใหม่");
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"); return; }
    if (password !== confirm) { setError("รหัสผ่านไม่ตรงกัน"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "เกิดข้อผิดพลาด"); return; }
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="flex justify-center mb-8">
        <Image src="/logo.png" alt="UPSkills" width={260} height={90} className="object-contain" priority />
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-10">
        {done ? (
          <div className="flex flex-col items-center text-center py-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">เปลี่ยนรหัสผ่านสำเร็จ!</h2>
            <p className="text-gray-500 text-sm">กำลังพาคุณไปหน้าเข้าสู่ระบบ...</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">ตั้งรหัสผ่านใหม่</h1>
              <p className="text-gray-400 text-sm mt-2">กรุณากรอกรหัสผ่านใหม่ของคุณ</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-3 bg-gray-100 rounded-2xl px-4 py-3.5">
                <Lock className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัว)"
                  className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-400 hover:text-gray-600">
                  {showPw ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center gap-3 bg-gray-100 rounded-2xl px-4 py-3.5">
                <Lock className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  type={showCf ? "text" : "password"}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="ยืนยันรหัสผ่านใหม่"
                  className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                />
                <button type="button" onClick={() => setShowCf(!showCf)} className="text-gray-400 hover:text-gray-600">
                  {showCf ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm transition-opacity disabled:opacity-60"
                style={{ background: "linear-gradient(90deg, #7c3aed 0%, #6d28d9 100%)" }}
              >
                {loading ? "กำลังบันทึก..." : "ยืนยันรหัสผ่านใหม่"}
              </button>
            </form>
          </>
        )}
      </div>

      <div className="text-center mt-6">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: "#7c3aed" }}>
          <ArrowLeft className="w-4 h-4" />กลับหน้าเข้าสู่ระบบ
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
