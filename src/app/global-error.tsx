"use client";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="th">
      <body style={{ margin: 0, fontFamily: "sans-serif", backgroundColor: "#f9fafb" }}>
        <div style={{
          minHeight: "100vh", display: "flex", alignItems: "center",
          justifyContent: "center", padding: "16px",
        }}>
          <div style={{
            background: "#fff", borderRadius: "24px", border: "1px solid #f3f4f6",
            padding: "40px", maxWidth: "420px", width: "100%", textAlign: "center",
          }}>
            <div style={{
              width: 64, height: 64, background: "#fef2f2", borderRadius: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px",
            }}>
              <AlertTriangle style={{ width: 32, height: 32, color: "#ef4444" }} />
            </div>

            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
              เกิดข้อผิดพลาดบางอย่าง
            </h1>
            <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, marginBottom: 32 }}>
              ระบบพบปัญหาขณะโหลดหน้านี้<br />
              ลองรีเฟรชหน้าหรือกลับไปหน้าหลัก
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={reset}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 20px", background: "#4f46e5", color: "#fff",
                  fontSize: 14, fontWeight: 600, border: "none",
                  borderRadius: 12, cursor: "pointer",
                }}
              >
                ลองใหม่
              </button>
              <a
                href="/"
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 20px", background: "#f3f4f6", color: "#374151",
                  fontSize: 14, fontWeight: 600, borderRadius: 12,
                  textDecoration: "none",
                }}
              >
                หน้าหลัก
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
