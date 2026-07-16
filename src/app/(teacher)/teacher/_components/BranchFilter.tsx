"use client";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";

interface Branch { _id: string; name: string; }

export default function BranchFilter({ branches, selected }: { branches: Branch[]; selected: string }) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-2">
      <Building2 className="w-4 h-4 text-violet-500 shrink-0" />
      <select
        value={selected}
        onChange={(e) => router.push(`/admin?branchId=${e.target.value}`)}
        className="text-sm border border-violet-200 bg-violet-50 text-violet-800 font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer"
      >
        <option value="all">ทุกสาขา</option>
        {branches.map((b) => (
          <option key={b._id} value={b._id}>{b.name}</option>
        ))}
      </select>
    </div>
  );
}
