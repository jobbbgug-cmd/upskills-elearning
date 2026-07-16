import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import OnsiteCategoriesContent from "./content";

export default async function OnsiteCategoriesPage() {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "super_admin") redirect("/admin");

  return <OnsiteCategoriesContent />;
}
