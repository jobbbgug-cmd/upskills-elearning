"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <Image src="/logo.png" alt="UPSkills" width={260} height={90} className="object-contain" priority />
      </div>

      {/* Card */}
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
          {/* Email */}
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

          {/* Password */}
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

          {/* Forgot password */}
          <div className="flex justify-end">
            <Link href="#" className="text-sm font-medium" style={{ color: "#7c3aed" }}>
              ลืมรหัสผ่าน ?
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm transition-opacity disabled:opacity-60"
            style={{ background: "linear-gradient(90deg, #7c3aed 0%, #6d28d9 100%)" }}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        {/* Register link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          ยังไม่เป็นสมาชิก{" "}
          <Link href="/register" className="font-medium hover:underline" style={{ color: "#7c3aed" }}>
            คลิกเพื่อสมัครสมาชิก
          </Link>
        </p>
      </div>

      {/* Back to home */}
      <div className="text-center mt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium"
          style={{ color: "#7c3aed" }}
        >
          <ArrowLeft className="w-4 h-4" />
          กลับหน้าแรก
        </Link>
      </div>
    </div>
  );
}
