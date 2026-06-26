"use client";
import { Award, Printer, Calendar } from "lucide-react";

interface Cert {
  _id: string; title: string; description: string; code: string; issuedAt: string;
  courseId?: { title: string } | null;
  issuedBy?: { name: string } | null;
}

export default function CertificateCard({ cert }: { cert: Cert }) {
  const handlePrint = () => {
    const date = new Date(cert.issuedAt).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html lang="th"><head>
      <meta charset="UTF-8" />
      <title>ใบรับรอง — ${cert.title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: "Sarabun", "Noto Sans Thai", sans-serif; background: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
        .cert { width: 800px; min-height: 550px; border: 12px double #b45309; padding: 48px 56px; text-align: center; position: relative; background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fffbeb 100%); }
        .cert::before { content: ""; position: absolute; inset: 8px; border: 2px solid #d97706; pointer-events: none; }
        .logo { font-size: 28px; margin-bottom: 4px; }
        .star { color: #f59e0b; font-size: 22px; letter-spacing: 6px; margin: 8px 0; }
        .cert-label { font-size: 13px; letter-spacing: 4px; color: #92400e; text-transform: uppercase; margin-bottom: 20px; }
        h1 { font-size: 32px; font-weight: 900; color: #78350f; margin-bottom: 20px; line-height: 1.3; }
        .to-label { font-size: 13px; color: #a16207; margin-bottom: 6px; letter-spacing: 1px; }
        .student-name { font-size: 26px; font-weight: 700; color: #1c1917; border-bottom: 2px solid #b45309; display: inline-block; padding: 0 32px 6px; margin-bottom: 20px; }
        .desc { font-size: 14px; color: #57534e; line-height: 1.7; max-width: 500px; margin: 0 auto 28px; }
        .course { font-size: 15px; color: #b45309; font-weight: 600; margin-bottom: 28px; }
        .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; }
        .date-box, .issuer-box { text-align: center; }
        .date-box p, .issuer-box p { font-size: 12px; color: #92400e; }
        .date-box strong, .issuer-box strong { font-size: 13px; color: #78350f; display: block; margin-top: 4px; border-top: 1px solid #b45309; padding-top: 6px; min-width: 160px; }
        .code { font-size: 10px; color: #a8a29e; position: absolute; bottom: 16px; right: 24px; font-family: monospace; }
        @media print { body { padding: 0; } .cert { width: 100%; border: none; } }
      </style>
    </head><body>
      <div class="cert">
        <div class="logo">🏆</div>
        <div class="star">✦ ✦ ✦</div>
        <div class="cert-label">Certificate of Completion</div>
        <h1>${cert.title}</h1>
        <div class="to-label">มอบให้แก่</div>
        <div class="student-name">นักเรียน</div>
        ${cert.description ? `<div class="desc">${cert.description}</div>` : ""}
        ${cert.courseId ? `<div class="course">คอร์ส: ${cert.courseId.title}</div>` : ""}
        <div class="footer">
          <div class="date-box">
            <p>วันที่ออกใบรับรอง</p>
            <strong>${date}</strong>
          </div>
          <div class="issuer-box">
            <p>ผู้ออกใบรับรอง</p>
            <strong>${cert.issuedBy?.name ?? "ผู้ดูแลระบบ"}</strong>
          </div>
        </div>
        <div class="code">${cert.code}</div>
      </div>
      <script>window.onload = () => { window.print(); }</script>
    </body></html>`);
    win.document.close();
  };

  return (
    <div className="bg-white rounded-2xl border border-amber-100 p-5 flex items-center gap-4">
      <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
        <Award className="w-6 h-6 text-amber-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900">{cert.title}</p>
        {cert.courseId && <p className="text-xs text-indigo-500 mt-0.5">{cert.courseId.title}</p>}
        <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
          <Calendar className="w-3 h-3" />
          {new Date(cert.issuedAt).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })}
          <span className="ml-2 font-mono text-gray-300">{cert.code}</span>
        </div>
      </div>
      <button onClick={handlePrint}
        className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-700 text-sm font-semibold rounded-xl hover:bg-amber-100 transition-colors shrink-0">
        <Printer className="w-4 h-4" /> พิมพ์ / PDF
      </button>
    </div>
  );
}
