import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "super_admin") {
    redirect("/login");
  }

  return children;
}
