import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import RolesContent from "./content";

export default async function RolesPage() {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "super_admin") {
    redirect("/super-admin");
  }

  return <RolesContent />;
}
