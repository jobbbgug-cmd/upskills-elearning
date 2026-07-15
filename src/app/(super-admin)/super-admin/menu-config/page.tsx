import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import MenuConfigContent from "./content";

export default async function MenuConfigPage() {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "super_admin") {
    redirect("/super-admin");
  }

  return <MenuConfigContent />;
}
