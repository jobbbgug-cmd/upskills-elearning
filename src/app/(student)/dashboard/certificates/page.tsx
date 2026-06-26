import { cookies } from "next/headers";
import { Award, Download } from "lucide-react";
import CertificateCard from "./CertificateCard";

interface Cert {
  _id: string; title: string; description: string; code: string; issuedAt: string;
  courseId?: { title: string } | null;
  issuedBy?: { name: string } | null;
}

async function getCertificates(): Promise<Cert[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return [];
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/certificates`, {
    headers: { Cookie: `token=${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function CertificatesPage() {
  const certs = await getCertificates();

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-500" /> ใบรับรอง
        </h1>
        <p className="text-gray-500 text-sm mt-1">ใบรับรองความสำเร็จของคุณ</p>
      </div>

      {certs.length === 0 ? (
        <div className="text-center py-20 text-gray-300">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">ยังไม่มีใบรับรอง</p>
        </div>
      ) : (
        <div className="space-y-4">
          {certs.map((c) => (
            <CertificateCard key={c._id} cert={c} />
          ))}
        </div>
      )}
    </div>
  );
}
